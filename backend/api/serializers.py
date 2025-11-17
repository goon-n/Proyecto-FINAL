# api/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User, Group
from django.db import transaction
from .models import Perfil, Socio, Clase, Proveedor, Accesorios, Compra, ItemCompra
from cuotas_mensuales.models import Plan, CuotaMensual, HistorialPago
from movimiento_caja.models import Caja, MovimientoDeCaja
from datetime import timedelta
from django.utils import timezone
import re



class CustomUserSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(source='perfil.rol', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'rol']



class SocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Socio
        fields = '__all__'



class ClaseSerializer(serializers.ModelSerializer):
    entrenador = CustomUserSerializer(read_only=True)
    socios = CustomUserSerializer(many=True, read_only=True)
    class Meta:
        model = Clase
        fields = '__all__'



class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'
    
    def validate_nombre(self, value):
        """Validar que el nombre solo contenga letras y espacios"""
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre es requerido")
        
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', value):
            raise serializers.ValidationError("El nombre solo puede contener letras y espacios")
        
        return value.strip()
    
    def validate_telefono(self, value):
        """Validar formato y unicidad de teléfono"""
        if value:
            # Validar formato
            if not re.match(r'^[\d\s\-\+\(\)]+$', value):
                raise serializers.ValidationError(
                    "El teléfono solo puede contener números, espacios, guiones, paréntesis y +"
                )
            
            digitos = re.sub(r'[^\d]', '', value)
            
            if len(digitos) < 8:
                raise serializers.ValidationError("El teléfono debe tener al menos 8 dígitos")
            
            if len(digitos) > 15:
                raise serializers.ValidationError("El teléfono no puede tener más de 15 dígitos")
            
            # Validar unicidad (que no exista en otro proveedor)
            proveedor_id = self.instance.id if self.instance else None
            existe = Proveedor.objects.filter(telefono=value).exclude(id=proveedor_id).exists()
            if existe:
                raise serializers.ValidationError("Este teléfono ya está registrado para otro proveedor")
        
        return value
    
    def validate_email(self, value):
        """Validar formato y unicidad de email"""
        if value:
            # Validar formato
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', value):
                raise serializers.ValidationError("El formato del email es inválido")
            
            # Validar unicidad (que no exista en otro proveedor)
            proveedor_id = self.instance.id if self.instance else None
            existe = Proveedor.objects.filter(email=value).exclude(id=proveedor_id).exists()
            if existe:
                raise serializers.ValidationError("Este email ya está registrado para otro proveedor")
        
        return value



class AccesoriosSerializer(serializers.ModelSerializer):
    proveedor = serializers.PrimaryKeyRelatedField(queryset=Proveedor.objects.all())
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    
    class Meta:
        model = Accesorios
        fields = '__all__'
    
    def validate_nombre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre es requerido")
        return value.strip()
    
    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser negativo")
        return value



class ItemCompraSerializer(serializers.ModelSerializer):
    accesorio = serializers.PrimaryKeyRelatedField(queryset=Accesorios.objects.all())
    accesorio_nombre = serializers.CharField(source='accesorio.nombre', read_only=True)
    
    class Meta:
        model = ItemCompra
        fields = ['id', 'accesorio', 'accesorio_nombre', 'cantidad', 'precio_unitario']



class CompraSerializer(serializers.ModelSerializer):
    proveedor = serializers.PrimaryKeyRelatedField(queryset=Proveedor.objects.filter(activo=True))
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    items = ItemCompraSerializer(many=True)

    class Meta:
        model = Compra
        fields = ['id', 'proveedor', 'proveedor_nombre', 'fecha', 'total', 'notas', 'items']

    def validate_items(self, value):
        """Validar que hay al menos un item y que todos los datos son válidos"""
        if not value:
            raise serializers.ValidationError("Debe incluir al menos un ítem en la compra")
        
        for item in value:
            if item.get('cantidad', 0) <= 0:
                raise serializers.ValidationError("La cantidad debe ser mayor a 0")
            if item.get('precio_unitario', 0) <= 0:
                raise serializers.ValidationError("El precio unitario debe ser mayor a 0")
                
        return value

    def validate_total(self, value):
        """Validar que el total sea positivo"""
        if value <= 0:
            raise serializers.ValidationError("El total debe ser mayor a 0")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        compra = Compra.objects.create(**validated_data)
        
        for item_data in items_data:
            item = ItemCompra.objects.create(compra=compra, **item_data)
            # Actualizar stock automáticamente
            accesorio = item.accesorio
            accesorio.stock += item.cantidad
            accesorio.save()
        
        return compra

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Actualizar campos básicos
        instance.proveedor = validated_data.get('proveedor', instance.proveedor)
        instance.total = validated_data.get('total', instance.total)
        instance.notas = validated_data.get('notas', instance.notas)
        instance.save()
        
        # Si se proporcionan nuevos items, reemplazar completamente
        if items_data is not None:
            # Revertir stock de items anteriores
            for item in instance.items.all():
                accesorio = item.accesorio
                accesorio.stock -= item.cantidad
                accesorio.save()
            
            # Eliminar items anteriores
            instance.items.all().delete()
            
            # Crear nuevos items y actualizar stock
            for item_data in items_data:
                item = ItemCompra.objects.create(compra=instance, **item_data)
                accesorio = item.accesorio
                accesorio.stock += item.cantidad
                accesorio.save()
        
        return instance



