from django.db import models
from management.models import ManagementDetails
from interest.models import PeopleInterestDetails
# from collection.models import CollectionDetails
from fund.models import FundMemberDetailss,FundLeaseDetailss,FundGroupDetails
from rental.models import RentalAndLeaseDetails,MovableAssetsRents

class PeopleInterestBalanceSheet(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_link_in_PeopleInterestBalanceSheet')
    interest=models.ForeignKey(PeopleInterestDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='PeopleInterestDetails_link_in_PeopleInterestBalanceSheet')
    # collection=models.ForeignKey(CollectionDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='CollectionDetails_link_in_PeopleInterestBalanceSheet')
    date=models.DateField(null=True,blank=True)
    principal_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    principal_paid=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    principal_balance=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    intrest_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    intrest_paid_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    intrest_balance_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    penalty_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    penalty_paid_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    penalty_balance_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    credit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    debit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    balance_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    
    interest_apply_date=models.DateField(null=True)
    first_interest_apply=models.BooleanField(default=False)
    first_penalty_apply=models.BooleanField(default=False)
    paid=models.BooleanField(default=False,null=True,blank=True)
    discount=models.BooleanField(default=False,null=True,blank=True)
    discount_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    closed=models.BooleanField(default=False,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
    # new
    pay_done =models.IntegerField(default=0,null=True,blank=True)
    # Owner rule (Feb 2026): mirror of ``PeopleInterestDetails.installment_date``
    # so reports / dashboards that already query the balance-sheet table
    # can surface the borrower's next expected due date without a JOIN.
    # Maintained via ``interest.signals.mirror_due_date`` — every write
    # to ``PeopleInterestDetails.installment_date`` copies onto this
    # column atomically.
    due_date = models.DateField(null=True, blank=True)
    
class FundBalanceSheet(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_link_in_FundBalanceSheetP')
    fund=models.ForeignKey(FundGroupDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='FundGroupDetails_link_in_FundBalanceSheet')
    fund_lease=models.ForeignKey(FundLeaseDetailss,on_delete=models.CASCADE,null=True,blank=True,related_name='FundLeaseDetailss_link_in_FundBalanceSheet')
    fund_m=models.ForeignKey(FundMemberDetailss,on_delete=models.CASCADE,null=True,blank=True,related_name='FundMemberDetailss_link_in_FundBalanceSheet')
    # collection=models.ForeignKey(CollectionDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='CollectionDetails_link_in_FundBalanceSheet')
    date=models.DateField(null=True,blank=True)
    credit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    debit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    balance_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class FundMembersBalanceSheet(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_link_in_FundBalanceSheetP1')
    fund=models.ForeignKey(FundGroupDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='FundGroupDetails_link_in_FundBalanceSheet1')
    fund_m=models.OneToOneField(FundMemberDetailss,on_delete=models.CASCADE,null=True,blank=True,related_name='FundMemberDetailss_link_in_FundBalanceSheet1')
    credit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    debit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    balance_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class RentalBalanceSheet(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_link_in_FundBalanceSheetP2')
    rental_new_amt=models.ForeignKey(RentalAndLeaseDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='rental_new_amt')
    credit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    debit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    balance_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    total_months =models.IntegerField(default=0,null=True,blank=True)
    paid=models.BooleanField(default=False,null=True,blank=True)
    lease=models.BooleanField(default=False,null=True,blank=True)
    is_completed=models.BooleanField(default=False,null=True,blank=True)
    months_done =models.IntegerField(default=0,null=True,blank=True)
    rent_add_date = models.DateField(null=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class MoveableRentBalanceSheet(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_profile_link_in_MoveableRentBalanceSheet')
    moveablerent=models.ForeignKey(MovableAssetsRents,on_delete=models.CASCADE,null=True,blank=True,related_name='movable_rent_in_MoveableRentBalanceSheet')
    credit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    advance_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    debit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    balance_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    paid=models.BooleanField(default=False,null=True,blank=True)
    is_completed=models.BooleanField(default=False,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)