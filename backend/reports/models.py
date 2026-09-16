from django.db import models
from rental.models import RentalAndLeaseDetails,MovableAssetsRents
from collection.models import CollectionDetails
from family.models import Member_Details
from income.models import ADDIncomeDetails
from expense.models import ADDExpenseDetails
from management.models import ManagementDetails,BankDetails
from treasure.models import ManagementBalanceSheet
from fund.models import FundGroupDetails,FundMemberDetailss,FundLeaseDetailss
from festival.models import ADDFestivalDetails
from sub_tariff.models import ADDSubscriptionTariffDetails
from chit_fund.models import ChitFundsDetails,ChitFundDistribution,ChitFundSettlement,ChitFundInvesters
from interest.models import PeopleInterestDetails
from death.models import DeathDetails
from marriage.models import MarriageDetails
from amount.models import PeoplesJOININGAmountDetails
from amount.models import CashTransactionDetails
from balancesheet.models import FundMembersBalanceSheet

TYPE_CHOICES = (
    ('Addition','Addition'),
    ('Reduction','Reduction'),
    ('Deposit','Deposit'),
    ('Withdraw','Withdraw'),
    ('Loan','Loan'),
    ('Loan Repay','Loan Repay'),
    ('Bank Transfer','Bank Transfer'),
    ('Borrow','Borrow'),
    ('Borrow Paid','Borrow Paid'),
)

MTYPE_CHOICES = (
    ('Opening Balance','Opening Balance'),
    ('Festival','Festival'),
    ('subscription Tariff','subscription Tariff'),
    ('Death Tariff','Death Tariff'),
    ('Marriage Amount','Marriage Amount'),
    ('Balance','Balance'),
    ('Festival Penalty','Festival Penalty'),
    ('subscription Tariff Penalty','subscription Tariff Penalty'),
    ('Death Tariff Penalty','Death Tariff Penalty'),
)

FUNDTYPE_CHOICES = (
    ('Payment','Payment'),
    ('Fund Lease','Fund Lease'),
    ('Fund Initial','Fund Initial'),
)

INTERESTTYPE_CHOICES = (
    ('Payment','Payment'),
    ('Initial','Initial'),
    ('Discount','Discount'),
    ('Interest','Interest'),
    ('Penalty','Penalty'),
)

INCOME_CHOICES = (
    ('Addition','Addition'),
    ('Reduction','Reduction'),
    ('Investment','Investment'),
    ('Distribution','Distribution'),
    ('Profit','Profit'),
    ('Interest','Interest'),
    ('Principal Given','Principal Given'),
    ('Principal Pay','Principal Pay'),
)

