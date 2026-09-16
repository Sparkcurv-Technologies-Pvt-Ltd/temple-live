"""
URL configuration for temple_proj project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include, re_path
from django.conf.urls.static import static
from django.conf import settings
from django.views.static import serve

api_patterns = [
    path('assets/', include('assets.urls')),
    path('amount/', include('amount.urls')),
    path('authorities/', include('authorities.urls')),
    path('chit_fund/', include('chit_fund.urls')),
    path('collection/', include('collection.urls')),
    path('death/', include('death.urls')),
    path('expense/', include('expense.urls')),
    path('family/',include('family.urls')),
    path('festival/',include('festival.urls')),
    path('fund/',include('fund.urls')),
    path('home/',include('home.urls')),
    path('income/',include('income.urls')),
    path('interest/',include('interest.urls')),
    path('management/',include('management.urls')),
    path('marriage/',include('marriage.urls')),
    path('notify/',include('notify.urls')),
    path('rental/',include('rental.urls')),
    path('sangam/',include('sangam.urls')),
    path('sub_tariff/',include('sub_tariff.urls')),
    path('tax/',include('tax.urls')),
    path('token_app/',include('token_app.urls')),
    path('user/',include('user.urls')),
    path('permisions/',include('permisions.urls')),
    path('other_people/',include('other_people.urls')),
    path('my_tasks/',include('my_tasks.urls')),
    path('balancesheet/',include('balancesheet.urls')),
    path('treasure/',include('treasure.urls')),
    path('reports/',include('reports.urls')),
    path('penalty/', include('amount.penalty_urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_patterns)),
]

# also expose the same routes at root for legacy clients
urlpatterns += api_patterns
# Serve uploaded media files (works regardless of DEBUG)
urlpatterns += [
    re_path(r'^api/media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]