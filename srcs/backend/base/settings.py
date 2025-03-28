from pathlib import Path
from datetime import timedelta
from decouple import config
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]

REST_FRAMEWORK = {
	"DEFAULT_AUTHENTICATION_CLASSES": (
		"rest_framework_simplejwt.authentication.JWTAuthentication",
	),
	"DEFAULT_PERMISSION_CLASSES": [
		"rest_framework.permissions.IsAuthenticated",
	],
}

SIMPLE_JWT = {
	"ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
	"REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}


# Application definition

INSTALLED_APPS = [
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'app',
	'channels',
	'allauth',
	'allauth.account',
	'allauth.socialaccount',
	'allauth.socialaccount.providers.google',
	'allauth.socialaccount.providers.oauth2',
]

SITE_ID = 1

MIDDLEWARE = [
	'django.middleware.security.SecurityMiddleware',
	'whitenoise.middleware.WhiteNoiseMiddleware', 
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
	'django.middleware.clickjacking.XFrameOptionsMiddleware',
	'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'base.urls'

TEMPLATES = [
	{
		'BACKEND': 'django.template.backends.django.DjangoTemplates',
		'DIRS': [os.path.join(BASE_DIR, 'templates')],
		'APP_DIRS': True,
		'OPTIONS': {
			'context_processors': [
				'django.template.context_processors.debug',
				'django.template.context_processors.request',
				'django.template.context_processors.media',
				'django.contrib.auth.context_processors.auth',
				'django.contrib.messages.context_processors.messages',
			],
		},
	},
]

WSGI_APPLICATION = 'base.wsgi.application'
ASGI_APPLICATION = 'base.asgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
	'default': {
		"ENGINE": "django.db.backends.postgresql",
		"NAME": 'db',
		"USER": 'postgres',
		"PASSWORD": '7526',
		"HOST": 'db',
		"PORT": '5432',
	}
}

# User default model schema
AUTH_USER_MODEL = 'app.User'

AUTHENTICATION_BACKENDS = [
	'django.contrib.auth.backends.ModelBackend', # Default Backend
	'allauth.account.auth_backends.AuthenticationBackend', # Google
]


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

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

FORTYTWO_CLIENT_ID = config("FORTYTWO_CLIENT_ID")
FORTYTWO_CLIENT_SECRET = config("FORTYTWO_SECRET")
FORTYTWO_REDIRECT_URI = config("FORTYTWO_REDIRECT_URI")

SOCIALACCOUNT_PROVIDERS = {
	'google': {
		'APP': {
			'client_id': config('GOOGLE_CLIENT_ID'),
			'secret': config('GOOGLE_CLIENT_SECRET'),
			'key': ''
		},
		'SCOPE': ['profile', 'email'],
		'AUTH_PARAMS': {'access_type': 'online'},
		'FIELDS': ['id', 'email', 'name', 'picture'], 
	},
	'fortytwo': {
		'APP': {
			'client_id': FORTYTWO_CLIENT_ID,
			'secret': FORTYTWO_CLIENT_SECRET,
			'key': ''
		},
        'SCOPE': ['public'],
        'AUTH_PARAMS': {'access_type': 'online'},
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
SOCIALACCOUNT_LOGIN_ON_GET = True
ACCOUNT_LOGOUT_ON_GET = True
LOGIN_URL = '/SignIn/'
ACCOUNT_LOGIN_METHODS = {"username", "email"}
ACCOUNT_SIGNUP_FIELDS = ['email*', 'username*', 'password1*', 'password2*']
ACCOUNT_AUTHENTICATED_LOGIN_REDIRECTS = False
ACCOUNT_LOGIN_REDIRECT_URL = "/ProfilePage/"
ACCOUNT_SIGNUP_REDIRECT_URL = "/ProfilePage/"
ACCOUNT_LOGOUT_REDIRECT_URL = "/SignIn/"
LOGIN_REDIRECT_URL = "/" 
ACCOUNT_EMAIL_VERIFICATION = "optional"
SOCIALACCOUNT_QUERY_EMAIL = True

CHANNEL_LAYERS = {
	'default': {
		'BACKEND': 'channels.layers.InMemoryChannelLayer',
	},
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'fr-fr'

TIME_ZONE = 'Europe/Paris'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'app/static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
# Répertoire pour les fichiers média (avatars, uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = "/app/app/media/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
