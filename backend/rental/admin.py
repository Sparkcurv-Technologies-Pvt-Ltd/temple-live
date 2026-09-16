from django.contrib import admin
from .models import RentalAndLeaseDetails,MovableAssetsRents,MovableAssetsRentTable

admin.site.register(RentalAndLeaseDetails)
admin.site.register(MovableAssetsRents)
admin.site.register(MovableAssetsRentTable)



