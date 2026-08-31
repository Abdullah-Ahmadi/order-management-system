from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

    # Django authentication:
    # /accounts/login/
    # /accounts/logout/
    path(
        "accounts/",
        include("django.contrib.auth.urls"),
    ),

    # OMS application
    path(
        "",
        include("orders.urls"),
    ),
]
