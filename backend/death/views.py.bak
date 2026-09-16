from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from.serializers import DeathDetailsSerializer,DeathDetailsSerializer45
from .models import DeathDetails
from token_app.views import token_checking, generate_token
from user.models import User
import datetime
from management.models import ManagementDetails
from family.models import Member_Details,Fammily_Details
from permisions.models import Permisions
from amount.models import PeoplesAmountDetails
from collection.models import CollectionDetails
from datetime import timedelta
from reports.models import TempleMemberReport


# def death_no():
#     l=DeathDetails.objects.last()
#     if l:
#         l=l.id   
#     else:
#         l=0      
#     l=l+1

#     return ("DEATH" '%01d' % l)

@api_view(['GET','POST'])
def add_death_details(request):
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
    print(f'token---{rejin}')    
    check_management=ManagementDetails.objects.all()
    if not check_management:
        dict6={}
        dict6['message']= "First Add Management Profile details"
        return Response(dict6,status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        management=ManagementDetails.objects.all().first()
    
    if request.method =='POST':        
        if get_role=="User" and perm.death_add ==True or get_role=="Admin" or rejin.is_superuser == True: 
             
            serializer876 = DeathDetailsSerializer(data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.mangement=management
                # temp_family.death_no=death_no()
                temp_family.save()
                
                try:
                    death_mem=Member_Details.objects.get(id=temp_family.member_id)
                    death_mem.death=True
                    death_mem.death_date=temp_family.death_date
                    death_mem.save()
                    
                    cj=Member_Details.objects.filter(family=death_mem.family,death=False,marriage_remove=False).count()
                    kl=Member_Details.objects.filter(family=death_mem.family,death=True).count()
                    ma5=Member_Details.objects.filter(family=death_mem.family,marriage_remove=True).count()
            
                    take_fam=Fammily_Details.objects.get(id=death_mem.family_id)
                    take_fam.members_count=cj
                    take_fam.death_members_count=kl
                    take_fam.married_remove_count=ma5
                    take_fam.save()
                except Exception:
                    print('death member geting error')
                    pass
                
                get_tax_members=Member_Details.objects.filter(management_profile=management,member_tax_eligible=True,death=False,member_gender="Male")
                for mem_tax in get_tax_members:
                    people_amount=PeoplesAmountDetails.objects.create(management_profile=management,member=mem_tax,death=temp_family,amount=temp_family.death_tariff_amt,name='Death',created_by=rejin.id,total_bal_amt=temp_family.death_tariff_amt,amount_balance=temp_family.death_tariff_amt)
                    if temp_family.pen_amt_type=="Amount":
                        people_amount.penalty_amount=temp_family.tariff_peanalty
                        people_amount.save()
                    elif temp_family.pen_amt_type=="Percentage":
                        amount_cal=temp_family.tariff_peanalty * (temp_family.death_tariff_amt/100)
                        people_amount.penalty_amount=amount_cal
                        people_amount.save()
                    mem_report= TempleMemberReport.objects.filter(members=mem_tax)
                    if mem_report:
                        mem_report_obj= TempleMemberReport.objects.filter(members=mem_tax).last()
                        bal=float(mem_report_obj.balance_amt) + float(temp_family.death_tariff_amt)
                        tem_report=TempleMemberReport.objects.create(management_profile=management,members=mem_tax,death_tariff=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.death_tariff_amt,balance_amt=bal,type_choice="Death Tariff",created_by=rejin.id)
                    else:
                        tem_report=TempleMemberReport.objects.create(management_profile=management,members=mem_tax,death_tariff=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.death_tariff_amt,balance_amt=temp_family.death_tariff_amt,type_choice="Death Tariff",created_by=rejin.id)

                                     
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                print(serializer876.errors)
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    elif request.method == 'GET':
        # our_family = DeathDetails.objects.all()
        # serializer = DeathDetailsSerializer(our_family,many=True)
        # return Response(serializer.data,status=status.HTTP_200_OK)
        if get_role=="User" and perm.death_add ==True or get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.death_view==True or get_role=="User" and perm.death_delete==True or get_role=="User" and perm.death_edit==True:        
            list76=[]
            our_familys = DeathDetails.objects.filter(mangement=management)
            for fam in our_familys:
                serializer = DeathDetailsSerializer(fam)
                dict76={}
                if fam.member!=None:
                    dict76['family_no']=fam.member.family.family_no
                dict76['death']=serializer.data
                list76.append(dict76)  
            return Response(list76,status=status.HTTP_200_OK)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_death_details(request,pk):
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
    
    get_role=rejin.user_role
    if rejin.my_role!=None:
        permiss=Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
        if permiss:
            perm=Permisions.objects.get(role_link_id=rejin.my_role.id)
    try:
        customer = DeathDetails.objects.get(pk=pk)  
        cal_rep_amt=customer.death_tariff_amt

        excisting_mem=customer.member
        if excisting_mem:
            take_id=customer.member_id
    except DeathDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':        
        serializer = DeathDetailsSerializer(customer)
        dict76={}
        dict76['family_no']=customer.member.family.family_no
        dict76['death']=serializer.data
        return Response(dict76,status=status.HTTP_200_OK)
        
    elif request.method == 'PUT':
        if get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.death_edit==True: 

            print(f'old----{excisting_mem}')
            collection_check=CollectionDetails.objects.filter(death_tariff_id=pk)  
            if collection_check:
                return Response({'message':"Cannot be edited as it is involved in transactions"},status.HTTP_302_FOUND) 
            # date_check=  (customer.penalty_apply_date.month != datetime.datetime.now().month and customer.penalty_apply_date.year != datetime.datetime.now().year)  or  (customer.penalty_apply_date.month != datetime.datetime.now().month and customer.penalty_apply_date.year == datetime.datetime.now().year)   or (customer.penalty_apply_date.month == datetime.datetime.now().month and customer.penalty_apply_date.year != datetime.datetime.now().year)     
            # if date_check:
            #     return Response({'message':"Cannot be edited"},status.HTTP_302_FOUND) 
            
            prod=request.data
            try:
                if prod['documents_status']=='false':
                    documents_status=False
                else:
                    documents_status=True
            except Exception:
                pass
            
            try:
                if prod['photo_status']=='false':
                    photo_status=False
                else:
                    photo_status=True
            except Exception:
                pass
            
            if customer.old_death:
                rj_dic={}
                try:
                    rj_dic['documents']=request.data['documents']
                except Exception:
                    pass
                try:
                    rj_dic['photo']=request.data['photo']
                except Exception:
                    pass
                
                rj_dic['death_date']=request.data['death_date']
                    
                serializer8769664 = DeathDetailsSerializer45(customer,data=rj_dic)
                if serializer8769664.is_valid():
                    serializer8769664.save()
                    # customer.death_date=request.data['death_date']
                    mem=Member_Details.objects.filter(id=customer.member_id).first()
                    mem.death_date=request.data['death_date']
                    mem.death=True
                    mem.save()
                    # customer.save()
                    
                    try:
                        if documents_status==False:
                            customer.documents=None
                            customer.save()
                    except Exception:
                        pass
                    try:
                        if photo_status==False:
                            customer.photo=None
                            customer.save()
                    except Exception:
                        pass
                    return Response(serializer8769664.data,status=status.HTTP_201_CREATED)  
                else:        
                    return Response(serializer8769664.errors,status=status.HTTP_400_BAD_REQUEST)
                
            if customer.penalty_apply_date!=None and customer.penalty_apply_date<= datetime.datetime.now().date():
                rj_dic={}
                try:
                    rj_dic['documents']=request.data['documents']
                except Exception:
                    pass
                try:
                    rj_dic['photo']=request.data['photo']
                except Exception:
                    pass
                    
                serializer876966 = DeathDetailsSerializer45(customer,data=rj_dic)
                if serializer876966.is_valid():
                    serializer876966.save()
                    try:
                        if documents_status==False:
                            customer.documents=None
                            customer.save()
                    except Exception:
                        pass
                    try:
                        if photo_status==False:
                            customer.photo=None
                            customer.save()
                    except Exception:
                        pass
                    return Response({'message':"Document and images can only be edited as penalty date is reached"},status.HTTP_302_FOUND) 
                else:        
                    return Response(serializer876966.errors,status=status.HTTP_400_BAD_REQUEST)
            
            serializer876 = DeathDetailsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                try:
                    new_mem=temp_family.member
                    print(f'new---{new_mem}')
                    if new_mem!=excisting_mem:
                        # new memb death update
                        death_mem=Member_Details.objects.get(id=temp_family.member_id)
                        death_mem.death=True
                        death_mem.save()
                        
                        check_amount_object=PeoplesAmountDetails.objects.filter(death=customer,member=death_mem).first()
                        if check_amount_object:
                            check_amount_object.delete()
                        
                        cj=Member_Details.objects.filter(family=death_mem.family,death=False,marriage_remove=False).count()
                        kl=Member_Details.objects.filter(family=death_mem.family,death=True).count()
                        ma5=Member_Details.objects.filter(family=death_mem.family,marriage_remove=True).count()
                
                        take_fam=Fammily_Details.objects.get(id=death_mem.family_id)
                        take_fam.members_count=cj
                        take_fam.death_members_count=kl
                        take_fam.married_remove_count=ma5
                        take_fam.save()
                        
                        # OLD DEATH MEMBER
                        death_mem65=Member_Details.objects.get(id=take_id)
                        death_mem65.death=False
                        death_mem65.death_date=None
                        death_mem65.save()
                        
                        cj=Member_Details.objects.filter(family=death_mem65.family,death=False,marriage_remove=False).count()
                        kl=Member_Details.objects.filter(family=death_mem65.family,death=True).count()
                        ma5=Member_Details.objects.filter(family=death_mem65.family,marriage_remove=True).count()
                
                        take_fam=Fammily_Details.objects.get(id=death_mem65.family_id)
                        take_fam.members_count=cj
                        take_fam.death_members_count=kl
                        take_fam.married_remove_count=ma5
                        take_fam.save()
                        if death_mem65.member_tax_eligible:
                            d_tariff=PeoplesAmountDetails.objects.create(management_profile=management,death=customer,name='Death',member=death_mem65,created_by=rejin.id,
                            amount=temp_family.death_tariff_amt,amount_balance=temp_family.death_tariff_amt,total_bal_amt=temp_family.death_tariff_amt)
                            if temp_family.pen_amt_type=="Amount":
                                d_tariff.penalty_amount=temp_family.tariff_peanalty
                                d_tariff.save()
                            elif temp_family.pen_amt_type=="Percentage":
                                amount_cal=temp_family.tariff_peanalty * (temp_family.death_tariff_amt/100)
                                d_tariff.penalty_amount=amount_cal
                                d_tariff.save() 
                        
                except Exception:
                    print('death edit status changes error')
                    pass
                
                try:
                    p_amts_obj=PeoplesAmountDetails.objects.filter(death=customer)                        
                    for p_amt in p_amts_obj:                           # if p_amt.penalty:
                            
                        p_amt.penalty=False
                        p_amt.amount=temp_family.death_tariff_amt
                        p_amt.amount_balance=temp_family.death_tariff_amt
                        p_amt.total_bal_amt=temp_family.death_tariff_amt
                        p_amt.save()
                        if temp_family.pen_amt_type=="Amount":
                            p_amt.penalty_amount=temp_family.tariff_peanalty
                            p_amt.save()
                        elif temp_family.pen_amt_type=="Percentage":
                            amount_cal=temp_family.tariff_peanalty * (temp_family.death_tariff_amt/100)
                            p_amt.penalty_amount=amount_cal
                            p_amt.save() 
                    if new_mem==excisting_mem:
                        reports= TempleMemberReport.objects.filter(death_tariff=temp_family)
                        if reports:
                            for mem_rep in reports:
                                mem_report= TempleMemberReport.objects.get(id=mem_rep.id)
                                if cal_rep_amt > temp_family.death_tariff_amt:
                                    new_credit_amt=float(cal_rep_amt) - float(temp_family.death_tariff_amt)
                                    mem_report.balance_amt = float(mem_report.balance_amt)-float(new_credit_amt)
                                    mem_report.credit_amt = float(mem_report.credit_amt)- float(new_credit_amt)
                                    mem_report.save()
                                    new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=mem_report.id,members=mem_report.members.id)
                                    for new_mem in  new_mem_report_obj:
                                            new=TempleMemberReport.objects.get(id=new_mem.id)
                                            new.balance_amt = float(new.balance_amt)-float(new_credit_amt)
                                            new.save()
                                elif cal_rep_amt < temp_family.death_tariff_amt:
                                    new_credit_amt= float(temp_family.death_tariff_amt)-float(cal_rep_amt) 
                                    mem_report.balance_amt = float(mem_report.balance_amt)+float(new_credit_amt)
                                    mem_report.credit_amt = float(mem_report.credit_amt)+float(new_credit_amt)
                                    mem_report.save()
                                    new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=mem_report.id,members=mem_report.members.id)
                                    for new_mem in  new_mem_report_obj:
                                            new=TempleMemberReport.objects.get(id=new_mem.id)
                                            new.balance_amt = float(new.balance_amt)+float(new_credit_amt)
                                            new.save()                            
                    elif new_mem != excisting_mem:
                        temple_rep=TempleMemberReport.objects.filter(members=excisting_mem,death_tariff=temp_family)
                        if temple_rep:
                            mem_report1= TempleMemberReport.objects.get(members=excisting_mem,death_tariff=temp_family)
                            new_mem_report_obj1= TempleMemberReport.objects.filter(id__gt=mem_report1.id,members=mem_report1.members.id)
                            for new_mem1 in  new_mem_report_obj1:
                                    new1=TempleMemberReport.objects.get(id=new_mem1.id)
                                    new1.balance_amt = float(new1.balance_amt)-float(cal_rep_amt)
                                    new1.save()
                            mem_report1.delete()
                        reports1= TempleMemberReport.objects.filter(death_tariff=temp_family)
                        reports1_reference= TempleMemberReport.objects.filter(death_tariff=temp_family).first()

                        if reports1:
                            for mem_rep1 in reports1:
                                mem_report22= TempleMemberReport.objects.get(id=mem_rep1.id)
                                if cal_rep_amt > temp_family.death_tariff_amt:
                                    new_credit_amt1=float(cal_rep_amt) - float(temp_family.death_tariff_amt)
                                    mem_report22.balance_amt = float(mem_report22.balance_amt)-float(new_credit_amt1)
                                    mem_report22.credit_amt = float(mem_report22.credit_amt)- float(new_credit_amt1)
                                    mem_report22.save()
                                    new_mem_report_obj22= TempleMemberReport.objects.filter(id__gt=mem_report22.id,members=mem_report22.members.id)
                                    for new_mem22 in  new_mem_report_obj22:
                                            new22=TempleMemberReport.objects.get(id=new_mem22.id)
                                            new22.balance_amt = float(new22.balance_amt)-float(new_credit_amt)
                                            new22.save()
                                elif cal_rep_amt < temp_family.death_tariff_amt:
                                    new_credit_amt= float(temp_family.death_tariff_amt)-float(cal_rep_amt) 
                                    mem_report22.balance_amt = float(mem_report22.balance_amt)+float(new_credit_amt)
                                    mem_report22.credit_amt = float(mem_report22.credit_amt)+float(new_credit_amt)
                                    mem_report22.save()
                                    new_mem_report_obj22= TempleMemberReport.objects.filter(id__gt=mem_report22.id,members=mem_report22.members.id)
                                    for new_mem22 in  new_mem_report_obj22:
                                            new22=TempleMemberReport.objects.get(id=new_mem22.id)
                                            new22.balance_amt = float(new22.balance_amt)+float(new_credit_amt)
                                            new22.save()  
                        mem_report_objectss= TempleMemberReport.objects.filter(members=new_mem)
                        if mem_report_objectss:
                            mem_report_objects_new= TempleMemberReport.objects.filter(members=new_mem).last()
                            bal1=float(mem_report_objects_new.balance_amt) + float(temp_family.death_tariff_amt)
                            tem_report=TempleMemberReport.objects.create(management_profile=management,members=new_mem,death_tariff=temp_family,reportdate=reports1_reference.reportdate,credit_amt=temp_family.death_tariff_amt,balance_amt=bal1,type_choice="Death Tariff",created_by=rejin.id)
                        else:
                            tem_report=TempleMemberReport.objects.create(management_profile=management,members=new_mem,death_tariff=temp_family,reportdate=reports1_reference.reportdate,credit_amt=temp_family.death_tariff_amt,balance_amt=temp_family.death_tariff_amt,type_choice="Death Tariff",created_by=rejin.id)

                                              
                        
                except Exception:
                    print('people amount geting error')                        
                try:
                    if documents_status==False:
                        temp_family.documents=None
                        temp_family.save()
                except Exception:
                    pass
                try:
                    if photo_status==False:
                        temp_family.photo=None
                        temp_family.save()
                except Exception:
                    pass
                        
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        
    
    # elif request.method == 'PATCH': 
    #     if get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.death_edit==True:     

    #         excisting_mem=customer.member
    #         print(f'old1----{excisting_mem}') 
    #         serializer876 = DeathDetailsSerializer(customer,data=request.data,partial=True)
    #         if serializer876.is_valid():
    #             temp_family=serializer876.save()
    #             temp_family.created_by=rejin.id
    #             temp_family.save()                
    #             try:
    #                 new_mem=temp_family.member
    #                 print(f'new1---{new_mem}')
    #                 if new_mem!=excisting_mem:
    #                     new_mem.death=True
    #                     new_mem.save()
    #                     excisting_mem.death=False
    #                     excisting_mem.save()
    #             except:
    #                 print('death edit patch status changes error')
    #                 pass
                
    #             try:
    #                 p_amts_obj=PeoplesAmountDetails.objects.filter(death=customer)
    #                 for p_amt in p_amts_obj:
    #                     p_amt.amount=temp_family.death_tariff_amt
    #                     p_amt.save()
    #             except:
    #                 print('people amount geting error')                
    #             return Response(serializer876.data,status=status.HTTP_201_CREATED)
    #         else:
    #             return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
    #     return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        
            
    elif request.method == 'DELETE':
        if get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.death_edit==True or get_role=="User" and perm.death_delete==True:
            collection_check=CollectionDetails.objects.filter(death_tariff_id=pk)  
            if collection_check:
                return Response({'message':"Cannot be deleted as it is involved in transactions"},status.HTTP_302_FOUND)
            # date_check=  (customer.penalty_apply_date.month != datetime.datetime.now().month and customer.penalty_apply_date.year != datetime.datetime.now().year)  or  (customer.penalty_apply_date.month != datetime.datetime.now().month and customer.penalty_apply_date.year == datetime.datetime.now().year)   or (customer.penalty_apply_date.month == datetime.datetime.now().month and customer.penalty_apply_date.year != datetime.datetime.now().year)     
            if customer.old_death: 
                return Response({'message':"Tariff is not applied to this death, so it cannot be deleted and it can be done from the member group details"},status.HTTP_302_FOUND)
            if customer.penalty_apply_date<=datetime.datetime.now().date():
                return Response({'message':"Cannot be deleted as the penalty date is reached"},status.HTTP_302_FOUND)
            if customer.old_death:                    
                mem=Member_Details.objects.filter(id=customer.member_id).first()
                if mem.death:
                    mem.death_date=None
                    mem.death=False
                    mem.save()
                    try:
                        cj=Member_Details.objects.filter(family=mem.family,death=False,marriage_remove=False).count()
                        kl=Member_Details.objects.filter(family=mem.family,death=True).count()
                        ma5=Member_Details.objects.filter(family=mem.family,marriage_remove=True).count()
                
                        take_fam=Fammily_Details.objects.get(id=mem.family_id)
                        take_fam.members_count=cj
                        take_fam.death_members_count=kl
                        take_fam.married_remove_count=ma5
                        take_fam.save()
                    except Exception:
                        pass   
            else:
                mem=Member_Details.objects.filter(id=customer.member_id).first()
                if mem.death:
                    mem.death_date=None
                    mem.death=False
                    mem.save() 
                    try:
                        cj=Member_Details.objects.filter(family=mem.family,death=False,marriage_remove=False).count()
                        kl=Member_Details.objects.filter(family=mem.family,death=True).count()
                        ma5=Member_Details.objects.filter(family=mem.family,marriage_remove=True).count()
                
                        take_fam=Fammily_Details.objects.get(id=mem.family_id)
                        take_fam.members_count=cj
                        take_fam.death_members_count=kl
                        take_fam.married_remove_count=ma5
                        take_fam.save()
                    except Exception:
                        pass  
            reports= TempleMemberReport.objects.filter(death_tariff=customer)
            if reports:
                for mem_rep in reports:
                    mem_report= TempleMemberReport.objects.get(id=mem_rep.id)
                    new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=mem_report.id,members=mem_report.members.id)
                    for new_mem in  new_mem_report_obj:
                            new=TempleMemberReport.objects.get(id=new_mem.id)
                            new.balance_amt = float(new.balance_amt)-float(customer.death_tariff_amt)
                            new.save()                    
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
