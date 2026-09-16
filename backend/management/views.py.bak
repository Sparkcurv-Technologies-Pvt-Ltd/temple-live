from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from.serializers import ManagementDetailsSerializer,BankDetailsSerializer,InstructionSerializer
from .models import ManagementDetails,BankDetails,Instructions
from token_app.views import token_checking, generate_token
from user.models import User
from permisions.models import Permisions
from treasure.models import ManagementBalanceSheet,ManagementTreasure
import datetime
from chit_fund.models import ChitFundsDetails
from interest.models import PeopleInterestDetails
from family.models import Member_Details
from reports.models import Report
from amount.models import CashTransactionDetails

@api_view(['GET','POST'])
def add_management(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    get_role=rejin.user_role
    if request.method =='POST':
        if get_role=="Admin" or rejin.is_superuser == True:
            check_management=ManagementDetails.objects.all()
            if check_management:
                dict6={}
                dict6['message']= "Management Profile details already added"
                # dict6['data']=request.data
                return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
            else:
                pass            
            try:
                print('super human')
                print(request.data)
                prod=request.data
                dict87={}
                dict87['temple_name']=prod['temple_name']
                dict87['address']=prod['address']
                dict87['comments']=prod['comments']
                dict87['opening_balance']=prod['opening_balance']
                dict87['tax_age']=prod['tax_age']
                if prod['opening_balance_type']=='null':
                    dict87['opening_balance_type']=None
                else:
                    dict87['opening_balance_type']=prod['opening_balance_type']
                try:
                    dict87['documents']=prod['documents']
                except Exception:
                    pass
                try:
                    dict87['images']=prod['images']
                except Exception:
                    pass
                print('godd')
                print(request.data['field_count'])
                print(type(request.data['field_count']))
                pc=int(request.data['field_count'])
                print(pc)
                print(type(pc))
                produ_list=[]
                if pc>=1:
                    for num in range(1,pc+1):
                        dict8={}
                        dict8['bank_name']=prod[f"management[{num}][bank_name]"]
                        dict8['account_no']=prod[f"management[{num}][account_no]"]
                        dict8['ifsc']=prod[f"management[{num}][ifsc]"]
                        dict8['account_holder_name']=prod[f"management[{num}][account_holder_name]"]
                        dict8['branch_name']=prod[f"management[{num}][branch_name]"]
                        
                        dict8['bank_opening_balance_amt']=prod[f"management[{num}][bank_opening_balance_amt]"]
                        if prod[f"management[{num}][bank_opening_balance_type]"]=='null':
                            dict8['bank_opening_balance_type']=None
                        else:
                            dict8['bank_opening_balance_type']=prod[f"management[{num}][bank_opening_balance_type]"]
                            
                        produ_list.append(dict8)         
                dict87['management']=produ_list
                print('final')
                print(dict87)
            except Exception:
                return Response({"Message":"Data requirement error"},status=status.HTTP_417_EXPECTATION_FAILED)
                    
            serializer876 = ManagementDetailsSerializer(data=dict87)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                
                if temp_family.opening_balance_type!=None and temp_family.opening_balance!=None and temp_family.opening_balance_type=='Credit' and temp_family.opening_balance>0:    
                    m_t=ManagementTreasure.objects.create(management_profile=temp_family,cash_in_hand=temp_family.opening_balance)
                    todayy=datetime.datetime.now()
                    m_bal=ManagementBalanceSheet.objects.create(management_profile=temp_family,managee=True,opening_balance_amt=temp_family.opening_balance,date=todayy,opening_balance_type=temp_family.opening_balance_type)
                    Report.objects.create(type_choice="Addition",management_profile=temp_family,amount=temp_family.opening_balance,created_by=rejin.id,mangebalancesheet=m_bal)      
                elif temp_family.opening_balance_type!=None and temp_family.opening_balance!=None and temp_family.opening_balance_type=='Debit' and temp_family.opening_balance>0:
                    m_t=ManagementTreasure.objects.create(management_profile=temp_family,expence_amt=temp_family.opening_balance)
                    todayy=datetime.datetime.now()
                    m_ball=ManagementBalanceSheet.objects.create(management_profile=temp_family,managee=True,opening_balance_amt=temp_family.opening_balance,date=todayy,opening_balance_type=temp_family.opening_balance_type)
                    Report.objects.create(type_choice="Reduction",management_profile=temp_family,amount=temp_family.opening_balance,created_by=rejin.id,mangebalancesheet=m_ball)      
                else:
                    m_t=ManagementTreasure.objects.create(management_profile=temp_family)

                bank=BankDetails.objects.filter(management=temp_family)
                if bank:
                    for bank_det in bank:
                        bank_obj=BankDetails.objects.get(id=bank_det.id)
                        if bank_obj.bank_opening_balance_type == "Credit":
                            if bank_obj.bank_opening_balance_amt>0:
                                bank_obj.credit_amt=float(bank_obj.credit_amt) + float(bank_obj.bank_opening_balance_amt)
                                bank_obj.save()
                                m_t.bank_amt=float(m_t.bank_amt)+float(bank_obj.bank_opening_balance_amt)
                                m_t.save()
                                Report.objects.create(type_choice="Addition",banks=bank_obj,management_profile=temp_family,amount=bank_obj.bank_opening_balance_amt,created_by=rejin.id,managee=True)
                            else:
                                pass
                        elif bank_obj.bank_opening_balance_type == "Debit":
                            bank_obj.loan_amt=float(bank_obj.loan_amt) + float(bank_obj.bank_opening_balance_amt)
                            bank_obj.save()
                            m_t.loan_amt=float(m_t.loan_amt)+float(bank_obj.bank_opening_balance_amt)
                            m_t.save()
                            Report.objects.create(type_choice="Reduction",banks=bank_obj,management_profile=temp_family,amount=bank_obj.bank_opening_balance_amt,created_by=rejin.id,managee=True)
                            
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
         
    elif request.method == 'GET':
        our_family = ManagementDetails.objects.all().first()
        serializer = ManagementDetailsSerializer(our_family)
        return Response(serializer.data,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_management(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    get_role=rejin.user_role
    try:
        customer = ManagementDetails.objects.get(pk=pk)  
        get_old_balance=customer.opening_balance
        get_old_bal_type=customer.opening_balance_type
    except ManagementDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ManagementDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        if get_role=="Admin" or rejin.is_superuser == True:
            try:
                print('super human')
                print(request.data)
                prod=request.data
                
                try:
                    if prod['documents_status']=='false':
                        d_status=False
                    else:
                        d_status=True
                except Exception:
                    pass
                
                try:
                    if prod['images_status']=='false':
                        i_status=False
                    else:
                        i_status=True
                except Exception:
                    pass   
                
                dict87={}
                try:
                    dict87['id']=prod['id']
                except Exception:
                    pass
                dict87['temple_name']=prod['temple_name']
                dict87['address']=prod['address']
                dict87['comments']=prod['comments']
                dict87['opening_balance']=prod['opening_balance']
                dict87['tax_age']=prod['tax_age']
                if prod['opening_balance_type']=='null':
                    dict87['opening_balance_type']=None
                else:
                    dict87['opening_balance_type']=prod['opening_balance_type']
                try:
                    dict87['documents']=prod['documents']
                except Exception:
                    pass
                try:
                    dict87['images']=prod['images']
                except Exception:
                    pass
                print('godd')
                print(request.data['field_count'])
                print(type(request.data['field_count']))
                pc=int(request.data['field_count'])
                print(pc)
                print(type(pc))
                produ_list=[]
                if pc>=1:
                    for num in range(1,pc+1):
                        dict8={}
                        try:
                            if prod[f"management[{num}][id]"]=='null':
                                pass
                            else:
                                p_id=prod[f"management[{num}][id]"]
                                dict8['id']=p_id
                        except Exception:
                            pass
                        
                        dict8['bank_name']=prod[f"management[{num}][bank_name]"]
                        dict8['account_no']=prod[f"management[{num}][account_no]"]
                        dict8['ifsc']=prod[f"management[{num}][ifsc]"]
                        dict8['account_holder_name']=prod[f"management[{num}][account_holder_name]"]
                        dict8['branch_name']=prod[f"management[{num}][branch_name]"]
                        
                        dict8['bank_opening_balance_amt']=prod[f"management[{num}][bank_opening_balance_amt]"]
                        if prod[f"management[{num}][bank_opening_balance_type]"]=='null':
                            dict8['bank_opening_balance_type']=None
                        else:
                            dict8['bank_opening_balance_type']=prod[f"management[{num}][bank_opening_balance_type]"]
                        
                        produ_list.append(dict8)         
                dict87['management']=produ_list
                print('final')
                print(dict87)
            except Exception:
                return Response({"Message":"Data requirement error"},status=status.HTTP_417_EXPECTATION_FAILED)
                    
            serializer876 = ManagementDetailsSerializer(customer,data=dict87)
            if serializer876.is_valid():
                bank=BankDetails.objects.filter(management=customer)
                if bank:
                    m_tr=ManagementTreasure.objects.filter(management_profile=customer).first()
                    for bank_det in bank:
                        bank_obj=BankDetails.objects.get(id=bank_det.id)  
                        check_trans983=CashTransactionDetails.objects.filter(banks=bank_obj)
                        check_trans984=CashTransactionDetails.objects.filter(banks2=bank_obj)
                        if not check_trans983 and not check_trans984:
                            if bank_obj.bank_opening_balance_type == "Credit":
                                bank_obj.credit_amt=float(bank_obj.credit_amt) - float(bank_obj.bank_opening_balance_amt)
                                bank_obj.save()
                                if m_tr:
                                    m_tr.bank_amt=float(m_tr.bank_amt)-float(bank_obj.bank_opening_balance_amt)
                                    m_tr.save()
                            elif bank_obj.bank_opening_balance_type == "Debit":
                                bank_obj.loan_amt=float(bank_obj.loan_amt) - float(bank_obj.bank_opening_balance_amt)
                                bank_obj.save()
                                if m_tr:
                                    m_tr.loan_amt=float(m_tr.loan_amt)-float(bank_obj.bank_opening_balance_amt)
                                    m_tr.save()

                # get_old_balance=customer.opening_balance
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                
                get_new_balance=temp_family.opening_balance    
                new_bal_type=temp_family.opening_balance_type
                
                if get_old_bal_type=='Credit' and get_new_balance<=0:
                    temp_family.opening_balance_type=None
                    temp_family.save()
                    
                if get_old_bal_type=='Debit' and get_new_balance<=0:
                    temp_family.opening_balance_type=None
                    temp_family.save()
                
                if get_old_bal_type == 'Credit' and get_old_balance > 0:
                    chit_funds_with_management_amt = ChitFundsDetails.objects.filter(
                        management_profile=customer, management_amt__gt=0
                    )
                    check_man_interest_given = PeopleInterestDetails.objects.filter(
                        management_profile=customer,
                        interest_type='Management Interest',
                        principal_amt__gt=0,
                    )
                    if chit_funds_with_management_amt or check_man_interest_given:
                        return Response(
                            {
                                "message": (
                                    "Cannot change the opening balance while chit funds or "
                                    "management interest records are linked to the current "
                                    "Credit balance. Please clear or reassign those records "
                                    "first."
                                )
                            },
                            status=status.HTTP_409_CONFLICT,
                        )
                
                    
                check_opnbal_object_all = ManagementBalanceSheet.objects.filter(management_profile=customer)
                
                if check_opnbal_object_all:
                    check_opnbal_object = ManagementBalanceSheet.objects.filter(
                        management_profile=customer, managee=True
                    ).order_by('id').first()
                
                    if check_opnbal_object:
                        if get_old_bal_type == 'Credit' and get_new_balance <= 0:
                            check_opnbal_object.delete()
                        elif get_old_bal_type == 'Debit' and get_new_balance <= 0:
                            check_opnbal_object.delete()
                        else:
                            if temp_family.opening_balance > 0 and temp_family.opening_balance_type is not None:
                                check_opnbal_object.opening_balance_amt = temp_family.opening_balance
                                check_opnbal_object.opening_balance_type = temp_family.opening_balance_type
                                check_opnbal_object.save()
                
                                if check_opnbal_object.opening_balance_type == 'Credit':
                                    repoo = Report.objects.filter(
                                        management_profile=customer, mangebalancesheet=check_opnbal_object
                                    ).first()
                                    if repoo:
                                        repoo.amount = check_opnbal_object.opening_balance_amt
                                        repoo.type_choice = 'Addition'
                                        repoo.created_by = rejin.id
                                        repoo.save()
                                    else:
                                        Report.objects.create(
                                            type_choice="Addition",
                                            management_profile=temp_family,
                                            amount=check_opnbal_object.opening_balance_amt,
                                            created_by=rejin.id,
                                            mangebalancesheet=check_opnbal_object,
                                        )
                                else:
                                    repoo3 = Report.objects.filter(
                                        management_profile=customer, mangebalancesheet=check_opnbal_object
                                    ).first()
                                    if repoo3:
                                        repoo3.amount = check_opnbal_object.opening_balance_amt
                                        repoo3.type_choice = 'Reduction'
                                        repoo3.created_by = rejin.id
                                        repoo3.save()
                                    else:
                                        Report.objects.create(
                                            type_choice="Reduction",
                                            management_profile=temp_family,
                                            amount=check_opnbal_object.opening_balance_amt,
                                            created_by=rejin.id,
                                            mangebalancesheet=check_opnbal_object,
                                        )
                    else:
                        if (
                            temp_family.opening_balance is not None
                            and temp_family.opening_balance > 0
                            and temp_family.opening_balance_type is not None
                        ):
                            todayy = datetime.datetime.now()
                            ki = ManagementBalanceSheet.objects.create(
                                management_profile=temp_family,
                                managee=True,
                                opening_balance_amt=temp_family.opening_balance,
                                date=todayy,
                                opening_balance_type=temp_family.opening_balance_type,
                            )
                            if ki.opening_balance_type == 'Credit':
                                Report.objects.create(
                                    type_choice="Addition",
                                    management_profile=temp_family,
                                    amount=temp_family.opening_balance,
                                    created_by=rejin.id,
                                    mangebalancesheet=ki,
                                )
                            else:
                                Report.objects.create(
                                    type_choice="Reduction",
                                    management_profile=temp_family,
                                    amount=temp_family.opening_balance,
                                    created_by=rejin.id,
                                    mangebalancesheet=ki,
                                )
                
                else:
                    print('wakanda')
                    if temp_family.opening_balance is not None and temp_family.opening_balance > 0:
                        todayy = datetime.datetime.now()
                        ki = ManagementBalanceSheet.objects.create(
                            management_profile=temp_family,
                            managee=True,
                            opening_balance_amt=temp_family.opening_balance,
                            date=todayy,
                            opening_balance_type=temp_family.opening_balance_type,
                        )
                        if ki.opening_balance_type == 'Credit':
                            Report.objects.create(
                                type_choice="Addition",
                                management_profile=temp_family,
                                amount=temp_family.opening_balance,
                                created_by=rejin.id,
                                mangebalancesheet=ki,
                            )
                        else:
                            Report.objects.create(
                                type_choice="Reduction",
                                management_profile=temp_family,
                                amount=temp_family.opening_balance,
                                created_by=rejin.id,
                                mangebalancesheet=ki,
                            )
                                            
                treasure=ManagementTreasure.objects.filter(management_profile=customer).first()  
                if treasure:
                    if get_old_bal_type=='Credit' and new_bal_type=='Credit':
                        if get_new_balance>get_old_balance:
                            calculated_bal=get_new_balance-get_old_balance
                            treasure.cash_in_hand+=calculated_bal
                            treasure.save()
                        elif get_new_balance<get_old_balance:
                            calculated_bal=get_old_balance-get_new_balance
                            treasure.cash_in_hand = max(0, float(treasure.cash_in_hand) - float(calculated_bal))
                            treasure.save()
                            
                    elif get_old_bal_type=='Debit' and new_bal_type=='Debit':
                        if get_new_balance>get_old_balance:
                            calculated_bal=get_new_balance-get_old_balance
                            treasure.expence_amt+=calculated_bal
                            treasure.save()
                        elif get_new_balance<get_old_balance:
                            calculated_bal=get_old_balance-get_new_balance
                            treasure.expence_amt = max(0, float(treasure.expence_amt) - float(calculated_bal))
                            treasure.save()
                               
                    elif get_old_bal_type=='Credit' and new_bal_type=='Debit':
                        treasure.cash_in_hand = max(0, float(treasure.cash_in_hand) - float(get_old_balance))
                        treasure.expence_amt+=get_new_balance
                        treasure.save()
                    elif get_old_bal_type=='Debit' and new_bal_type=='Credit':
                        treasure.cash_in_hand+=get_new_balance
                        treasure.expence_amt = max(0, float(treasure.expence_amt) - float(get_old_balance))
                        treasure.save()
                        
                    elif get_old_bal_type=='Credit' and new_bal_type==None and get_new_balance<=0:
                        treasure.cash_in_hand = max(0, float(treasure.cash_in_hand) - float(get_old_balance))
                        treasure.save()
                        
                    elif get_old_bal_type=='Debit' and new_bal_type==None and get_new_balance<=0:
                        treasure.expence_amt = max(0, float(treasure.expence_amt) - float(get_old_balance))
                        treasure.save()
                        
                    elif new_bal_type=='Credit':
                        treasure.cash_in_hand+=get_new_balance
                        treasure.save()
                    elif new_bal_type=='Debit':
                        treasure.expence_amt+=get_new_balance
                        treasure.save()
                      
                else:
                    if temp_family.opening_balance_type!=None and temp_family.opening_balance!=None and temp_family.opening_balance_type=='Credit' and temp_family.opening_balance>0:    
                        ManagementTreasure.objects.create(management_profile=temp_family,cash_in_hand=temp_family.opening_balance)
                        check_mbal=ManagementBalanceSheet.objects.filter(management_profile=temp_family,managee=True).first()
                        todayy5=datetime.datetime.now()
                        if check_mbal:
                            check_mbal.delete()
                            kie45=ManagementBalanceSheet.objects.create(management_profile=temp_family,managee=True,opening_balance_amt=temp_family.opening_balance,date=todayy5,opening_balance_type=temp_family.opening_balance_type)
                            Report.objects.create(type_choice="Addition",management_profile=temp_family,amount=temp_family.opening_balance,created_by=rejin.id,mangebalancesheet=kie45) 
                        else:
                            kie=ManagementBalanceSheet.objects.create(management_profile=temp_family,managee=True,opening_balance_amt=temp_family.opening_balance,date=todayy5,opening_balance_type=temp_family.opening_balance_type)
                            Report.objects.create(type_choice="Addition",management_profile=temp_family,amount=temp_family.opening_balance,created_by=rejin.id,mangebalancesheet=kie) 
                                    
                    elif temp_family.opening_balance_type!=None and temp_family.opening_balance!=None and temp_family.opening_balance_type=='Debit' and temp_family.opening_balance>0:
                        ManagementTreasure.objects.create(management_profile=temp_family,expence_amt=temp_family.opening_balance)
                        check_mbal4=ManagementBalanceSheet.objects.filter(management_profile=temp_family,managee=True).first()
                        todayy5=datetime.datetime.now()
                        if check_mbal4:
                            check_mbal4.delete()
                            kie45g=ManagementBalanceSheet.objects.create(management_profile=temp_family,managee=True,opening_balance_amt=temp_family.opening_balance,date=todayy5,opening_balance_type=temp_family.opening_balance_type)
                            Report.objects.create(type_choice="Reduction",management_profile=temp_family,amount=temp_family.opening_balance,created_by=rejin.id,mangebalancesheet=kie45g) 
                        else:
                            kie=ManagementBalanceSheet.objects.create(management_profile=temp_family,managee=True,opening_balance_amt=temp_family.opening_balance,date=todayy5,opening_balance_type=temp_family.opening_balance_type)
                            Report.objects.create(type_choice="Reduction",management_profile=temp_family,amount=temp_family.opening_balance,created_by=rejin.id,mangebalancesheet=kie)      
                    else:
                        ManagementTreasure.objects.create(management_profile=temp_family)
                    
                try:
                    if d_status==False:
                        temp_family.documents=None
                        temp_family.save()
                except Exception:
                    pass
                try:
                    if i_status==False:
                        temp_family.images=None
                        temp_family.save()
                except Exception:
                    pass
                
                # change tax eligible 
                fam_mem=Member_Details.objects.filter(management_profile=customer)
                for one_mem in fam_mem:
                    if one_mem.member_dob:
                        today = datetime.date.today()
                        one_mem.member_age = today.year - one_mem.member_dob.year - ((today.month, today.day) < (one_mem.member_dob.month, one_mem.member_dob.day))
                        one_mem.save()
                    if one_mem.member_age!=None and one_mem.member_age>=18:
                        one_mem.adult=True
                        one_mem.save()
                        
                    if not one_mem.death and one_mem.member_relation_ship=='SON' or one_mem.member_relation_ship=='FATHER':
                        get_tax_age=ManagementDetails.objects.all().first().tax_age
                        if get_tax_age>0:
                            gov_tax=get_tax_age
                            
                            if one_mem.member_age >= gov_tax:
                                one_mem.member_tax_eligible = True
                                one_mem.save()
                            else:
                                one_mem.member_tax_eligible = False
                                one_mem.save()
                

                bank1=BankDetails.objects.filter(management=temp_family)
                if bank1:
                    treasure34=ManagementTreasure.objects.filter(management_profile=customer).first()  
                    for bank_det1 in bank1:
                        bank_obj1=BankDetails.objects.get(id=bank_det1.id)

                        check_trans983=CashTransactionDetails.objects.filter(banks=bank_obj1)
                        check_trans984=CashTransactionDetails.objects.filter(banks2=bank_obj1)
                        if not check_trans983 and not check_trans984:
                            if bank_obj1.bank_opening_balance_type == "Credit":
                                bank_obj1.credit_amt=float(bank_obj1.credit_amt) + float(bank_obj1.bank_opening_balance_amt)
                                bank_obj1.save()
                                if treasure34:
                                    treasure34.bank_amt=float(treasure34.bank_amt)+float(bank_obj1.bank_opening_balance_amt)
                                    treasure34.save()
                                    
                                check_bank_rep=Report.objects.filter(banks=bank_obj1,management_profile=temp_family,managee=True).first()
                                if check_bank_rep:
                                    check_bank_rep.amount=bank_obj1.bank_opening_balance_amt
                                    check_bank_rep.created_by=rejin.id
                                    check_bank_rep.type_choice='Addition'
                                    check_bank_rep.save()
                                else:
                                    Report.objects.create(type_choice="Addition",banks=bank_obj1,management_profile=temp_family,amount=bank_obj1.bank_opening_balance_amt,created_by=rejin.id,managee=True)
                                    
                                    
                            elif bank_obj1.bank_opening_balance_type == "Debit":
                                bank_obj1.loan_amt=float(bank_obj1.loan_amt) + float(bank_obj1.bank_opening_balance_amt)
                                bank_obj1.save()
                                if treasure34:
                                    treasure34.loan_amt=float(treasure34.loan_amt)+float(bank_obj1.bank_opening_balance_amt)
                                    treasure34.save()
                                    
                                check_bank_rep=Report.objects.filter(banks=bank_obj1,management_profile=temp_family,managee=True).first()
                                if check_bank_rep:
                                    check_bank_rep.amount=bank_obj1.bank_opening_balance_amt
                                    check_bank_rep.created_by=rejin.id
                                    check_bank_rep.type_choice='Reduction'
                                    check_bank_rep.save()
                                else:
                                    Report.objects.create(type_choice="Reduction",banks=bank_obj1,management_profile=temp_family,amount=bank_obj1.bank_opening_balance_amt,created_by=rejin.id,managee=True)
                                
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="Admin" or rejin.is_superuser == True:
            bank=BankDetails.objects.filter(management=customer)
            if bank:
                for bank_det in bank:
                    bank_obj=BankDetails.objects.get(id=bank_det.id)
                    if bank_obj.bank_opening_balance_type == "Credit":
                        bank_obj.credit_amt=float(bank_obj.credit_amt) - float(bank_obj.bank_opening_balance_amt)
                        bank_obj.save()
                    elif bank_obj.bank_opening_balance_type == "Debit":
                        bank_obj.loan_amt=float(bank_obj.loan_amt) - float(bank_obj.bank_opening_balance_amt)
                        bank_obj.save()
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    
@api_view(['GET'])
def view_bank_details(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    if request.method == 'GET':
        all_banks = BankDetails.objects.filter(management=management)
        serializer = BankDetailsSerializer(all_banks,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    


@api_view(['POST','GET'])
def add_instructions(request):
        rejin=token_checking(request)
        if not rejin:
            return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
        if not rejin.is_active:
            return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
        check_management=ManagementDetails.objects.all()
        if not check_management:
            dict6={}
            dict6['message']= "First Add Management Profile details"
            return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            management=ManagementDetails.objects.all().first()     
        if rejin.user_role:                                                                                                                                                                                                                                                                                                                                                                                                                      
                get_role=rejin.user_role  
        if request.method=="POST": 
            if rejin.is_superuser == True or get_role =="Admin":
                if len(Instructions.objects.filter(management=management)) == 0:
                        serializer=InstructionSerializer(data=request.data) 
                        if serializer.is_valid():
                            instruct=serializer.save()
                            instruct.management=management
                            instruct.save()
                            return Response(serializer.data,status=status.HTTP_201_CREATED)
                        else:
                            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
                else:
                        return Response({'message':'Instructions Already added'},status=status.HTTP_302_FOUND)              
            return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        elif request.method=="GET":
            if len(Instructions.objects.filter(management=management)) == 0:
                    instructions=[]            
                    return Response(instructions,status=status.HTTP_202_ACCEPTED)
            else:         
                add_plan=Instructions.objects.filter(management=management).first()
                serializer=InstructionSerializer(add_plan)
                return Response(serializer.data,status=status.HTTP_200_OK)
          



@api_view(['PUT','GET','DELETE'])
def edit_instructions(request,pk):
        rejin=token_checking(request)
        if not rejin:
            return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
        if not rejin.is_active:
            return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
        check_management=ManagementDetails.objects.all()
        if not check_management:
            dict6={}
            dict6['message']= "First Add Management Profile details"
            return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            management=ManagementDetails.objects.all().first()  
        if rejin.user_role:                                                                                                                                                                                                                                                                                                                                                                                                                      
            get_role=rejin.user_role           
        try:
            add_plan = Instructions.objects.get(id=pk,management=management)            
        except Instructions.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if request.method=="GET":                              
            serializer=InstructionSerializer(add_plan)
            return Response(serializer.data,status=status.HTTP_200_OK)
                    
        
        elif request.method=="PUT":            
            if rejin.is_superuser == True or get_role =="Admin" :   
                serializer = InstructionSerializer(add_plan, data=request.data)    
                if serializer.is_valid():                    
                        instruct=serializer.save()   
                        instruct.management=management
                        instruct.save()                                                    

                        return Response(serializer.data,status=status.HTTP_201_CREATED)
                else:
                        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
            return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        
        elif request.method == 'DELETE':
            if rejin.is_superuser == True or get_role =="Admin":        
                add_plan.delete()
                return Response({'message':"Deleted Successfully"},status=status.HTTP_204_NO_CONTENT)
            return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)