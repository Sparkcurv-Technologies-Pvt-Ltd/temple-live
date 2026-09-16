from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from permisions.models import Permisions
from rest_framework import status
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails,BankDetails
from treasure.models import ManagementTreasure
from .models import CashTransactionDetails
from .serializers import Cash_serializer,ManagementTreasureSerializer
from reports.models import Report
from management.serializers import BankDetailsNewSerializer
from reports.serializers import ReportNewSerializer
from datetime import datetime
from django.db.models import Q
# Create your views here.


@api_view(['GET','POST'])
def bank_transaction(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    rejin=token_checking(request)
    get_role=rejin.user_role
    if rejin.my_role!=None:
        permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    if request.method == "GET":
        bank= CashTransactionDetails.objects.filter(management_profile=management)
        bank_ser=Cash_serializer(bank,many=True)
        return Response(bank_ser.data,status=status.HTTP_200_OK)
    elif request.method == "POST":
        if get_role=="User" and perm.death_add ==True or get_role=="Admin" or rejin.is_superuser == True: 
            serializer= Cash_serializer(data=request.data)
            if serializer.is_valid():
                amt_detail=request.data['amount']
                if amt_detail <= 0:
                    msg={'message':'Amount should greater than 0'}
                    return Response(msg,status=status.HTTP_226_IM_USED)
                temp_family=serializer.save()
                temp_family.management_profile=management
                temp_family.created_by=rejin.id
                temp_family.save()
                if temp_family.trans_type == "Bank To Cash":
                    banks =BankDetails.objects.filter(id=temp_family.banks.id).first()
                    treasure = ManagementTreasure.objects.filter(management_profile=management).first()
                    treasure.cash_in_hand = float(treasure.cash_in_hand) + float(temp_family.amount)
                    treasure.bank_amt = float(treasure.bank_amt) - float(temp_family.amount)
                    treasure.save()
                    banks.credit_amt = float(banks.credit_amt) - float(temp_family.amount)
                    banks.save()
                    Report.objects.create(banks=temp_family.banks,management_profile=temp_family.management_profile,created_by=rejin.id,type_choice="Withdraw",amount=temp_family.amount,cash_transaction=temp_family)
                elif temp_family.trans_type == "Cash To Bank":
                    banks =BankDetails.objects.filter(id=temp_family.banks.id).first()
                    treasure = ManagementTreasure.objects.filter(management_profile=management).first()
                    treasure.cash_in_hand = float(treasure.cash_in_hand) - float(temp_family.amount)
                    treasure.bank_amt = float(treasure.bank_amt) + float(temp_family.amount)
                    treasure.save()
                    banks.credit_amt = float(banks.credit_amt) + float(temp_family.amount)
                    banks.save()
                    Report.objects.create(banks=temp_family.banks,management_profile=temp_family.management_profile,created_by=rejin.id,type_choice="Deposit",amount=temp_family.amount,cash_transaction=temp_family)

                elif temp_family.trans_type == "Loan Amount":
                    banks =BankDetails.objects.filter(id=temp_family.banks.id).first()
                    treasure = ManagementTreasure.objects.filter(management_profile=management).first()
                    treasure.loan_amt = float(treasure.loan_amt) + float(temp_family.amount)
                    treasure.bank_amt = float(treasure.bank_amt) + float(temp_family.amount)
                    treasure.save()
                    banks.credit_amt = float(banks.credit_amt) + float(temp_family.amount)
                    banks.loan_amt = float(banks.loan_amt) + float(temp_family.amount)
                    banks.save()
                    Report.objects.create(banks=temp_family.banks,management_profile=temp_family.management_profile,created_by=rejin.id,type_choice="Loan",amount=temp_family.amount,cash_transaction=temp_family)
                
                elif temp_family.trans_type == "Loan Repayment":
                    banks =BankDetails.objects.filter(id=temp_family.banks.id).first()
                    treasure = ManagementTreasure.objects.filter(management_profile=management).first()
                    # treasure.loan_amt = float(treasure.loan_amt) - float(temp_family.amount)
                    treasure.bank_amt = float(treasure.bank_amt) - float(temp_family.amount)
                    treasure.save()
                    banks.credit_amt = float(banks.credit_amt) - float(temp_family.amount)
                    banks.loan_repay_amt = float(banks.loan_repay_amt) + float(temp_family.amount)
                    banks.save()
                    Report.objects.create(banks=temp_family.banks,management_profile=temp_family.management_profile,created_by=rejin.id,type_choice="Loan Repay",amount=temp_family.amount,cash_transaction=temp_family)

                elif temp_family.trans_type == "Bank To Bank":
                    banks =BankDetails.objects.filter(id=temp_family.banks.id).first()
                    banks.credit_amt = float(banks.credit_amt) + float(temp_family.amount)
                    banks.save()
                    banks2 =BankDetails.objects.filter(id=temp_family.banks2.id).first()
                    banks2.credit_amt = float(banks2.credit_amt) - float(temp_family.amount)
                    banks2.save()
                    Report.objects.create(from_bank=temp_family.banks2,banks=temp_family.banks,management_profile=temp_family.management_profile,created_by=rejin.id,type_choice="Bank Transfer",amount=temp_family.amount,cash_transaction=temp_family)
                elif temp_family.trans_type == "Cash Borrowed":
                    treasure = ManagementTreasure.objects.filter(management_profile=management).first()
                    if temp_family.banks != None:
                        banks = BankDetails.objects.filter(id=temp_family.banks.id).first()
                        banks.credit_amt = float(banks.credit_amt) + float(temp_family.amount)
                        treasure.bank_amt = float(treasure.bank_amt) + float(temp_family.amount)
                        treasure.save()
                        banks.save()
                    else:
                        treasure.cash_in_hand = float(treasure.cash_in_hand) + float(temp_family.amount)
                        treasure.save()
                    temp_family.cash_paid_amt = temp_family.amount
                    temp_family.save()
                    Report.objects.create(members=temp_family.member,management_profile=temp_family.management_profile,created_by=rejin.id,type_choice="Borrow",amount=temp_family.amount,cash_transaction=temp_family,banks=temp_family.banks)
                elif temp_family.trans_type == "Cash Paid":
                    if temp_family.cash_trans != None:
                        cash_trans_obj=CashTransactionDetails.objects.filter(id=temp_family.cash_trans).first()
                        cash_trans_obj.paid_amt = float(cash_trans_obj.paid_amt)+ float(temp_family.amount)
                        cash_trans_obj.cash_paid_amt = float(cash_trans_obj.cash_paid_amt)- float(temp_family.amount)
                        cash_trans_obj.save()
                        if cash_trans_obj.paid_amt == cash_trans_obj.amount:
                            cash_trans_obj.paid=True
                            cash_trans_obj.save()
                    temp_family.member=cash_trans_obj.member
                    temp_family.name=cash_trans_obj.name
                    temp_family.mobile_number=cash_trans_obj.mobile_number
                    temp_family.address=cash_trans_obj.address
                    temp_family.member_type=cash_trans_obj.member_type
                    
                    temp_family.save()
                    treasure = ManagementTreasure.objects.filter(management_profile=management).first()
                    if temp_family.banks != None:
                        banks = BankDetails.objects.filter(id=temp_family.banks.id).first()
                        banks.credit_amt = float(banks.credit_amt) - float(temp_family.amount)
                        treasure.bank_amt = float(treasure.bank_amt) - float(temp_family.amount)
                        treasure.save()
                        banks.save()
                    else:
                        treasure.cash_in_hand = float(treasure.cash_in_hand) - float(temp_family.amount)
                        treasure.save()
                    Report.objects.create(members=temp_family.member,management_profile=temp_family.management_profile,created_by=rejin.id,type_choice="Borrow Paid",amount=temp_family.amount,cash_transaction=temp_family,banks=temp_family.banks)

                return Response(serializer.data,status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    

@api_view(['GET','POST','PUT','DELETE'])
def edit_bank_transaction(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    get_role=rejin.user_role
    if rejin.my_role!=None:
        permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
    try:
        transaction = CashTransactionDetails.objects.get(pk=pk)  
    except CashTransactionDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    amt=transaction.amount
    bank_new_obj=transaction.banks
    bank_new_obj2=transaction.banks2
    report_obj = Report.objects.filter(cash_transaction=transaction).first()
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    
    if request.method == 'GET':
        serializer = CashTransactionDetails(transaction)
        return Response(serializer.data,status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        if get_role=="User" and perm.death_add ==True or get_role=="Admin" or rejin.is_superuser == True: 
            serializer= Cash_serializer(data=request.data)
            if serializer.is_valid():
                amt_detail=request.data['amount']
                if amt_detail <= 0:
                    msg={'message':'Amount should greater than 0'}
                    return Response(msg,status=status.HTTP_226_IM_USED)
                if transaction.trans_type == "Bank To Cash":
                    bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
                    treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
                    if ((float(treasure1.cash_in_hand) - float(treasure1.expence_amt)) < float(amt)) :
                        return Response({'msg':'Due to less amount in cash in hand can not delete this transaction'},status=status.HTTP_226_IM_USED)
                    else:
                        treasure1.cash_in_hand = float(treasure1.cash_in_hand) - float(amt)
                        treasure1.bank_amt = float(treasure1.bank_amt) + float(amt)
                        treasure1.save()
                        bank_new.credit_amt = float(bank_new.credit_amt) + float(amt)
                        bank_new.save()

                elif transaction.trans_type == "Cash To Bank":
                    bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
                    treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
                    if (float(treasure1.bank_amt) < float(amt)) or (float(bank_new.credit_amt) < float(amt)):
                        return Response({'msg':'Due to less amount in bank account can not delete this transaction'},status=status.HTTP_226_IM_USED)
                    else:
                        treasure1.cash_in_hand = float(treasure1.cash_in_hand) + float(amt)
                        treasure1.bank_amt = float(treasure1.bank_amt) - float(amt)
                        treasure1.save()
                        bank_new.credit_amt = float(bank_new.credit_amt) - float(amt)
                        bank_new.save()
                elif transaction.trans_type == "Loan Amount":
                    bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
                    treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
                    if (float(treasure1.loan_amt) < float(amt)) :
                        return Response({'msg':'Due to less amount in loan account can not delete this transaction'},status=status.HTTP_226_IM_USED)
                    elif (float(treasure1.bank_amt) < float(amt)):
                        return Response({'msg':'Due to less amount in bank account can not delete this transaction'},status=status.HTTP_226_IM_USED)
                    elif (float(bank_new.credit_amt) < float(amt)):
                        return Response({'msg':'Due to less amount in bank account can not delete this transaction'},status=status.HTTP_226_IM_USED)
                    elif (float(bank_new.loan_amt) < float(amt)):
                        return Response({'msg':'Due to less amount in loan account can not delete this transaction'},status=status.HTTP_226_IM_USED)
                    else:
                        bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
                        treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
                        treasure1.loan_amt = float(treasure1.loan_amt) - float(amt)
                        treasure1.bank_amt = float(treasure1.bank_amt) - float(amt)
                        treasure1.save()
                        bank_new.credit_amt = float(bank_new.credit_amt) - float(amt)
                        bank_new.loan_amt = float(bank_new.loan_amt) - float(amt)
                        bank_new.save()
                elif transaction.trans_type == "Loan Repayment":
                    bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
                    treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
                    treasure1.loan_amt = float(treasure1.loan_amt) + float(amt)
                    treasure1.bank_amt = float(treasure1.bank_amt) + float(amt)
                    treasure1.save()
                    bank_new.credit_amt = float(bank_new.credit_amt) + float(amt)
                    bank_new.loan_amt = float(bank_new.loan_amt) + float(amt)
                    bank_new.save()

                elif transaction.trans_type == "Bank To Bank":
                    bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
                    bank_new2 =BankDetails.objects.filter(id=bank_new_obj2.id).first()
                    if (float(bank_new2.credit_amt) < float(amt)) :
                        return Response({'msg':'Due to less amount in bank account can not delete this transaction'},status=status.HTTP_226_IM_USED)
                    else:   
                        bank_new.credit_amt = float(bank_new.credit_amt) -  float(amt)
                        bank_new.save()
                        bank_new2.credit_amt = float(bank_new2.credit_amt) + float(amt)
                        bank_new2.save()

                elif transaction.trans_type == "Cash Borrowed":
                    treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
                    if bank_new_obj != None:
                        bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
                        if (float(bank_new.credit_amt) < float(amt)) or (float(treasure1.bank_amt) < float(amt)):
                            return Response({'msg':'Due to less amount in bank account can not delete this transaction'},status=status.HTTP_226_IM_USED)
                        else:
                            bank_new.credit_amt = float(bank_new.credit_amt) - float(amt)
                            bank_new.save()
                            treasure1.bank_amt = float(treasure1.bank_amt) - float(amt)
                            treasure1.save()
                    else:  
                        if ((float(treasure1.cash_in_hand)-float(treasure1.expence_amt)) < float(amt)):
                            return Response({'msg':'Due to less amount in bank account can not delete this transaction'},status=status.HTTP_226_IM_USED)
                        else: 
                            treasure1.cash_in_hand = float(treasure1.cash_in_hand) - float(amt)
                            treasure1.save()
                    
                elif transaction.trans_type == "Cash Paid":
                    if transaction.cash_trans != None:
                        cash_trans_obj=CashTransactionDetails.objects.filter(id=transaction.cash_trans).first()
                        cash_trans_obj.paid_amt = float(cash_trans_obj.paid_amt)- float(amt)
                        cash_trans_obj.cash_paid_amt = float(cash_trans_obj.cash_paid_amt)+ float(amt)
                        cash_trans_obj.paid=False
                        cash_trans_obj.save()

                    treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
                    if bank_new_obj != None:
                        bank_new = BankDetails.objects.filter(id=bank_new_obj.id).first()
                        bank_new.credit_amt = float(bank_new.credit_amt) + float(amt)
                        treasure1.bank_amt = float(treasure1.bank_amt) + float(amt)
                        treasure1.save()
                        bank_new.save()
                    else:
                        treasure1.cash_in_hand = float(treasure1.cash_in_hand) + float(amt)
                        treasure1.save()
                temp_family=serializer.save()
                temp_family.management_profile=management
                temp_family.save()
                if temp_family.trans_type == "Bank To Cash":
                    banks =BankDetails.objects.filter(id=temp_family.banks.id).first()
                    treasure = ManagementTreasure.objects.filter(management_profile=management).first()
                    treasure.cash_in_hand = float(treasure.cash_in_hand) + float(temp_family.amount)
                    treasure.bank_amt = float(treasure.bank_amt) - float(temp_family.amount)
                    treasure.save()
                    banks.credit_amt = float(banks.credit_amt) - float(temp_family.amount)
                    banks.save()

                elif temp_family.trans_type == "Cash To Bank":
                    banks =BankDetails.objects.filter(id=temp_family.banks.id).first()
                    treasure = ManagementTreasure.objects.filter(management_profile=management).first()
                    treasure.cash_in_hand = float(treasure.cash_in_hand) - float(temp_family.amount)
                    treasure.bank_amt = float(treasure.bank_amt) + float(temp_family.amount)
                    treasure.save()
                    banks.credit_amt = float(banks.credit_amt) + float(temp_family.amount)
                    banks.save()
                elif temp_family.trans_type == "Loan Amount":
                    banks =BankDetails.objects.filter(id=temp_family.banks.id).first()
                    treasure = ManagementTreasure.objects.filter(management_profile=management).first()
                    treasure.loan_amt = float(treasure.loan_amt) + float(temp_family.amount)
                    treasure.bank_amt = float(treasure.bank_amt) + float(temp_family.amount)
                    treasure.save()
                    banks.credit_amt = float(banks.credit_amt) + float(temp_family.amount)
                    banks.loan_amt = float(banks.loan_amt) + float(temp_family.amount)
                    banks.save()
                elif temp_family.trans_type == "Loan Repayment":
                    banks =BankDetails.objects.filter(id=temp_family.banks.id).first()
                    treasure = ManagementTreasure.objects.filter(management_profile=management).first()
                    treasure.loan_amt = float(treasure.loan_amt) - float(temp_family.amount)
                    treasure.bank_amt = float(treasure.bank_amt) - float(temp_family.amount)
                    treasure.save()
                    banks.credit_amt = float(banks.credit_amt) - float(temp_family.amount)
                    banks.loan_amt = float(banks.loan_amt) - float(temp_family.amount)
                    banks.save()

                elif temp_family.trans_type == "Bank To Bank":
                    banks =BankDetails.objects.filter(id=temp_family.banks.id).first()
                    banks.credit_amt = float(banks.credit_amt) - float(temp_family.amount)
                    banks.save()
                    banks2 =BankDetails.objects.filter(id=temp_family.banks2.id).first()
                    banks2.credit_amt = float(banks2.credit_amt) + float(temp_family.amount)
                    banks2.save()
                
                elif temp_family.trans_type == "Cash Borrowed":
                    treasure = ManagementTreasure.objects.filter(management_profile=management).first()
                    if temp_family.banks != None:
                        banks = BankDetails.objects.filter(id=temp_family.banks.id).first()
                        banks.credit_amt = float(banks.credit_amt) + float(temp_family.amount)
                        treasure.bank_amt = float(treasure.bank_amt) + float(temp_family.amount)
                        
                        treasure.save()
                        banks.save()
                    else:
                        treasure.cash_in_hand = float(treasure.cash_in_hand) + float(temp_family.amount)
                        treasure.save()
                    temp_family.cash_paid_amt = temp_family.amount
                    temp_family.save()
                elif temp_family.trans_type == "Cash Paid":
                    if temp_family.cash_trans != None:
                        cash_trans_obj1=CashTransactionDetails.objects.filter(id=temp_family.cash_trans).first()
                        cash_trans_obj1.paid_amt = float(cash_trans_obj1.paid_amt)+ float(temp_family.amount)
                        cash_trans_obj1.cash_paid_amt =float(cash_trans_obj1.cash_paid_amt) - float(temp_family.amount)
                        cash_trans_obj1.save()
                        if cash_trans_obj1.paid_amt == cash_trans_obj1.amount:
                           cash_trans_obj1.paid=True
                           cash_trans_obj1.save()
                    temp_family.member=cash_trans_obj.member
                    temp_family.name=cash_trans_obj.name
                    temp_family.mobile_number=cash_trans_obj.mobile_number
                    temp_family.address=cash_trans_obj.address
                    temp_family.member_type=cash_trans_obj.member_type
                    
                    temp_family.save()
                    treasure = ManagementTreasure.objects.filter(management_profile=management).first()
                    if temp_family.banks != None:
                        banks = BankDetails.objects.filter(id=temp_family.banks.id).first()
                        banks.credit_amt = float(banks.credit_amt) - float(temp_family.amount)
                        treasure.bank_amt = float(treasure.bank_amt) - float(temp_family.amount)
                        treasure.save()
                        banks.save()
                    else:
                        treasure.cash_in_hand = float(treasure.cash_in_hand) - float(temp_family.amount)
                        treasure.save()
                   
                report_obj.from_bank=temp_family.banks2
                report_obj.banks=temp_family.banks
                report_obj.management_profile=temp_family.management_profile
                report_obj.created_by=rejin.id
                report_obj.amount=temp_family.amount
                report_obj.cash_transaction=temp_family
                report_obj.members=temp_family.member

                report_obj.save()
                if temp_family.trans_type == "Bank To Cash":
                    report_obj.type_choice="Withdraw"
                    report_obj.from_bank=None
                    report_obj.save()
                elif temp_family.trans_type == "Cash To Bank":
                    report_obj.type_choice="Deposit"
                    report_obj.from_bank=None
                    report_obj.save()
                elif temp_family.trans_type == "Loan Amount":
                    report_obj.type_choice="Loan"
                    report_obj.from_bank=None
                    report_obj.save()
                elif temp_family.trans_type == "Loan Repayment":
                    report_obj.type_choice="Loan Repay"
                    report_obj.from_bank=None
                    report_obj.save()
                elif temp_family.trans_type == "Bank To Bank":
                    report_obj.type_choice="Bank Transfer"
                    report_obj.save()
                elif temp_family.trans_type == "Cash Borrowed":
                    report_obj.type_choice="Borrow"
                    report_obj.from_bank=None
                    report_obj.save()
                elif temp_family.trans_type == "Cash Paid":
                    report_obj.type_choice="Borrow Paid"
                    report_obj.from_bank=None
                    report_obj.save()
                return Response(serializer.data,status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
    elif request.method == "DELETE":
        if transaction.trans_type == "Bank To Cash":
            bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
            treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
            if ((float(treasure1.cash_in_hand) - float(treasure1.expence_amt)) < float(amt)) :
                return Response({'msg':'Due to less amount in cash in hand can not delete this transaction'},status=status.HTTP_226_IM_USED)
            else:
                treasure1.cash_in_hand = float(treasure1.cash_in_hand) - float(amt)
                treasure1.bank_amt = float(treasure1.bank_amt) + float(amt)
                treasure1.save()
                bank_new.credit_amt = float(bank_new.credit_amt) + float(amt)
                bank_new.save()

        elif transaction.trans_type == "Cash To Bank":
            bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
            treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
            if (float(treasure1.bank_amt) < float(amt)) or (float(bank_new.credit_amt) < float(amt)):
                return Response({'msg':'Due to less amount in bank account can not delete this transaction'},status=status.HTTP_226_IM_USED)
            else:
                treasure1.cash_in_hand = float(treasure1.cash_in_hand) + float(amt)
                treasure1.bank_amt = float(treasure1.bank_amt) - float(amt)
                treasure1.save()
                bank_new.credit_amt = float(bank_new.credit_amt) - float(amt)
                bank_new.save()
        elif transaction.trans_type == "Loan Amount":
            bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
            treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
            if (float(treasure1.loan_amt) < float(amt)) :
                return Response({'msg':'Due to less amount in loan account can not delete this transaction'},status=status.HTTP_226_IM_USED)
            elif (float(treasure1.bank_amt) < float(amt)):
                return Response({'msg':'Due to less amount in bank account can not delete this transaction'},status=status.HTTP_226_IM_USED)
            elif (float(bank_new.credit_amt) < float(amt)):
                return Response({'msg':'Due to less amount in bank account can not delete this transaction'},status=status.HTTP_226_IM_USED)
            elif (float(bank_new.loan_amt) < float(amt)):
                return Response({'msg':'Due to less amount in loan account can not delete this transaction'},status=status.HTTP_226_IM_USED)
            else:
                treasure1.loan_amt = float(treasure1.loan_amt) - float(amt)
                treasure1.bank_amt = float(treasure1.bank_amt) - float(amt)
                treasure1.save()
                bank_new.credit_amt = float(bank_new.credit_amt) - float(amt)
                bank_new.loan_amt = float(bank_new.loan_amt) - float(amt)
                bank_new.save()
        elif transaction.trans_type == "Loan Repayment":
            bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
            treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
            treasure1.loan_amt = float(treasure1.loan_amt) + float(amt)
            treasure1.bank_amt = float(treasure1.bank_amt) + float(amt)
            treasure1.save()
            bank_new.credit_amt = float(bank_new.credit_amt) + float(amt)
            bank_new.loan_amt = float(bank_new.loan_amt) + float(amt)
            bank_new.save()

        elif transaction.trans_type == "Bank To Bank":
            bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
            bank_new2 =BankDetails.objects.filter(id=bank_new_obj2.id).first()
            if (float(bank_new2.credit_amt) < float(amt)) :
                return Response({'msg':'Due to less amount in bank account can not delete this transaction'},status=status.HTTP_226_IM_USED)
            else:  
                bank_new.credit_amt = float(bank_new.credit_amt)+float(amt)
                bank_new.save()
                bank_new2 =BankDetails.objects.filter(id=bank_new_obj2.id).first()
                bank_new2.credit_amt = float(bank_new2.credit_amt) - float(amt)
                bank_new2.save()

            
        elif transaction.trans_type == "Cash Borrowed":

            treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
            if bank_new_obj != None:
                bank_new =BankDetails.objects.filter(id=bank_new_obj.id).first()
                if (float(bank_new.credit_amt) < float(amt)) or (float(treasure1.bank_amt) < float(amt)):
                    return Response({'msg':'Due to less amount in bank account can not delete this transaction'},status=status.HTTP_226_IM_USED)
                else:
                    bank_new.credit_amt = float(bank_new.credit_amt) - float(amt)
                    treasure1.bank_amt = float(treasure1.bank_amt) - float(amt)
                    bank_new.save()
                    treasure1.save()
            else: 
                if ((float(treasure1.cash_in_hand)-float(treasure1.expence_amt)) < float(amt)):
                    return Response({'msg':'Due to less amount in bank account can not delete this transaction'},status=status.HTTP_226_IM_USED)
                else:   
                    treasure1.cash_in_hand = float(treasure1.cash_in_hand) - float(amt)
                    treasure1.save()
            
        elif transaction.trans_type == "Cash Paid":
            if transaction.cash_trans != None:
                cash_trans_obj=CashTransactionDetails.objects.filter(id=transaction.cash_trans).first()
                cash_trans_obj.paid_amt = float(cash_trans_obj.paid_amt)- float(amt)
                cash_trans_obj.cash_paid_amt = float(cash_trans_obj.cash_paid_amt)+ float(amt)
                cash_trans_obj.paid=False
                cash_trans_obj.save()
            treasure1 = ManagementTreasure.objects.filter(management_profile=management).first()
            if bank_new_obj != None:
                bank_new = BankDetails.objects.filter(id=bank_new_obj.id).first()
                bank_new.credit_amt = float(bank_new.credit_amt) + float(amt)
                treasure1.bank_amt = float(treasure1.bank_amt) + float(amt)
                treasure1.save()
                bank_new.save()
            else:
                treasure1.cash_in_hand = float(treasure1.cash_in_hand) + float(amt)
                treasure1.save()
        transaction.delete()
        return Response(status=status.HTTP_200_OK)



@api_view(['GET','POST'])
def get_bank_details(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    rejin=token_checking(request)
    get_role=rejin.user_role
    if rejin.my_role!=None:
        permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    if request.method == "GET":
        bank= BankDetails.objects.filter(management=management)
        bank_ser=BankDetailsNewSerializer(bank,many=True)
        return Response(bank_ser.data,status=status.HTTP_200_OK)
    


    

@api_view(['GET','POST'])
def get_cash_details(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    rejin=token_checking(request)
    get_role=rejin.user_role
    if rejin.my_role!=None:
        permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    if request.method == "GET":
        bank= ManagementTreasure.objects.filter(management_profile=management)
        list=[]
        if bank:
            dic={}
            manage_obj=ManagementTreasure.objects.filter(management_profile=management).first()
            dic['cash']=float(manage_obj.cash_in_hand)-float(manage_obj.expence_amt)
            list.append(dic)
        bank_ser=ManagementTreasureSerializer(bank,many=True)
        return Response(list,status=status.HTTP_200_OK)
    

@api_view(['GET','POST'])
def cash_tranfer_statement(request):
        rejin=token_checking(request)
        if not rejin:
            return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
        if not rejin.is_active:
            return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
        print(f'token---{rejin}')
        rejin=token_checking(request)
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
        check_management=ManagementDetails.objects.all()
        if not check_management:
            dict6={}
            dict6['message']= "First Add Management Profile details"
            return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            management=ManagementDetails.objects.all().first()
        if request.method == "GET":
            bank= CashTransactionDetails.objects.filter(management_profile=management)
            bank_ser=Cash_serializer(bank,many=True)
            dict={}
            dict['cash_det'] = bank_ser.data
            return Response(dict,status=status.HTTP_200_OK)
        elif request.method == "POST":
            jj=request.data['range']
            end_date=jj['end_date']
            start_date=jj['start_date']
            bank_id=request.data['bank_id']

            if start_date and end_date:
                start_date_time_obj = datetime.strptime(str(start_date), '%Y-%m-%d').date()
                end_date_time_obj = datetime.strptime(str(end_date), '%Y-%m-%d').date()
                bank=CashTransactionDetails.objects.filter( Q(banks2_id=bank_id) | Q(banks_id=bank_id),management_profile=management,created_at__date__gte=start_date_time_obj,created_at__date__lte=end_date_time_obj).order_by('-created_at')
                bank_ser=Cash_serializer(bank,many=True)
                dict={}
                dict['cash_det'] = bank_ser.data
                return Response(dict,status=status.HTTP_200_OK)
            

@api_view(['GET','POST'])
def bank_statement(request):
        rejin=token_checking(request)
        if not rejin:
            return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
        if not rejin.is_active:
            return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
        print(f'token---{rejin}')
        rejin=token_checking(request)
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
        check_management=ManagementDetails.objects.all()
        if not check_management:
            dict6={}
            dict6['message']= "First Add Management Profile details"
            return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            management=ManagementDetails.objects.all().first()
        if request.method == "GET":
            bank_list=[]
            bank= Report.objects.filter(management_profile=management)
            for bank_obj in bank:
                bank_object=Report.objects.get(id=bank_obj.id)
                if bank_object.banks != None:
                    bank_list.append(bank_object)
            bank_ser=ReportNewSerializer(bank_list,many=True)
            dict={}
            dict['cash_det'] = bank_ser.data
            return Response(dict,status=status.HTTP_200_OK)
        elif request.method == "POST":
            jj=request.data['range']
            end_date=jj['end_date']
            start_date=jj['start_date']
            bank_id=request.data['bank_id']

            if start_date and end_date:
                start_date_time_obj = datetime.strptime(str(start_date), '%Y-%m-%d').date()
                end_date_time_obj = datetime.strptime(str(end_date), '%Y-%m-%d').date()
                bank=Report.objects.filter(Q(from_bank_id=bank_id) | Q(banks_id=bank_id),management_profile=management,created_at__date__gte=start_date_time_obj,created_at__date__lte=end_date_time_obj).order_by('-created_at')
                bank_ser=ReportNewSerializer(bank,many=True)
                dict={}
                dict['cash_det'] = bank_ser.data
                return Response(dict,status=status.HTTP_200_OK)
            else:
                msg={'msg':'Enter valid date format'}
                return Response(msg,status=status.HTTP_226_IM_USED)
            

@api_view(['GET','POST'])
def get_detail_cash_borrowedlist(request):
        rejin=token_checking(request)
        if not rejin:
            return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
        if not rejin.is_active:
            return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
        print(f'token---{rejin}')
        rejin=token_checking(request)
        get_role=rejin.user_role
        if rejin.my_role!=None:
            permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
            if permiss:
                perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
        check_management=ManagementDetails.objects.all()
        if not check_management:
            dict6={}
            dict6['message']= "First Add Management Profile details"
            return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            management=ManagementDetails.objects.all().first()
        if request.method == "GET":
            cash_trans=CashTransactionDetails.objects.filter(trans_type="Cash Borrowed",paid=False,management_profile=management)
            serializer= Cash_serializer(cash_trans,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        

@api_view(['GET','POST'])
def get_bank_details_filter(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    rejin=token_checking(request)
    get_role=rejin.user_role
    if rejin.my_role!=None:
        permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    if request.method == "GET":
        bank= BankDetails.objects.filter(management=management).exclude(id=pk)
        bank_ser=BankDetailsNewSerializer(bank,many=True)
        return Response(bank_ser.data,status=status.HTTP_200_OK)