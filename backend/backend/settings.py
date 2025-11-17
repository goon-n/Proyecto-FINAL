from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-q-dty3%a2u!@kp4wv!_vpkf303h-*8j)=tgz#55qq%u9v4m0f!'
DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "192.168.0.10"]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',  # necesario para CORS
    'rest_framework',
    'rest_framework_simplejwt',
    'api',
    'movimiento_caja',
    'turnos',
    'cuotas_mensuales',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # debe ir primero
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ---- CORS / sesiones ----
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # URL de tu frontend Vite
    "http://127.0.0.1:5173",
]

# Para REST Framework y autenticación de sesión
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    # Tu configuración de permisos (ej: IsAuthenticated o AllowAny por defecto)
    # 'DEFAULT_PERMISSION_CLASSES': [
    #     'rest_framework.permissions.IsAuthenticated',
    # ],
}
from datetime import timedelta

SIMPLE_JWT = {
    # Duración del Token de Acceso (ej: 1 hora)
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60), 
    
    # Duración del Token de Refresco (ej: 1 día o más)
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1), 
    
    # Algoritmo de firmado (HS256 es el más común)
    "ALGORITHM": "HS256", 
    
    # Usa tu SECRET_KEY de Django
    "SIGNING_KEY": 'django-insecure-!+)x#(6_%6%!w!_s^)#cfq-s68-t#5njg)yt$noy5n)h$#&9m*', 
    
    # Prefijo usado en el encabezado Authorization: Bearer <token>
    "AUTH_HEADER_TYPES": ("Bearer",), 
}
ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

#DATABASES = {
#    'default': {
#        'ENGINE': 'django.db.backends.sqlite3',
#        'NAME': BASE_DIR / 'db.sqlite3',
#    }
#}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'core',
        'USER': 'root',
        'PASSWORD': 'root',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}



AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-ar'
TIME_ZONE = 'America/Argentina/Buenos_Aires'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---- Cookies de sesión ----
SESSION_COOKIE_DOMAIN = None
# En desarrollo mantenemos SECURE=False, en producción debe ser True (HTTPS)
SESSION_COOKIE_SECURE = False  # True solo si usas HTTPS
# No permitir que JS acceda al sessionid: proteger contra robo por XSS.
# Si tu frontend necesita información, usa endpoints que devuelvan datos
# y no expongas `sessionid` a JavaScript. Para CSRF la cookie `csrftoken`
# debe seguir siendo accesible desde JS (CSRF_COOKIE_HTTPONLY = False).
SESSION_COOKIE_HTTPONLY = False
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_SAMESITE = "Lax"
CORS_ALLOW_CREDENTIALS = True

SESSION_COOKIE_SAMESITE = "Lax"  # Si frontend y backend en mismo dominio
SESSION_COOKIE_SECURE = False    # Si estás en http en local

CSRF_COOKIE_HTTPONLY = False


CSRF_TRUSTED_ORIGINS = [ "http://localhost:5173", "http://127.0.0.1:5173", ]

CSRF_COOKIE_HTTPONLY = False
CSRF_USE_SESSIONS = False