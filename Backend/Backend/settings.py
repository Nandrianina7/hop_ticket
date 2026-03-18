import os
from pathlib import Path
from decouple import config
from datetime import timedelta
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-df!t8x*&jli#t^iv__zjj4klghp75@)y&sqsf2mrv56em$22dn'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['192.168.88.19', '127.0.0.1', "192.168.43.177", '192.168.88.20', '192.168.1.133']

CORS_ALLOWED_ORIGINS = [
  "http://192.168.88.19:8000", 
  "http://192.168.88.19:8081", 
  "http://192.168.88.19:5173", 
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8000",
  "http://192.168.43.177:8000",
  "http://192.168.43.177:5173",
  "http://192.168.88.20:8081",
  "http://192.168.88.20:8000",
  "http://192.168.1.133:5173",
  "http://192.168.1.133:8000",
  "http://192.168.1.133:8081"
]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True 
FCM_CLOUD_FUNCTION_KEY = "eO-a5fNII0bZA-ZAvo9a-J5kUVukKkK95qKN1kk8JXY"


CSRF_TRUSTED_ORIGINS = [
  "http://192.168.88.19:8000", 
  "http://192.168.88.19:8081", 
  "http://192.168.88.19:5173",
  "http://192.168.43.177:8000",
  "http://192.168.43.177:5173",
  "http://192.168.88.20:8081",
  "http://192.168.1.133:5173",
  "http://192.168.1.133:8000",
  "http://192.168.1.133:8081"
]

# Allow CSRF cookie to be sent cross-origin
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=2),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True, 
}

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'accounts',  
    'api',
    'cinema',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders', 
    'rest_framework_simplejwt.token_blacklist',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Backend.urls'

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

WSGI_APPLICATION = 'Backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

BASE_DIR = Path(__file__).resolve().parent.parent
engine = config("DB_ENGINE", default="mysql")

ENGINE_MAP = {
    'mysql': 'django.db.backends.mysql',
    'postgresql': 'django.db.backends.postgresql',
    'sqlite3': 'django.db.backends.sqlite3',
}

# DATABASES = {
#     'default': {
#         'ENGINE': ENGINE_MAP.get(engine, 'django.db.backends.mysql'),
#         'NAME': config('DB_NAME', default='ticket_manager'),
#         'USER': config('DB_USER', default='root'),
#         'PASSWORD': config('DB_PASSWORD', default=''),
#         'HOST': config('DB_HOST', default='localhost'),
#         'PORT': config('DB_PORT', default='3306'),
#     }
# }

DATABASES = {
    'default': {
    'ENGINE': ENGINE_MAP.get(engine, 'django.db.backends.postgresql'),
    'NAME': config('DB_NAME', default='ticket_manager'),
    'USER': config('DB_USER', default='postgres'),
    'PASSWORD': config('DB_PASSWORD', default=''),
    'HOST': config('DB_HOST', default='localhost'),
    'PORT': config('DB_PORT', default='5432'),
    }
}



AUTH_USER_MODEL = 'accounts.Admin'



# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.TokenAuthentication',
        "api.auth.UUIDAuthentication",

    )
}

# settings.py
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',       # pour superusers/admins
    'accounts.backends.EmailBackend',                  # ton backend par email
]

