from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import jwt
from .serializers import (
    member_DetailsSerializer, Fammily_DetailsSerializer, Member_DetailsSerializer98,
    Fammily_DetailsSerializer98, Member_DetailsSerializer55, Fammily_DetailsSerializer55,
    Member_DetailsSerializer555, MemberDetailsSerializer, Fammily_DetailsSerializer9843,
    MemberDetailsSerializer654, Fammily_DetailsSerialize87834664,
)
from .models import Fammily_Details, Member_Details
from rest_framework.exceptions import AuthenticationFailed
import pandas as pd
import datetime
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails
from amount.models import PeoplesAmountDetails, PeoplesJOININGAmountDetails
from amount.serializers import PeoplesAmountDetailsSerializer, PeoplesAmount123DetailsSerializer
from collection.models import CollectionDetails
from collection.serializers import CollectionDetailsSerializer
from fund.models import FundMemberDetailss
from permisions.models import Permisions
from death.models import DeathDetails
from treasure.models import ManagementTreasure
from rental.models import RentalAndLeaseDetails, MovableAssetsRents
from rental.serializers import RentalAndLeaseDetailsSerializer, MovableAssetsRentsSerializer
from balancesheet.models import RentalBalanceSheet, MoveableRentBalanceSheet
from balancesheet.serializers import RentalBalanceSheetSerializer, MoveableRentBalanceSheetSerializer
from reports.models import Report, TempleMemberReport
from reports.serializers import TempleMemberReportSerializer
from festival.models import ADDFestivalDetails

# calculate sum
from django.db.models import Sum
from sub_tariff.models import ADDSubscriptionTariffDetails

from django.db import transaction

def _apply_subscription_tariff_penalty_for_member(member, management):
    today = datetime.date.today()
    expired_tariffs = ADDSubscriptionTariffDetails.objects.filter(
        management_profile=management,
        to_date__lt=today,
        action=True,
    )
    for tariff in expired_tariffs:
        with transaction.atomic():
            bill = PeoplesAmountDetails.objects.select_for_update().filter(
                sub_tariff=tariff,
                member=member,
                paid=False,
            ).first()
            if not bill:
                continue

            if not bill.penalty:
                bill.penalty = True
                bill.amount_balance = float(bill.amount_balance) + float(bill.penalty_amount)
                bill.total_bal_amt = float(bill.total_bal_amt) + float(bill.penalty_amount)
                bill.save()

            last_rep = TempleMemberReport.objects.filter(members=member).select_for_update().last()
            prev_bal = float(last_rep.balance_amt) if last_rep else 0

            _, created = TempleMemberReport.objects.get_or_create(
                members=member,
                sub_tariff=tariff,
                type_choice="subscription Tariff Penalty",
                defaults=dict(
                    management_profile=management,
                    reportdate=tariff.to_date + datetime.timedelta(days=1),
                    credit_amt=bill.penalty_amount,
                    balance_amt=prev_bal + float(bill.penalty_amount),
                    created_by=bill.created_by,
                ),
            )

def _apply_festival_penalty_for_member(member, management):
    """
    On-demand festival penalty check for a single member.
    Called on every GET of the member profile so the balance sheet is always
    up-to-date regardless of whether the nightly scheduler has run.

    Logic mirrors my_tasks/views.py::subscription_delete – but scoped to
    one member only so it is fast.  Fully idempotent: safe to call on
    every page load.
    """
    today = datetime.date.today()
    # Find festivals that have expired but whose action flag is still True
    # (scheduler hasn't processed them yet).
    expired_festivals = ADDFestivalDetails.objects.filter(
        management_profile=management,
        end_date__lt=today,
        action=True,
    )
    for fest in expired_festivals:
        bill = PeoplesAmountDetails.objects.filter(
            festival=fest,
            member=member,
            paid=False,
        ).first()
        if not bill:
            continue

        # Apply penalty to running balance exactly once.
        if not bill.penalty:
            bill.penalty = True
            bill.penalty_applied_date = fest.end_date + datetime.timedelta(days=1)
            bill.amount_balance = float(bill.amount_balance) + float(bill.penalty_amount)
            bill.total_bal_amt = float(bill.total_bal_amt) + float(bill.penalty_amount)
            bill.save()
        else:
            bill.penalty = True
            bill.save()

        # Create the "Festival Penalty" ledger row (idempotent).
        already_in_ledger = TempleMemberReport.objects.filter(
            members=member,
            festivals=fest,
            type_choice="Festival Penalty",
        ).exists()
        if already_in_ledger:
            continue

        last_rep = TempleMemberReport.objects.filter(members=member).last()
        prev_bal = float(last_rep.balance_amt) if last_rep else 0
        TempleMemberReport.objects.create(
            management_profile=management,
            members=member,
            festivals=fest,
            reportdate=fest.end_date + datetime.timedelta(days=1),
            credit_amt=bill.penalty_amount,
            balance_amt=prev_bal + float(bill.penalty_amount),
            type_choice="Festival Penalty",
            created_by=bill.created_by,
        )


def _apply_death_penalty_for_member(member, management):
    """
    On-demand death tariff penalty check for a single member.
    Mirrors _apply_festival_penalty_for_member / _apply_subscription_tariff_penalty_for_member.

    IMPORTANT: DeathDetails.member is a OneToOneField to the person who
    DIED — it is NOT the member who owes the death-tariff bill. Bills are
    created against every tax-eligible *living* member in
    death/views.py::add_death_details, linked via PeoplesAmountDetails.death.
    So we must find this member's unpaid death-tariff bills first, then
    walk bill.death to get the relevant DeathDetails record — not filter
    DeathDetails by member=member (that only ever matches the deceased
    person themselves, who never has a bill since bills exclude death=True).
    Fully idempotent: safe to call on every page load.
    """
    today = datetime.date.today()

    bills = PeoplesAmountDetails.objects.filter(
        member=member,
        management_profile=management,
        death__isnull=False,
        paid=False,
    )

    for bill in bills:
        death_rec = bill.death
        if not death_rec or not death_rec.action:
            continue
        if not death_rec.penalty_apply_date or death_rec.penalty_apply_date >= today:
            continue

        if not bill.penalty:
            if death_rec.pen_amt_type == 'Percentage':
                penalty_value = float(death_rec.tariff_peanalty or 0) * (float(death_rec.death_tariff_amt or 0) / 100)
            else:  # 'Amount'
                penalty_value = float(death_rec.tariff_peanalty or 0)

            death_rec.calculated_tariff_peanalty_amt = penalty_value
            death_rec.save()

            bill.penalty = True
            bill.penalty_amount = penalty_value
            bill.amount_balance = float(bill.amount_balance) + penalty_value
            bill.total_bal_amt = float(bill.total_bal_amt) + penalty_value
            bill.save()

        already_in_ledger = TempleMemberReport.objects.filter(
            members=member,
            death_tariff=death_rec,
            type_choice="Death Tariff Penalty",
        ).exists()
        if already_in_ledger:
            continue

        last_rep = TempleMemberReport.objects.filter(members=member).last()
        prev_bal = float(last_rep.balance_amt) if last_rep else 0
        TempleMemberReport.objects.create(
            management_profile=management,
            members=member,
            death_tariff=death_rec,
            reportdate=death_rec.penalty_apply_date + datetime.timedelta(days=1),
            credit_amt=bill.penalty_amount,
            balance_amt=prev_bal + float(bill.penalty_amount),
            type_choice="Death Tariff Penalty",
            created_by=bill.created_by,
        )