class Report(models.Model):
    banks=models.ForeignKey(BankDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='report_Details_connected_to_BankDetails')
    
    marriage=models.ForeignKey(MarriageDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='report_Details_connected_to_MarriageDetails')
    festivals=models.ForeignKey(ADDFestivalDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='report_link_on_ADDFestivalDetails')
    rentsandlease=models.ForeignKey(RentalAndLeaseDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='report_link_on_RentalAndLeaseDetails')
    sub_tariff=models.ForeignKey(ADDSubscriptionTariffDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='report_link_on_ADDSubscriptionTariffDetails')
    death_tariff=models.ForeignKey(DeathDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='report_link_on_DeathDetails')
    interest=models.ForeignKey(PeopleInterestDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='report_link_on_PeopleInterestDetails')
    fund_m=models.ForeignKey(FundGroupDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='report_link_on_FundgroupDetails')
    fund_member=models.ForeignKey(FundMemberDetailss,on_delete=models.CASCADE,null=True,blank=True,related_name='report_link_on_FundMemberDetailss')
    fund_lease=models.ForeignKey(FundLeaseDetailss,on_delete=models.CASCADE,null=True,blank=True,related_name='report_link_on_FundLeaseDetails')
    moveablerent=models.ForeignKey(MovableAssetsRents,on_delete=models.CASCADE,null=True,blank=True,related_name='report_link_on_moveablerentDetails')
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_reports_link_RentalLeaseDetails')
    created_by=models.CharField(max_length=255,null=True,blank=True)
    type_choice=models.CharField(max_length=255,null=True,blank=True,choices=TYPE_CHOICES)
    rentsandlease=models.ForeignKey(RentalAndLeaseDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='collection_rent_reports')     
    collection=models.ForeignKey(CollectionDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='collection_reports')    
    members=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='member_reports')
    incomes=models.ForeignKey(ADDIncomeDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='income_reports')
    expenses=models.ForeignKey(ADDExpenseDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='expensese_reports')
    amount=models.DecimalField(max_digits=65,decimal_places=2,null=True,blank=True,default=0.00)  
    mangebalancesheet=models.ForeignKey(ManagementBalanceSheet,on_delete=models.CASCADE,null=True,blank=True,related_name='mangebalancesheet_in_Report')  
    join_amt=models.ForeignKey(PeoplesJOININGAmountDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='PeoplesJOININGAmountDetails_in_Report')    
    managee=models.BooleanField(default=False,null=True,blank=True)
    balance=models.BooleanField(default=False,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
    # new field
    from_bank=models.ForeignKey(BankDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='report_Details_connected_to_from_bank_BankDetails')
    cash_transaction=models.ForeignKey(CashTransactionDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='report_Details_connected_to_cash_transaction_Details')
    chit_fund=models.ForeignKey(ChitFundsDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='report_Details_connected_to_ChitFundsDetails')
    

class TempleMemberReport(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_mreports_link')
    members=models.ForeignKey(Member_Details,on_delete=models.CASCADE,null=True,blank=True,related_name='member_link_in_memreports')
    marriage=models.ForeignKey(MarriageDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='Mreport_Details_connected_to_MarriageDetails')
    festivals=models.ForeignKey(ADDFestivalDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='Mreport_link_on_ADDFestivalDetails')
    sub_tariff=models.ForeignKey(ADDSubscriptionTariffDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='Mreport_link_on_ADDSubscriptionTariffDetails')
    death_tariff=models.ForeignKey(DeathDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='Mreport_link_on_DeathDetails')
    collection=models.ForeignKey(CollectionDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='collection_Mreports')    
    
    reportdate=models.DateField(null=True,blank=True)
    credit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    debit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    balance_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    type_choice=models.CharField(max_length=255,null=True,blank=True,choices=MTYPE_CHOICES)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class FundMemberReport(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_FundMemberReport_link')
    balancesheet=models.ForeignKey(FundMembersBalanceSheet,on_delete=models.CASCADE,null=True,blank=True,related_name='FundMembersBalanceSheet_link_in_FundMemberReport')
    fund=models.ForeignKey(FundGroupDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='FundGroupDetails_link_in_FundMemberReport')
    fund_m=models.ForeignKey(FundMemberDetailss,on_delete=models.CASCADE,null=True,blank=True,related_name='FundMemberDetailss_link_in_FundMemberReport')
    reportdate=models.DateField(null=True,blank=True)
    credit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    debit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    balance_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    type_choice=models.CharField(max_length=255,null=True,blank=True,choices=FUNDTYPE_CHOICES)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
    
class ChitFundInterestOverallReport(models.Model):
    chitfund=models.ForeignKey(ChitFundsDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundsDetails_link_in_InterestOverallReport')
    chitinvesters=models.ForeignKey(ChitFundInvesters,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundInvesters_link_in_InterestOverallReport')
    chitsettlement=models.ForeignKey(ChitFundSettlement,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundSettlement_link_in_InterestOverallReport')
    chitdistribution=models.ForeignKey(ChitFundDistribution,on_delete=models.CASCADE,null=True,blank=True,related_name='ChitFundDistribution_link_in_InterestOverallReport')
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_InterestOverallReport_link')
    interest=models.ForeignKey(PeopleInterestDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='PeopleInterestDetails_link_in_InterestOverallReport')
    amount=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    income_choice=models.CharField(max_length=255,null=True,blank=True,choices=INCOME_CHOICES)
    collection=models.ForeignKey(CollectionDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='collection_InterestOverallReport')    
    action=models.BooleanField(default=False,null=True,blank=True)
    managee=models.BooleanField(default=False,null=True,blank=True)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)
    
class InterestPeopleReport(models.Model):
    management_profile=models.ForeignKey(ManagementDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='ManagementDetails_InterestPeopleReport_link')
    interest=models.ForeignKey(PeopleInterestDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='PeopleInterestDetails_link_in_InterestPeopleReport')
    reportdate=models.DateField(null=True,blank=True)
    credit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    debit_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    balance_amt=models.DecimalField(max_digits=65,decimal_places=2,default=0,null=True,blank=True)
    type_choice=models.CharField(max_length=255,null=True,blank=True,choices=INTERESTTYPE_CHOICES)
    created_by=models.CharField(max_length=255,null=True,blank=True)
    collection=models.ForeignKey(CollectionDetails,on_delete=models.CASCADE,null=True,blank=True,related_name='collection_people_interest_reports')    

    created_at=models.DateTimeField(auto_now_add=True,blank=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)