# 🔥 SERIALIZER PARA REGISTRO CON PAGO
class RegisterWithPaymentSerializer(serializers.Serializer):
    """
    Serializer para registro de socio con pago de cuota inicial
    """
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField()
    nombre = serializers.CharField(max_length=255)
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    plan_name = serializers.CharField()
    plan_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    card_last4 = serializers.CharField(max_length=4)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("El nombre de usuario ya existe.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("El email ya está registrado.")
        return value

    def validate_plan_name(self, value):
        try:
            Plan.objects.get(nombre=value, activo=True)
        except Plan.DoesNotExist:
            raise serializers.ValidationError("El plan seleccionado no existe o no está activo.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        """
        Crea usuario, perfil, cuota mensual, historial de pago Y movimiento de caja
        """
        print(f"\n{'='*60}")
        print(f"🔄 INICIANDO REGISTRO DE NUEVO SOCIO")
        print(f"{'='*60}")
        
        # 1. Obtener el plan
        plan = Plan.objects.get(nombre=validated_data['plan_name'], activo=True)
        print(f"✅ Plan encontrado: {plan.nombre} - ${plan.precio}")

        # 2. Crear usuario
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email'],
            first_name=validated_data['nombre'],
            is_active=True
        )
        print(f"✅ Usuario creado: {user.username}")

        # 3. Asignar grupo 'socio'
        grupo_socio, _ = Group.objects.get_or_create(name='socio')
        user.groups.add(grupo_socio)
        print(f"✅ Grupo 'socio' asignado")

        # 4. Crear perfil (sin nombre ni telefono si el modelo no los tiene)
        perfil = Perfil.objects.create(
            user=user,
            rol='socio'
        )
        print(f"✅ Perfil creado con rol: {perfil.rol}")

        # 5. Crear cuota mensual
        fecha_inicio = timezone.now().date()
        fecha_vencimiento = fecha_inicio + timedelta(days=30)

        cuota = CuotaMensual.objects.create(
            socio=user,
            plan=plan,
            fecha_inicio=fecha_inicio,
            fecha_vencimiento=fecha_vencimiento,
            estado='activa',
            tarjeta_ultimos_4=validated_data['card_last4']
        )
        print(f"✅ Cuota mensual creada: ID #{cuota.id}")
        print(f"   - Plan: {plan.nombre}")
        print(f"   - Precio: ${plan.precio}")
        print(f"   - Vencimiento: {cuota.fecha_vencimiento}")

        # 6. Registrar pago en historial
        historial_pago = HistorialPago.objects.create(
            cuota=cuota,
            monto=validated_data['plan_price'],
            metodo_pago='tarjeta',
            referencia=f"Pago inicial - Tarjeta ****{validated_data['card_last4']}",
            notas=f"Registro nuevo socio - Plan: {plan.nombre}"
        )
        print(f"✅ Historial de pago creado: ID #{historial_pago.id}")
        print(f"   - Monto: ${historial_pago.monto}")

        # 7. 🔥 REGISTRAR INGRESO EN CAJA
        movimiento_id = None
        try:
            caja_abierta = Caja.objects.filter(estado='ABIERTA').first()
            
            if caja_abierta:
                print(f"✅ Caja abierta encontrada: ID #{caja_abierta.id}")
                
                # Crear movimiento de ingreso en caja
                movimiento = MovimientoDeCaja.objects.create(
                    caja=caja_abierta,
                    tipo='ingreso',
                    monto=validated_data['plan_price'],
                    tipo_pago='transferencia',  # Pagos con tarjeta = transferencia
                    descripcion=f"Pago cuota mensual - {validated_data['nombre']} - Plan: {plan.nombre}",
                    creado_por=perfil
                )
                movimiento_id = movimiento.id
                
                # Vincular el movimiento de caja con el historial de pago
                historial_pago.movimiento_caja_id = movimiento.id
                historial_pago.save()
                
                print(f"✅ Movimiento de caja creado: ID #{movimiento.id}")
                print(f"✅ Historial de pago vinculado con movimiento #{movimiento.id}")
            else:
                print("⚠️  NO HAY CAJA ABIERTA")
                print("⚠️  El pago se registró en HistorialPago pero NO en caja")
                
        except Exception as e:
            print(f"❌ ERROR al crear movimiento de caja: {str(e)}")
            import traceback
            traceback.print_exc()
            # No hacemos raise para no bloquear el registro
            # El pago queda registrado en HistorialPago pero sin vincular a caja

        print(f"\n{'='*60}")
        print(f"✅ REGISTRO COMPLETADO EXITOSAMENTE")
        print(f"{'='*60}\n")

        return {
            'user': user,
            'perfil': perfil,
            'cuota': cuota,
            'historial_pago': historial_pago,
            'movimiento_caja_id': movimiento_id,
            'success': True
        }