def death_no():
    l=DeathDetails.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("DEATH" '%01d' % l)



@api_view(['GET'])
def view_family_link_to_ancester(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        
    if request.method == 'GET':
        if get_role=="User" and perm.fam_view ==True or get_role=="User" and perm.fam_add ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.fam_edit ==True or get_role=="User" and perm.fam_delete ==True:
            
            try:
                customer25 = Fammily_Details.objects.get(pk=pk,management_profile=management) 
            except Fammily_Details.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            
            if customer25.ancestor!=None:
                try:
                    check_anses_family=Fammily_Details.objects.filter(id=int(customer25.ancestor)).first()
                    glad=True
                except Exception:
                    glad=False
                if glad:     
                    serializer = Fammily_DetailsSerializer55(check_anses_family)
                    return Response(serializer.data,status=status.HTTP_200_OK)
                else:
                    return Response([],status=status.HTTP_200_OK)  
            else:
                return Response([],status=status.HTTP_200_OK)        
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)         

@api_view(['GET'])
def alive_family_and_the_members(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        
    if request.method == 'GET':
        if get_role=="User" and perm.fam_view ==True or get_role=="User" and perm.fam_add ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.fam_edit ==True or get_role=="User" and perm.fam_delete ==True:
            our_family = Fammily_Details.objects.filter(management_profile=management,members_count__gt=0)
            serializer = Fammily_DetailsSerialize87834664(our_family,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)   

@api_view(['GET','POST'])
def add_family(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
             
    if request.method =='POST':
        if get_role=="User" and perm.fam_add ==True or get_role=="Admin" or rejin.is_superuser == True:        
            try:
                print('super human')
                print(request.data)
                prod=request.data
                dict87={}
                dict87['ancestor']=prod['ancestor']
                an=prod['ancestor']
                print(f'ansester--{an}')
                print(type(an))
                try:
                    if prod['ancestor']!='null':
                        my_dadfam=Fammily_Details.objects.get(id=an)
                        fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()
                        ans_det=f"{my_dadfam.family_no}/{fath.member_name}"
                    else:
                        ans_det=None
                except Fammily_Details.DoesNotExist:
                    return Response({"Message":"Family detail not found"},status=status.HTTP_404_NOT_FOUND)
                except Exception:
                    return Response({"Message":"Ancester gathering error"},status=status.HTTP_406_NOT_ACCEPTABLE)
                
                dict87['ancestor_detail']=ans_det
                dict87['address']=prod['address']
                dict87['head_member_type']=prod['head_member_type']
                dict87['head_native_type']=prod['head_native_type']
                if prod['years_of_living']=='null':
                    dict87['years_of_living']=0
                else:
                    dict87['years_of_living']=prod['years_of_living']
                
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
                        dict8['family_iddd']="null"
                        dict8['member_name']=prod[f"family[{num}][member_name]"]
                        dict8['member_mobile_number']=prod[f"family[{num}][member_mobile_number]"]
                        dict8['member_dob']=prod[f"family[{num}][member_dob]"]
                        
                        if prod[f"family[{num}][member_email]"]=='null':
                            dict8['member_email']=None
                        else:    
                            dict8['member_email']=prod[f"family[{num}][member_email]"]
                        
                        dict8['member_relation_ship']=prod[f"family[{num}][member_relation_ship]"]
                        
                        if prod[f"family[{num}][member_relation_ship]"]=='FATHER' or prod[f"family[{num}][member_relation_ship]"]=='SON':
                            dict8['member_gender']='Male'
                        else:
                            dict8['member_gender']='Female'
                            
                        dict8['member_balance_amt']=prod[f"family[{num}][member_balance_amt]"]
                        dict8['member_joining_amt']=prod[f"family[{num}][member_joining_amt]"]

                        try:
                            _mp = prod[f"family[{num}][member_photo]"]
                            # Only accept an actual uploaded File. If the
                            # frontend sends the existing URL (str) or the
                            # literal "undefined" (image_send_value was
                            # empty) we skip so the ORM keeps the current
                            # photo instead of overwriting with garbage.
                            if hasattr(_mp, "read") and hasattr(_mp, "name"):
                                dict8['member_photo'] = _mp
                        except Exception:
                            pass
                        
                        # later adding
                        if prod[f"family[{num}][death_date]"] =='null':
                            print('yes expiry is null')
                            expiry=None
                        else:
                            print('expiry else part')
                            expiry=prod[f"family[{num}][death_date]"]
                        dict8['death_date']=expiry
                        
                        if prod[f"family[{num}][death]"] =='true':
                            per_death=True
                        elif prod[f"family[{num}][death]"] =='false':
                            per_death=False
                        else:
                            per_death=False
                        
                        dict8['death']=per_death
                        
                        produ_list.append(dict8)
                
                # check_father
                father_list=[]
                for f in produ_list:
                    for key, value in f.items():
                        if key=="member_relation_ship" and value == "FATHER":
                            father_list.append(f)
                        else:
                            continue
                        
                if not father_list:
                    return Response({"Message":"Father details requirement error"},status=status.HTTP_302_FOUND)
                        
                if len(father_list)>1:
                    return Response({"Message":"Entered Father details are multiple time error"},status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
                            
                dict87['family']=produ_list
                print('final')
                print(dict87)
            except Exception:
                return Response({"Message":"Data requirement error"},status=status.HTTP_417_EXPECTATION_FAILED)
                    
            serializer876 = Fammily_DetailsSerializer(data=dict87)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save()

                
                get_mem_obj=Member_Details.objects.filter(family=temp_family)
                for mem in get_mem_obj:
                    mem.management_profile=management
                    mem.created_by=rejin.id
                    mem.save()
                    
                    if temp_family.head_member_type!=None and temp_family.head_member_type=='NEW':
                        mem.member_balance_amt=0
                        mem.save() 
                    elif temp_family.head_member_type!=None and temp_family.head_member_type=='EXCISTING':
                        mem.member_joining_amt=0
                        mem.save()
                    
                    if mem.member_joining_amt > 0:
                        pj=PeoplesJOININGAmountDetails.objects.create(management_profile=management,amount=mem.member_joining_amt,member=mem,created_by=rejin.id)
                        Report.objects.create(management_profile=management,amount=mem.member_joining_amt,created_by=rejin.id,join_amt=pj,type_choice='Addition')
                        add_amount=ManagementTreasure.objects.filter(management_profile=management).first()
                        add_amount.cash_in_hand += mem.member_joining_amt
                        add_amount.save() 
                    if mem.member_balance_amt > 0:
                        mem.balance_pending_amt += mem.member_balance_amt                        
                        mem.save()    
                        
                        TempleMemberReport.objects.create(management_profile=management,members=mem,reportdate=datetime.date.today(),credit_amt=mem.member_balance_amt,balance_amt=mem.member_balance_amt,
                                                          type_choice='Opening Balance',created_by=rejin.id)
                                      
                    # later adding
                    if mem.death:
                        DeathDetails.objects.create(death_no=death_no(),mangement=management,member=mem,member_name=mem.member_name,created_by=rejin.id,date=datetime.date.today(),
                                                    death_date=mem.death_date,action=True,old_death=True)                         
                cj=Member_Details.objects.filter(family=temp_family,death=False).count()
                kl=Member_Details.objects.filter(family=temp_family,death=True).count()
                temp_family.members_count=cj
                temp_family.death_members_count=kl
                temp_family.save()
                
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
         
    elif request.method == 'GET':
        if get_role=="User" and perm.fam_view ==True or get_role=="User" and perm.fam_add ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.fam_edit ==True or get_role=="User" and perm.fam_delete ==True:
            our_family = Fammily_Details.objects.filter(management_profile=management)
            serializer = Fammily_DetailsSerializer55(our_family,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        
        # list54=[]
        # our_family = Fammily_Details.objects.filter(management_profile=management)
        # for famm in our_family:
        #     dict653={}
        #     serializer1 = Fammily_DetailsSerializer98(famm)
        #     mem_object=Member_Details.objects.filter(family=famm)
        #     serializer2 = Member_DetailsSerializer98(mem_object,many=True)
        #     mem_object_all=Member_Details.objects.filter(family=famm).count()
        #     dict653['family']=serializer1.data
        #     dict653['members']=serializer2.data
        #     dict653['members_count']=mem_object_all
        #     list54.append(dict653)
        # return Response(list54,status=status.HTTP_200_OK)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_family(request,pk):
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
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    
    try:
        customer = Fammily_Details.objects.get(pk=pk,management_profile=management) 
    except Fammily_Details.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = Fammily_DetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        if get_role=="User" and perm.fam_edit ==True or get_role=="Admin" or rejin.is_superuser == True: 
            try:
                print('super human')
                print(request.data)
                prod=request.data
                dict87={}
                dict87['ancestor']=prod['ancestor']
                an=prod['ancestor']
                print(f'ansester--{an}')
                print(type(an))
                try:
                    if prod['ancestor']!='null':
                        my_dadfam=Fammily_Details.objects.get(id=an)
                        fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()
                        ans_det=f"{my_dadfam.family_no}/{fath.member_name}"
                    else:
                        ans_det=None         
                except Fammily_Details.DoesNotExist:
                    return Response({"Message":"Family detail not found"},status=status.HTTP_404_NOT_FOUND)
                except Exception:
                    return Response({"Message":"Ancester gathering error"},status=status.HTTP_406_NOT_ACCEPTABLE)
                
                try:
                    dict87['id']=prod['id']
                except Exception:
                    pass
                
                dict87['ancestor_detail']=ans_det    
                dict87['address']=prod['address']
                dict87['head_member_type']=prod['head_member_type']
                dict87['head_native_type']=prod['head_native_type']
                if prod['years_of_living']=='null':
                    dict87['years_of_living']=0
                else:
                    dict87['years_of_living']=prod['years_of_living']
                
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
                            if prod[f"family[{num}][id]"]=='null':
                                pass
                            else:
                                p_id=prod[f"family[{num}][id]"]
                                dict8['id']=p_id
                        except Exception:
                            pass
                        dict8['family_iddd']=pk
                        dict8['member_name']=prod[f"family[{num}][member_name]"]
                        dict8['member_mobile_number']=prod[f"family[{num}][member_mobile_number]"]
                        dict8['member_dob']=prod[f"family[{num}][member_dob]"]
                        if prod[f"family[{num}][member_email]"]=='null':
                            dict8['member_email']=None
                        else:    
                            dict8['member_email']=prod[f"family[{num}][member_email]"]
                            
                        dict8['member_relation_ship']=prod[f"family[{num}][member_relation_ship]"]
                        
                        if prod[f"family[{num}][member_relation_ship]"]=='FATHER' or prod[f"family[{num}][member_relation_ship]"]=='SON':
                            dict8['member_gender']='Male'
                        else:
                            dict8['member_gender']='Female'
                            
                        dict8['member_balance_amt']=prod[f"family[{num}][member_balance_amt]"]
                        dict8['member_joining_amt']=prod[f"family[{num}][member_joining_amt]"]
                        try:
                            _mp = prod[f"family[{num}][member_photo]"]
                            # Only accept an actual uploaded File. If the
                            # frontend sends the existing URL (str) or the
                            # literal "undefined" (image_send_value was
                            # empty) we skip so the ORM keeps the current
                            # photo instead of overwriting with garbage.
                            if hasattr(_mp, "read") and hasattr(_mp, "name"):
                                dict8['member_photo'] = _mp
                        except Exception:
                            pass
                        
                        # later adding
                        if prod[f"family[{num}][death_date]"] =='null':
                            print('yes expiry is null')
                            expiry=None
                        else:
                            print('expiry else part')
                            expiry=prod[f"family[{num}][death_date]"]
                        dict8['death_date']=expiry
                        
                        if prod[f"family[{num}][death]"] =='true':
                            per_death=True
                        elif prod[f"family[{num}][death]"] =='false':
                            per_death=False
                        else:
                            per_death=False
                        
                        dict8['death']=per_death
                        
                        
                        try:
                            if prod[f"family[{num}][photo_status]"]=='false':
                                dict8['im_status']=False
                            else:
                                dict8['im_status']=True
                        except Exception:
                            pass
                        
                        produ_list.append(dict8)
                
                # check_father
                father_list=[]
                for f in produ_list:
                    for key, value in f.items():
                        if key=="member_relation_ship" and value == "FATHER":
                            father_list.append(f)
                        else:
                            continue
                
                if not father_list:
                    return Response({"Message":"Father details requirement error"},status=status.HTTP_302_FOUND)
                        
                if len(father_list)>1:
                    return Response({"Message":"Entered Father details are multiple time error"},status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)
                            
                dict87['family']=produ_list
                print('final')
                print(dict87)
            except Exception as _e:
                # Log full traceback so photo-upload / other 500s are
                # diagnosable (TC_FAMILYDETAILS_002).
                import traceback as _tb
                _tb.print_exc()
                return Response({"Message":"Data requirement error", "detail": str(_e)},status=status.HTTP_417_EXPECTATION_FAILED)

            serializer876 = Fammily_DetailsSerializer(customer,data=dict87)
            if serializer876.is_valid():
                try:
                    temp_family=serializer876.save()
                except Exception as _e:
                    import traceback as _tb
                    _tb.print_exc()
                    return Response({"Message":"Family save failed","detail":str(_e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                temp_family.created_by=rejin.id
                temp_family.management_profile=management
                temp_family.save()
                
                for im in produ_list:
                    try:
                        print('sts1')
                        u=im['id']
                        if u:
                            try:
                                print('sts2')
                                if im['im_status']==False:
                                    check_object=Member_Details.objects.filter(id=u).first()
                                    if check_object:
                                        check_object.member_photo=None
                                        check_object.save()
                            except Exception:
                                print('sts2 false')
                                pass
                    except Exception:
                        print('sts1 false')
                        pass
                    continue
                
                get_mem_obj=Member_Details.objects.filter(family=temp_family)
                for mem in get_mem_obj:
                    mem.management_profile=management
                    mem.created_by=rejin.id
                    mem.save()
                    
                    if mem.member_joining_amt > 0:
                        people_join=PeoplesJOININGAmountDetails.objects.filter(member=mem,management_profile=management).first()
                        if people_join:
                            amount_diff=people_join.amount
                            people_join.amount=mem.member_joining_amt
                            people_join.member=mem
                            people_join.created_by=rejin.id
                            people_join.save()
                            
                            # check report
                            j_report=Report.objects.filter(management_profile=management,join_amt=people_join,type_choice='Addition').first()
                            if j_report:
                                j_report.amount=mem.member_joining_amt
                                j_report.created_by=rejin.id
                                j_report.save()
                                
                            add_amount=ManagementTreasure.objects.filter(management_profile=management).first()
                            add_amount.cash_in_hand -= amount_diff
                            add_amount.save()
                            add_amount.cash_in_hand += mem.member_joining_amt
                            add_amount.save()
                        else:
                            pj=PeoplesJOININGAmountDetails.objects.create(management_profile=management,amount=mem.member_joining_amt,member=mem,created_by=rejin.id)
                            Report.objects.create(management_profile=management,amount=mem.member_joining_amt,created_by=rejin.id,join_amt=pj,type_choice='Addition')
                            add_amount=ManagementTreasure.objects.filter(management_profile=management).first()
                            add_amount.cash_in_hand += mem.member_joining_amt
                            add_amount.save() 
                              
                    if mem.balance_paid_amount>0:
                        if mem.member_balance_amt < mem.balance_paid_amount:
                            mem.member_balance_amt=mem.balance_pending_amt
                            mem.save()
                        else:
                            geting_old_amt=mem.balance_pending_amt
                            new_b_amt=mem.member_balance_amt
                            
                            if mem.balance_pending_amt!=None:
                                rj_bal_pending=mem.balance_pending_amt
                            else:
                                rj_bal_pending=0
                                
                            if mem.member_balance_amt>rj_bal_pending:
                                dif_cal1=float(mem.member_balance_amt)-float(rj_bal_pending)
                                mem.balance_pending_amt= float(mem.balance_pending_amt) + float(dif_cal1)
                                mem.save()
                                if mem.balance_pending_amt==mem.balance_paid_amount:
                                    mem.balance_amt_paid=True
                                    mem.save()
                                else:
                                    mem.balance_amt_paid=False
                                    mem.save()
                            elif mem.member_balance_amt< rj_bal_pending:
                                if mem.balance_paid_amount==mem.member_balance_amt:
                                    mem.balance_pending_amt=mem.member_balance_amt
                                    mem.balance_amt_paid=True
                                    mem.save()
                                else:
                                    dif_cal2=float(rj_bal_pending)-float(mem.member_balance_amt)
                                    mem.balance_pending_amt-=dif_cal2
                                    mem.save()
                                    if mem.balance_pending_amt==mem.balance_paid_amount:
                                        mem.balance_amt_paid=True
                                        mem.save()
                                    else:
                                        mem.balance_amt_paid=False
                                        mem.save()
                                            
                            tm_balsheeet=TempleMemberReport.objects.filter(members=mem,management_profile=management,type_choice="Opening Balance").first()
                            if tm_balsheeet:
                                check_less=TempleMemberReport.objects.filter(id__lt=tm_balsheeet.id,members=mem)
                                if check_less:
                                    new_mem_report_objmh87 = check_less.last()
                                    tm_balsheeet.credit_amt=mem.member_balance_amt 
                                    tm_balsheeet.balance_amt=float(mem.member_balance_amt)+float(new_mem_report_objmh87.balance_amt)
                                    tm_balsheeet.save()
                                else:
                                    tm_balsheeet.credit_amt=mem.member_balance_amt 
                                    tm_balsheeet.balance_amt=float(mem.member_balance_amt)
                                    tm_balsheeet.save()
                                    
                                if new_b_amt>geting_old_amt:
                                    cal3=float(new_b_amt)-float(geting_old_amt)
                                    new_mem_report_objmh= TempleMemberReport.objects.filter(id__gt=tm_balsheeet.id,members=mem)
                                    for new_mem in  new_mem_report_objmh:
                                        new=TempleMemberReport.objects.get(id=new_mem.id)
                                        new.balance_amt = float(new.balance_amt)+float(cal3)
                                        new.save()
                                elif new_b_amt<geting_old_amt:
                                    cal3=float(geting_old_amt)-float(new_b_amt)
                                    new_mem_report_objmh= TempleMemberReport.objects.filter(id__gt=tm_balsheeet.id,members=mem)
                                    for new_mem in  new_mem_report_objmh:
                                        new=TempleMemberReport.objects.get(id=new_mem.id)
                                        new.balance_amt = float(new.balance_amt)-float(cal3)
                                        new.save()
                            else:
                                c_te_bal=TempleMemberReport.objects.filter(members=mem,management_profile=management).last()
                                if c_te_bal:
                                    my_bad=float(c_te_bal.balance_amt)+float(mem.member_balance_amt)
                                    TempleMemberReport.objects.create(management_profile=management,members=mem,reportdate=datetime.date.today(),credit_amt=mem.member_balance_amt,balance_amt=my_bad,
                                                        type_choice='Opening Balance',created_by=rejin.id)
                                else:
                                    TempleMemberReport.objects.create(management_profile=management,members=mem,reportdate=datetime.date.today(),credit_amt=mem.member_balance_amt,balance_amt=mem.member_balance_amt,
                                                        type_choice='Opening Balance',created_by=rejin.id)   
                                
                            # mem.member_balance_amt=(mem.balance_pending_amt)+(mem.balance_paid_amount)
                            # mem.save()
                            
                    elif mem.balance_paid_amount==0:
                        if mem.member_balance_amt>0:
                            if mem.balance_pending_amt!=mem.member_balance_amt:
                                geting_old_amt=mem.balance_pending_amt
                                new_b_amt=mem.member_balance_amt
                                mem.balance_pending_amt= mem.member_balance_amt                   
                                mem.save()
                                
                                tm_balsheeet=TempleMemberReport.objects.filter(members=mem,management_profile=management,type_choice="Opening Balance").first()
                                if tm_balsheeet:
                                    check_less=TempleMemberReport.objects.filter(id__lt=tm_balsheeet.id,members=mem)
                                    if check_less:
                                        new_mem_report_objmh87 = check_less.last()
                                        tm_balsheeet.credit_amt=mem.member_balance_amt 
                                        tm_balsheeet.balance_amt=float(mem.member_balance_amt)+float(new_mem_report_objmh87.balance_amt)
                                        tm_balsheeet.save()
                                    else:
                                        tm_balsheeet.credit_amt=mem.member_balance_amt 
                                        tm_balsheeet.balance_amt=float(mem.member_balance_amt)
                                        tm_balsheeet.save()
                                        
                                    if new_b_amt>geting_old_amt:
                                        cal3=float(new_b_amt)-float(geting_old_amt)
                                        new_mem_report_objmh= TempleMemberReport.objects.filter(id__gt=tm_balsheeet.id,members=mem)
                                        for new_mem in  new_mem_report_objmh:
                                            new=TempleMemberReport.objects.get(id=new_mem.id)
                                            new.balance_amt = float(new.balance_amt)+float(cal3)
                                            new.save()
                                    elif new_b_amt<geting_old_amt:
                                        cal3=float(geting_old_amt)-float(new_b_amt)
                                        new_mem_report_objmh= TempleMemberReport.objects.filter(id__gt=tm_balsheeet.id,members=mem)
                                        for new_mem in  new_mem_report_objmh:
                                            new=TempleMemberReport.objects.get(id=new_mem.id)
                                            new.balance_amt = float(new.balance_amt)-float(cal3)
                                            new.save()
                                else:
                                    c_te_bal=TempleMemberReport.objects.filter(members=mem,management_profile=management).last()
                                    if c_te_bal:
                                        my_bad=float(c_te_bal.balance_amt)+float(mem.member_balance_amt)
                                        TempleMemberReport.objects.create(management_profile=management,members=mem,reportdate=datetime.date.today(),credit_amt=mem.member_balance_amt,balance_amt=my_bad,
                                                          type_choice='Opening Balance',created_by=rejin.id)
                                    else:
                                        TempleMemberReport.objects.create(management_profile=management,members=mem,reportdate=datetime.date.today(),credit_amt=mem.member_balance_amt,balance_amt=mem.member_balance_amt,
                                                          type_choice='Opening Balance',created_by=rejin.id)    
                        else:
                            tm_balsheeet=TempleMemberReport.objects.filter(members=mem,management_profile=management,type_choice="Opening Balance").first()
                            if tm_balsheeet:
                                new_mem_report_objmh= TempleMemberReport.objects.filter(id__gt=tm_balsheeet.id,members=mem)
                                for new_mem in  new_mem_report_objmh:
                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                    new.balance_amt = float(new.balance_amt)-float(tm_balsheeet.credit_amt)
                                    new.save() 
                                tm_balsheeet.delete()
                            
                    # later adding
                    if mem.death:
                        check_death_list=DeathDetails.objects.filter(mangement=management,member=mem).first()
                        if check_death_list:
                            if check_death_list.old_death:
                                check_death_list.date=datetime.date.today()
                                check_death_list.death_date=mem.death_date
                                check_death_list.created_by=rejin.id
                                check_death_list.save()
                            else:
                                mem.death_date=check_death_list.death_date
                                mem.save()
                        else:
                            DeathDetails.objects.create(death_no=death_no(),mangement=management,member=mem,member_name=mem.member_name,created_by=rejin.id,date=datetime.date.today(),
                                                    death_date=mem.death_date,action=True,old_death=True)
                    else:
                        check_death_list1=DeathDetails.objects.filter(mangement=management,member=mem).first()
                        if check_death_list1:
                            if check_death_list1.old_death:
                                check_death_list1.delete()
                                mem.death_date=None
                                mem.death=False
                                mem.save()
                            else:
                                mem.death=True
                                mem.death_date=check_death_list1.death_date
                                mem.save()
                        
                cj=Member_Details.objects.filter(family=temp_family,death=False).count()
                kl=Member_Details.objects.filter(family=temp_family,death=True).count()
                ma5=Member_Details.objects.filter(family=temp_family,marriage_remove=True).count()
                temp_family.members_count=cj
                temp_family.death_members_count=kl
                temp_family.married_remove_count=ma5
                temp_family.save()
                                
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="User" and perm.fam_edit ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.fam_delete ==True:
            check_fam_ances=Fammily_Details.objects.filter(ancestor=str(pk))
            if check_fam_ances:
                return Response({'message':"Cannot be deleted"},status.HTTP_302_FOUND) 
            member_enable=Member_Details.objects.filter(family=pk)
            for member in member_enable:
                amount_check=PeoplesAmountDetails.objects.filter(member=member) or CollectionDetails.objects.filter(member=member) or DeathDetails.objects.filter(member=member) or User.objects.filter(member=member)
                if amount_check:
                    return Response({'message':"Cannot be deleted"},status.HTTP_302_FOUND)              
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def family_group_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    # get_role=rejin.user_role
    # if rejin.my_role!=None:
    #     permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
    #     if permiss:
    #         perm=Permisions.objects.get(id=rejin.my_role.id)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
        
    if request.method == 'GET':
        all_fam = Fammily_Details.objects.filter(management_profile=management)
        final_list=[]
        for fam in all_fam:
            all_mem=Member_Details.objects.filter(family=fam).count()
            dict87={}
            serializer1 = Fammily_DetailsSerializer98(fam)
            try:
                check_head=Member_Details.objects.filter(family=fam,head=True,member_relation_ship='FATHER').first()
                serializer2 = Member_DetailsSerializer98(check_head)
            except Exception:
                serializer2={}
            members=Member_Details.objects.filter(family=fam,head=False)
            serializer3 = Member_DetailsSerializer98(members,many=True)
            dict87['family']=serializer1.data
            dict87['head']=serializer2.data
            dict87['member']=serializer3.data
            dict87['member_count'] = all_mem
            final_list.append(dict87)
        return Response(final_list,status=status.HTTP_200_OK)
  
@api_view(['GET'])
def ansester_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        
    if request.method == 'GET':
        our_MEMBERS = Fammily_Details.objects.filter(management_profile=management)
        # serializer = Fammily_DetailsSerializer98(our_MEMBERS,many=True)
        serializer=Fammily_DetailsSerializer9843(our_MEMBERS,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
@api_view(['GET'])
def ansester_view_edit_family(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        
    if request.method == 'GET':
        our_MEMBERS = Fammily_Details.objects.filter(management_profile=management).exclude(pk=pk)
        serializer=Fammily_DetailsSerializer9843(our_MEMBERS,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
@api_view(['GET'])
def family_mem_nodeath_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        
    if request.method == 'GET':
        our_MEMBERS = Fammily_Details.objects.filter(management_profile=management)
        famiy_list=[]
        for fam in our_MEMBERS:
            mem=Member_Details.objects.filter(family=fam).count()
            death_mem=Member_Details.objects.filter(family=fam,death=True).count()
            if int(mem)!=int(death_mem):
                dict97={}
                serial1=Fammily_DetailsSerializer98(fam)
                members=Member_Details.objects.filter(family=fam,death=False)
                serial2=Member_DetailsSerializer98(members,many=True)
                dict97['family']=serial1.data
                dict97['members']=serial2.data
                famiy_list.append(dict97)
    
        return Response(famiy_list,status=status.HTTP_200_OK)


@api_view(['GET'])
def members_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        
    if request.method == 'GET':
        our_MEMBERS = Member_Details.objects.filter(management_profile=management)
        all_mem=[]
        for mem in our_MEMBERS:
            dict96={}
            serializer1 = Member_DetailsSerializer98(mem)
            dict96['member']=serializer1.data
            dict96['family_no']=mem.family.family_no
            dict96['address']=mem.family.address
            
            all_mem.append(dict96)
            
        # serializer = Member_DetailsSerializer98(our_MEMBERS,many=True)
        # return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(all_mem,status=status.HTTP_200_OK)
    
@api_view(['GET'])
def death_members_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        
    if request.method == 'GET':
        our_MEMBERS = Member_Details.objects.filter(management_profile=management,death=True)
        all_mem=[]
        for mem in our_MEMBERS:
            dict96={}
            serializer1 = Member_DetailsSerializer98(mem)
            dict96['member']=serializer1.data
            dict96['family_no']=mem.family.family_no
            dict96['address']=mem.family.address
            all_mem.append(dict96)
            
        return Response(all_mem,status=status.HTTP_200_OK)
    
@api_view(['GET'])
def marriage_remove_members_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        
    if request.method == 'GET':
        our_MEMBERS = Member_Details.objects.filter(management_profile=management,marriage_remove=True)
        all_mem=[]
        for mem in our_MEMBERS:
            dict96={}
            serializer1 = Member_DetailsSerializer98(mem)
            dict96['member']=serializer1.data
            dict96['family_no']=mem.family.family_no
            dict96['address']=mem.family.address
            all_mem.append(dict96)
            
        return Response(all_mem,status=status.HTTP_200_OK)
    
@api_view(['GET'])
def alive_members_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        
    if request.method == 'GET':
        our_MEMBERS = Member_Details.objects.filter(management_profile=management,death=False,action=True,marriage_remove=False)
        all_mem=[]
        for mem in our_MEMBERS:
            dict96={}
            serializer1 = Member_DetailsSerializer98(mem)
            dict96['member']=serializer1.data
            dict96['family_no']=mem.family.family_no
            dict96['address']=mem.family.address
            all_mem.append(dict96) 
        return Response(all_mem,status=status.HTTP_200_OK)
    
@api_view(['GET'])
def leaving_members_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        
    if request.method == 'GET':
        our_MEMBERS = Member_Details.objects.filter(management_profile=management,action=False)
        all_mem=[]
        for mem in our_MEMBERS:
            dict96={}
            serializer1 = Member_DetailsSerializer98(mem)
            dict96['member']=serializer1.data
            dict96['family_no']=mem.family.family_no
            dict96['address']=mem.family.address
            all_mem.append(dict96) 
        return Response(all_mem,status=status.HTTP_200_OK)
    

@api_view(['GET'])
def tariff_members_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
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
        
    if request.method == 'GET':
        our_MEMBERS = Member_Details.objects.filter(management_profile=management,death=False,action=True,marriage_remove=False,member_tax_eligible=True)
        all_mem=[]
        for mem in our_MEMBERS:
            dict96={}
            serializer1 = Member_DetailsSerializer98(mem)
            dict96['member']=serializer1.data
            dict96['family_no']=mem.family.family_no
            dict96['address']=mem.family.address
            all_mem.append(dict96) 
        return Response(all_mem,status=status.HTTP_200_OK)
        
    
@api_view(['GET'])
def single_member_view(request, pk):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)

    check_management = ManagementDetails.objects.all()
    if not check_management:
        dict6 = {}
        dict6['message'] = "First Add Management Profile details"
        return Response(dict6, status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management = ManagementDetails.objects.all().first()

    try:
        mer = Member_Details.objects.get(pk=pk, management_profile=management)
    except Member_Details.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        try:
            # Apply any overdue festival penalties for this member on-the-fly.
            _apply_festival_penalty_for_member(mer, management)
            _apply_subscription_tariff_penalty_for_member(mer, management)
            _apply_death_penalty_for_member(mer, management)
            serializer1 = Member_DetailsSerializer98(mer)
            # ... (rest of the existing GET body, unchanged, all the way to
            # the final `return Response(dict32, status=status.HTTP_200_OK)`) ...
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"message": "Debug error", "detail": str(e)}, status=500)
        check_t_m_pen_bal = TempleMemberReport.objects.filter(members=mer).last()
        if check_t_m_pen_bal:
            t_m_pen_bal = check_t_m_pen_bal.balance_amt
        else:
            t_m_pen_bal = 0

        # Exclude dues whose parent festival has been marked as completed
        # (action=False). Completed festivals must NOT appear as pending on
        # the member's profile.
        getting_amt = PeoplesAmountDetails.objects.filter(
            member=mer,
            management_profile=management,
        ).exclude(festival__isnull=False, festival__action=False)
        serializer2 = PeoplesAmountDetailsSerializer(getting_amt, many=True)
        ser = PeoplesAmount123DetailsSerializer(getting_amt, many=True)

        total_amount_obj = PeoplesAmountDetails.objects.filter(
            member=mer,
            management_profile=management,
        ).exclude(festival__isnull=False, festival__action=False).aggregate(
            total_amount=Sum('amount'),
            total_penalty_amount=Sum('penalty_amount'),
            total_amount_balance=Sum('amount_balance'),
            total_penalty_balance=Sum('penalty_balance'),
            total_paid_amt=Sum('total_paid_amt'),
            total_bal_amt=Sum('total_bal_amt')
        )

        # Access the total values
        total_amount_value = total_amount_obj['total_amount'] or 0
        total_penalty_amount_value = total_amount_obj['total_penalty_amount'] or 0
        total_amount_balance_value = total_amount_obj['total_amount_balance'] or 0
        total_penalty_balance_value = total_amount_obj['total_penalty_balance'] or 0
        total_paid_amt_value = total_amount_obj['total_paid_amt'] or 0
        total_bal_amt_value = total_amount_obj['total_bal_amt'] or 0

        penalty_obj = PeoplesAmountDetails.objects.filter(member=mer, management_profile=management, penalty=True)
        serializer3 = PeoplesAmountDetailsSerializer(penalty_obj, many=True)

        pending_obj = PeoplesAmountDetails.objects.filter(member=mer, management_profile=management, penalty=True, paid=False)
        serializer4 = PeoplesAmountDetailsSerializer(pending_obj, many=True)

        # paid
        coll_obj = CollectionDetails.objects.filter(management_profile=management, member=mer)
        serializer5 = CollectionDetailsSerializer(coll_obj, many=True)
        collection_obj = CollectionDetails.objects.filter(
            member=mer, management_profile=management, rentsandlease=None,
            moveablerent=None, funds=None, interest=None,
            interest_balance=None, fund_member=None
        ).aggregate(total_coll_amount=Sum('amount'))

        total_paid_amount_value = collection_obj['total_coll_amount'] or 0

        out = []
        member_rental_lease = RentalAndLeaseDetails.objects.filter(tenat_member_id=pk)
        for i in member_rental_lease:
            d = {}
            collection_detail = CollectionDetails.objects.filter(rentsandlease=i)
            serializer11 = CollectionDetailsSerializer(collection_detail, many=True)
            balance_rent_details = RentalBalanceSheet.objects.filter(rental_new_amt=i).first()
            serializer10 = RentalBalanceSheetSerializer(balance_rent_details)
            d['balance_details'] = serializer10.data
            d['collection_details'] = serializer11.data
            out.append(d)

        reports = TempleMemberReport.objects.filter(members=mer)
        serial2 = TempleMemberReportSerializer(reports, many=True)

        # --- FIX: guard against a created_by value that doesn't resolve to
        # an existing User (deleted user / stale id). Previously this
        # dereferenced `user_id.username` even when the lookup returned
        # None, causing an unhandled AttributeError -> 500. ---
        member_id = PeoplesJOININGAmountDetails.objects.filter(member=pk).first()
        user_id = None
        if member_id:
            user_id = User.objects.filter(id=member_id.created_by).first()

        dict32 = {}
        dict32['profile'] = serializer1.data
        dict32['family_no'] = mer.family.family_no
        dict32['address'] = mer.family.address
        dict32['balance_sheet'] = ser.data
        dict32['penalty_histry'] = serializer3.data
        dict32['penalty_amt_total'] = total_penalty_amount_value
        dict32['pending'] = serializer4.data
        dict32['pending_amt_total'] = total_amount_balance_value  # not include penalty balance amt
        dict32['paid_histry'] = serializer5.data
        dict32['paid_amt_total'] = total_paid_amount_value
        dict32['member_rental_lease'] = out
        dict32['balancesheet_total'] = total_bal_amt_value
        dict32['temple_mem_balancesheet'] = serial2.data
        dict32['temple_mem_pending_amt'] = t_m_pen_bal
        dict32['bill_by_name'] = user_id.username if user_id else ""

        return Response(dict32, status=status.HTTP_200_OK)
    

@api_view(['GET'])
def marriage_groom_family_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    # get_role=rejin.user_role
    # if rejin.my_role!=None:
    #     permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
    #     if permiss:
    #         perm=Permisions.objects.get(id=rejin.my_role.id)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
        
    if request.method == 'GET':
        family = Fammily_Details.objects.filter(management_profile=management)
        all_family=[]
        for fam in family:
            all_members=Member_Details.objects.filter(family=fam,member_relation_ship='SON',death=False,adult=True,member_age__gte=21)
            if all_members:
                dict56={}
                ser3=Fammily_DetailsSerializer98(fam)
                ser4=Member_DetailsSerializer98(all_members,many=True)
                dict56['family']=ser3.data
                dict56['mem']=ser4.data
                all_family.append(dict56)  
        return Response(all_family,status=status.HTTP_200_OK)
    

@api_view(['GET'])
def marriage_bride_family_view(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    # get_role=rejin.user_role
    # if rejin.my_role!=None:
    #     permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
    #     if permiss:
    #         perm=Permisions.objects.get(id=rejin.my_role.id)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
        
    if request.method == 'GET':
        family = Fammily_Details.objects.filter(management_profile=management)
        all_family=[]
        for fam in family:
            all_members=Member_Details.objects.filter(family=fam,member_relation_ship='DAUGHTER',marriage_remove=False,death=False,adult=True)
            if all_members:
                dict56={}
                ser3=Fammily_DetailsSerializer98(fam)
                ser4=Member_DetailsSerializer98(all_members,many=True)
                dict56['family']=ser3.data
                dict56['mem']=ser4.data
                all_family.append(dict56)    
        return Response(all_family,status=status.HTTP_200_OK)





@api_view(['GET','POST'])
def ancestor_tree_view(request,pk):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    # get_role=rejin.user_role
    # if rejin.my_role!=None:
    #     permiss=Permisions.objects.filter(id=rejin.my_role.id).first()
    #     if permiss:
    #         perm=Permisions.objects.get(id=rejin.my_role.id)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
        
    if request.method == 'GET':
        fam = Fammily_Details.objects.get(id=pk)
        family = Fammily_Details.objects.filter(id=pk)
        result_list = [fam]
        i = 0
        while i < len(family):
            family_obj = Fammily_Details.objects.get(id=family[i].id)
            while family_obj.ancestor != "null" and family_obj.ancestor.isdigit():
                ancestor_id = int(family_obj.ancestor)
                new_fam = Fammily_Details.objects.filter(id=ancestor_id).first()
                new_fam_obj = Fammily_Details.objects.filter(id=ancestor_id)
                result_list.append(new_fam)
                j = 0
                while j < len(new_fam_obj):
                    new1 = new_fam_obj[j]
                    if new1.ancestor != "null" and new1.ancestor.isdigit():
                        ancestor_id = int(new1.ancestor)
                        new_fam = Fammily_Details.objects.filter(id=ancestor_id).first()
                        new_fam_obj = Fammily_Details.objects.filter(id=ancestor_id)
                        result_list.append(new_fam)
                    j += 1
                family_obj = new_fam  # Update family_obj for the next iteration
            i += 1
        result_list.reverse()

        serializer = Fammily_DetailsSerializer(result_list, many=True)
        print(serializer.data)

        return Response(serializer.data,status=status.HTTP_200_OK)
    

@api_view(['GET','PUT',"DELETE"])
def movablerentassetmember_viewlist(request,pk):
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
    rental_details=MovableAssetsRents.objects.filter(tenat_member_id=pk).first()
    serializer=MovableAssetsRentsSerializer(rental_details)
    balance_rent_details=MoveableRentBalanceSheet.objects.filter(moveablerent=rental_details).first()
    serializer2=MoveableRentBalanceSheetSerializer(balance_rent_details)
    collection_details=CollectionDetails.objects.filter(moveablerent=rental_details)
    out=[]
    collection_amount=CollectionDetails.objects.filter(moveablerent_id=pk).aggregate(Sum('amount')).get('amount__sum')
    serializer3=CollectionDetailsSerializer(collection_details,many=True)
    out.append(serializer3.data)

    dict32={}
    dict32['rent_lease']=serializer.data
    dict32['rent_balance_sheet']=serializer2.data
    dict32['collection_details']=out
    dict32['collection_amount']=collection_amount
    return Response(dict32,status=status.HTTP_200_OK)


@api_view(['POST'])
def Single_mem_balancesheet(request):
    rejin=token_checking(request)
    if not rejin:
        return Response({"message":"No User Found"},status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message":"Not Authorized Please Contact Admin"},status=status.HTTP_401_UNAUTHORIZED)
    print(f'token---{rejin}')
    # get_role=rejin.user_role
    # if rejin.my_role!=None:
    #     permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
    #     if permiss:
    #         perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
        
    if request.method == 'POST':
        # ------------------------------------------------------------------
        # Guard against missing / malformed inputs. Previously any KeyError
        # or bad date value bubbled up as a raw 500 to the operator.
        # ------------------------------------------------------------------
        try:
            memid = int(request.data.get('id'))
        except (TypeError, ValueError):
            return Response({"message": "Member id is required"}, status=status.HTTP_400_BAD_REQUEST)

        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        if not start_date or not end_date:
            return Response(
                {"message": "start_date and end_date are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        dict98={}
        member=Member_Details.objects.filter(id=memid).first()
        if not member:
            return Response({"message": "Member not found"}, status=status.HTTP_404_NOT_FOUND)
        setrial1=Member_DetailsSerializer98(member)
        dict98['member']=setrial1.data
        reports=TempleMemberReport.objects.filter(members=member,reportdate__gte=start_date,reportdate__lte=end_date)
        out=[]
        if reports:
            serial2=TempleMemberReportSerializer(reports,many=True)
            dict98['table']=serial2.data
            dict98['start_date']=request.data['start_date']
            dict98['end_date']=request.data['end_date']
        else:

          report_check=  TempleMemberReport.objects.filter(members=member).last()

          dict1={}
          dict1['reportdate']=""
          dict1['type_choice']="Opening Balance"
          dict1['credit_amt']=""
          dict1['debit_amt']=""
          # Guard: a member with no reports at all previously crashed here
          # (`NoneType` had no `balance_amt`). Fall back to 0 so the UI can
          # still show an empty balance sheet cleanly.
          dict1['balance_amt']= report_check.balance_amt if report_check else 0
          dict1['name_type']=""
          dict1['pre_balance_amt']=""
          out.append(dict1)
          dict98={}
          dict98['table']=out
          dict98['start_date']=request.data['start_date']
          dict98['end_date']=request.data['end_date']
        return Response(dict98,status=status.HTTP_200_OK)
