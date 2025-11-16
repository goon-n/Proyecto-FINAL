// src/components/usuarios/SelectorRol.jsx

import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";

export const SelectorRol = ({ 
  rolActual, 
  rolEditado, 
  onCambiar, 
  onGuardar, 
  guardando 
}) => {
  return (
    <div className="flex gap-2 items-center">
      <Select defaultValue={rolActual} onValueChange={onCambiar}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="socio">Socio</SelectItem>
          <SelectItem value="entrenador">Entrenador</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      
      {rolEditado && (
        <Button onClick={onGuardar} size="sm" disabled={guardando}>
          {guardando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="mr-1 h-4 w-4" />
              Guardar
            </>
          )}
        </Button>
      )}
    </div>
  );
};