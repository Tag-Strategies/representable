from .base import *
import os

ALLOWED_HOSTS = ["*"]

SECURE_SSL_REDIRECT = False

DEBUG = True

# Dev Email Settings - Print to Console
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
# Use Custom Debugging Email Adapter that prints a simple text message.
# See docs for context: https://django-allauth.readthedocs.io/en/latest/advanced.html#sending-email
ACCOUNT_ADAPTER = "main.users.adapter.DebugAdapter"

MIXPANEL_TOKEN = "ce31fc3e8e15a16619bb3672f9c25407"

# testing keys - if you want to do work with recaptcha on dev, copy the public
# keys from prod -- if you don't have the recaptcha private key in your
# os environment, it won't work if we verify on the backend. It's available in the bitwarden. the checkbox will
# still need to be checked unless you change the CHECK_CAPTCHA_SUBMIT setting here
RECAPTCHA_PUBLIC = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
RECAPTCHA_PRIVATE = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
