from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import datetime
from.serializers import MarriageDetailsSerializer
from .models import MarriageDetails
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails
from family.models import Member_Details,Fammily_Details
from family.serializers import Member_DetailsSerializer98
from amount.models import PeoplesAmountDetails
from permisions.models import Permisions
from collection.models import CollectionDetails
from reports.models import TempleMemberReport
def family_no():
    l=Fammily_Details.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("F" '%01d' % l)

def member_no():
    l=Member_Details.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("M" '%01d' % l)

@api_view(['GET','POST'])
def add_marriage_details(request):
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
        print('marriage post')
        print(request.data)
        if get_role=="Admin" or rejin.is_superuser == True or (get_role=="User" and perm.marriage_add==True):
            try:
                if request.data['groom_native_type']=='Member' and request.data['bride_native_type']=='Member':
                    if int(request.data['bride_family'])==int(request.data['groom_family']):
                        return Response({"message":"Same family members not get married check the details"},status=status.HTTP_406_NOT_ACCEPTABLE)  
            except Exception:
                pass
               
            serializer876 = MarriageDetailsSerializer(data=request.data)
            print(request.data) 
            if serializer876.is_valid():
                print(request.data) 
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.mangement=management
                temp_family.save()
                
                if temp_family.groom_member != None and temp_family.bride_member != None:
                    try:
                        my_dadfam=Fammily_Details.objects.get(id=temp_family.groom_family_id)
                        fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()

                        grom_mem=Member_Details.objects.get(id=temp_family.groom_member_id)
                        
                        bride_mem=Member_Details.objects.get(id=temp_family.bride_member_id)

                        cretae_fam=Fammily_Details.objects.create(ancestor_detail=f"{my_dadfam.family_no}/{fath.member_name}",ancestor=temp_family.groom_family_id,women_ancestor=temp_family.bride_family_id,
                                    management_profile=management,family_no=family_no(),address=temp_family.groom_address,head_member_type='EXCISTING',
                                    head_native_type=temp_family.groom_family.head_native_type,created_by=rejin.id)
                        
                        grom_mem.family=cretae_fam
                        grom_mem.head=True
                        grom_mem.member_relation_ship='FATHER'
                        grom_mem.save()
                        
                        bride_mem.family=cretae_fam
                        bride_mem.member_relation_ship='WIFE'
                        bride_mem.save()
                        
                        temp_family.new_family=cretae_fam
                        temp_family.save()
                        
                        fam_mem_count=Member_Details.objects.filter(family=cretae_fam,marriage_remove=False,death=False).count()
                        cretae_fam.members_count=fam_mem_count
                        cretae_fam.save()
                        
                        get_grm_familyid=temp_family.groom_family_id
                        grm_fam_mem_count=Member_Details.objects.filter(family=temp_family.groom_family,marriage_remove=False,death=False).count()
                        grmm_fam=Fammily_Details.objects.get(id=get_grm_familyid)
                        grmm_fam.members_count=grm_fam_mem_count
                        grmm_fam.save()
                        
                        bride_famid=temp_family.bride_family_id
                        bride_famly=Fammily_Details.objects.get(id=bride_famid)
                        bride_fam_mem_count=Member_Details.objects.filter(family=bride_famly,marriage_remove=False,death=False).count()
                        bride_famly.members_count=bride_fam_mem_count
                        bride_famly.save()
                        
                        # grm amount
                        x=PeoplesAmountDetails.objects.create(management_profile=management,member=grom_mem,created_by=rejin.id,
                                                            marriage=temp_family,amount_balance=temp_family.groom_marriage_amt,total_bal_amt=temp_family.groom_marriage_amt,amount=temp_family.groom_marriage_amt,name='Marriage')
                        mem_report= TempleMemberReport.objects.filter(members=x.member)
                        if mem_report:
                            mem_report_obj= TempleMemberReport.objects.filter(members=x.member).last()
                            bal1=float(mem_report_obj.balance_amt) + float(temp_family.groom_marriage_amt)
                            tem_report=TempleMemberReport.objects.create(management_profile=management,members=x.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                        else:
                            tem_report=TempleMemberReport.objects.create(management_profile=management,members=x.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)

                        bride_father=Member_Details.objects.filter(family=bride_famly,head=True).first()
                        # bride amount
                        y=PeoplesAmountDetails.objects.create(amount_balance=temp_family.bride_marriage_amt,total_bal_amt=temp_family.bride_marriage_amt,management_profile=management,member=bride_father,created_by=rejin.id,
                                                            marriage=temp_family,amount=temp_family.bride_marriage_amt,name='Marriage',daughters_amt=True)  
                        
                        mem_reportss= TempleMemberReport.objects.filter(members=y.member)
                        if mem_reportss:
                            mem_report_obj11= TempleMemberReport.objects.filter(members=y.member).last()
                            bal=float(mem_report_obj11.balance_amt) + float(temp_family.bride_marriage_amt)
                            TempleMemberReport.objects.create(management_profile=management,members=y.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=bal,type_choice="Marriage Amount",created_by=rejin.id)
                        else:
                            TempleMemberReport.objects.create(management_profile=management,members=y.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=temp_family.bride_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)

                    except Exception:
                        print('1st')
                        pass
                    
                elif temp_family.groom_member != None:
                    try:
                        my_dadfam=Fammily_Details.objects.get(id=temp_family.groom_family_id)
                        fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()

                        grom_mem=Member_Details.objects.get(id=temp_family.groom_member_id)
                        cretae_fam=Fammily_Details.objects.create(ancestor_detail=f"{my_dadfam.family_no}/{fath.member_name}",ancestor=temp_family.groom_family_id,
                                    management_profile=management,family_no=family_no(),address=temp_family.groom_address,head_member_type='EXCISTING',
                                    head_native_type=temp_family.groom_family.head_native_type,created_by=rejin.id)
                        
                        grom_mem.family=cretae_fam
                        grom_mem.head=True
                        grom_mem.member_relation_ship='FATHER'
                        grom_mem.save()
                        
                        Member_Details.objects.create(created_by=rejin.id,management_profile=management,family=cretae_fam,member_no=member_no(),member_name=temp_family.bride_name,
                                                    member_mobile_number=temp_family.bride_mobile_number,member_dob=temp_family.bride_dob,member_relation_ship='WIFE',member_gender='Female',adult=True)
                        
                        temp_family.new_family=cretae_fam
                        temp_family.save()
                        
                        fam_mem_count=Member_Details.objects.filter(family=cretae_fam,marriage_remove=False,death=False).count()
                        cretae_fam.members_count=fam_mem_count
                        cretae_fam.save()
                        
                        get_grm_familyid=temp_family.groom_family_id
                        grm_fam_mem_count=Member_Details.objects.filter(family=temp_family.groom_family,marriage_remove=False,death=False).count()
                        grmm_fam=Fammily_Details.objects.get(id=get_grm_familyid)
                        grmm_fam.members_count=grm_fam_mem_count
                        grmm_fam.save()
                        
                        # grm amount
                        z=PeoplesAmountDetails.objects.create(management_profile=management,member=grom_mem,amount_balance=temp_family.groom_marriage_amt,total_bal_amt=temp_family.groom_marriage_amt,created_by=rejin.id,
                                                            marriage=temp_family,amount=temp_family.groom_marriage_amt,name='Marriage')
                        
                        mem_report1= TempleMemberReport.objects.filter(members=z.member)
                        if mem_report1:
                            mem_report_obj1= TempleMemberReport.objects.filter(members=z.member).last()
                            bal2=float(mem_report_obj1.balance_amt) + float(temp_family.groom_marriage_amt)
                            TempleMemberReport.objects.create(management_profile=management,members=z.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal2,type_choice="Marriage Amount",created_by=rejin.id)
                        else:
                            TempleMemberReport.objects.create(management_profile=management,members=z.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)

                    except Exception:
                        pass
                    
                elif temp_family.bride_member != None:
                    try:
                        bride_mem=Member_Details.objects.get(id=temp_family.bride_member_id)

                        bride_mem.marriage_remove=True
                        bride_mem.save()
                        
                        bride_famid=temp_family.bride_family_id
                        bride_famly=Fammily_Details.objects.get(id=bride_famid)
                        bride_fam_mem_count=Member_Details.objects.filter(family=bride_famly,marriage_remove=False,death=False).count()
                        bride_famly.members_count=bride_fam_mem_count
                        bride_famly.save()
                        
                        bride_father=Member_Details.objects.filter(family=bride_famly,head=True).first()
                        # bride amount
                        y=PeoplesAmountDetails.objects.create(management_profile=management,member=bride_father,amount_balance=temp_family.bride_marriage_amt,total_bal_amt=temp_family.bride_marriage_amt,created_by=rejin.id,
                                                            marriage=temp_family,amount=temp_family.bride_marriage_amt,name='Marriage',daughters_amt=True)  
                        mem_reportss11= TempleMemberReport.objects.filter(members=y.member)
                        if mem_reportss11:
                            mem_report_obj1111= TempleMemberReport.objects.filter(members=y.member).last()
                            bal11=float(mem_report_obj1111.balance_amt) + float(temp_family.bride_marriage_amt)
                            TempleMemberReport.objects.create(management_profile=management,members=y.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=bal11,type_choice="Marriage Amount",created_by=rejin.id)
                        else:
                            TempleMemberReport.objects.create(management_profile=management,members=y.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=temp_family.bride_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)

                    except Exception:
                        pass
                else:
                    pass
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                print(serializer876.errors)
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
    elif request.method == 'GET':
        # if get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.marriage_view==True or get_role=="User" and perm.marriage_view==True:
        our_family = MarriageDetails.objects.filter(mangement=management)
        serializer = MarriageDetailsSerializer(our_family,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
        # return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
        
        
@api_view(['GET','PUT','PATCH',"DELETE"])
def edit_marriage_details(request,pk):
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
        customer = MarriageDetails.objects.get(pk=pk)  
        old_groom_family= customer.groom_family
        if old_groom_family!=None:
            ol_grm_familyid=customer.groom_family_id
            print(f'old grm family id----{ol_grm_familyid}')
        old_groom_member=customer.groom_member
        if old_groom_member!=None:
            old_groom_id=customer.groom_member_id
            print(f'old grm id----{old_groom_id}')
        old_bride_member=customer.bride_member
        if old_bride_member!=None:
            old_bride_id=customer.bride_member_id
            print(f'old bride id----{old_bride_id}')
            
        old_bride_family=customer.bride_family
        if old_bride_family!=None:
            ol_bride_famlyid=customer.bride_family_id
            print(f'old bride fam id----{ol_bride_famlyid}')
        
        #balance sheet
        g_m_amt=customer.groom_marriage_amt
        b_m_amt=customer.bride_marriage_amt
             
    except MarriageDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = MarriageDetailsSerializer(customer)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        print('gopi')
        print(request.data)
        if get_role=="Admin" or rejin.is_superuser == True or (get_role=="User" and perm.marriage_edit==True) :
            try:
                if request.data['groom_native_type']=='Member' and request.data['bride_native_type']=='Member':
                    if int(request.data['bride_family'])==int(request.data['groom_family']):
                        return Response({"message":"Same family members not get married check the details"},status=status.HTTP_406_NOT_ACCEPTABLE)  
            except Exception:
                pass
            
            prod=request.data
            try:
                if prod['invitation_status']=='false':
                    invitation_status=False
                else:
                    invitation_status=True
            except Exception:
                pass
            
            try:
                if prod['certificate_status']=='false':
                    certificate_status=False
                else:
                    certificate_status=True
            except Exception:
                pass
            
            try:
                if prod['photo_status']=='false':
                    i_status=False
                else:
                    i_status=True
            except Exception:
                pass   
        
            serializer876 = MarriageDetailsSerializer(customer,data=request.data)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                
                # laterr
                if temp_family.groom_native_type=='Other':
                    try:
                        grm_amt=PeoplesAmountDetails.objects.filter(management_profile=management,marriage=temp_family,member=temp_family.groom_member).first()
                        grm_amt.delete()
                    except Exception:
                        pass
                    temp_family.groom_family=None
                    temp_family.groom_member= None
                    temp_family.groom_family_no=None  
                    temp_family.groom_marriage_amt=0
                    temp_family.save()
                    
                if temp_family.bride_native_type=='Other':
                    try:
                        get_bride_father=Member_Details.objects.filter(management_profile=management,family=temp_family.bride_family,head=True).first()
                        bride_amt=PeoplesAmountDetails.objects.filter(daughters_amt=True,management_profile=management,marriage=temp_family,member=get_bride_father).first()
                        bride_amt.delete()
                    except Exception:
                        pass
                    temp_family.bride_family=None
                    temp_family.bride_member= None
                    temp_family.bride_family_no=None  
                    temp_family.bride_marriage_amt=0
                    temp_family.save()
                    
                # later above
                
                try:
                    if invitation_status==False:
                        temp_family.invitation=None
                        temp_family.save()
                except Exception:
                    pass
                try:
                    if i_status==False:
                        temp_family.marriage_photo=None
                        temp_family.save()
                except Exception:
                    pass
                
                try:
                    if certificate_status==False:
                        temp_family.marriage_certificate=None
                        temp_family.save()
                except Exception:
                    pass
                
                marrige_fam1=temp_family.new_family
                if marrige_fam1 !=None:
                    marrige_fam=temp_family.new_family
                    print(f'mar new fam---{marrige_fam}')
                    get_marige_fam_id=temp_family.new_family_id
                    
                
                new_groom_family=temp_family.groom_family
                neww_groom_member_obj=temp_family.groom_member
                if new_groom_family!=None and neww_groom_member_obj!=None:
                    new_grm_fam_id=temp_family.groom_family_id
                    new_grm_fam_address=temp_family.groom_family.address
                    new_grm_fam_native_type=temp_family.groom_family.head_native_type
                    new_grm_id=temp_family.groom_member_id

                new_bride_family=temp_family.bride_family 
                neww_bride_mem_obj=temp_family.bride_member
                if new_bride_family!=None and neww_bride_mem_obj!=None:
                    new_bride_fam_id=temp_family.bride_family_id
                    new_br_id=temp_family.bride_member_id

                if neww_groom_member_obj!=None and neww_bride_mem_obj!=None:
                    print('black fury')
                    if old_groom_member!=None and old_bride_member!=None:
                        print('black fury1')
                        if old_groom_family!=None and old_bride_family!=None:
                            print('black fury2')
                            if new_groom_family!=None and new_bride_family!=None:
                                print('black fury3')
                                if old_groom_family==new_groom_family and old_bride_family==new_bride_family:
                                    print('black fury4')
                                    if old_groom_member!=neww_groom_member_obj and old_bride_member!=neww_bride_mem_obj:
                                        print('black fury5')
                                        ol_grm=Member_Details.objects.get(id=old_groom_id)
                                        ol_grm.family=old_groom_family
                                        ol_grm.head=False
                                        ol_grm.member_relation_ship='SON'
                                        ol_grm.save()
                                        
                                        old_bride=Member_Details.objects.get(id=old_bride_id)
                                        old_bride.family=old_bride_family
                                        old_bride.member_relation_ship='DAUGHTER'
                                        old_bride.save()
                                        
                                        new_grm=Member_Details.objects.get(id=new_grm_id)
                                        new_grm.family=marrige_fam
                                        new_grm.head=True
                                        new_grm.member_relation_ship='FATHER'
                                        new_grm.save()
                                        
                                        new_brde=Member_Details.objects.get(id=new_br_id)
                                        new_brde.family=marrige_fam
                                        new_brde.member_relation_ship='WIFE'
                                        new_brde.save()
                                        
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.ancestor=new_grm_fam_id
                                        get_created_marige_fam.women_ancestor=new_bride_fam_id
                                        get_created_marige_fam.address=new_grm_fam_address
                                        get_created_marige_fam.head_native_type=new_grm_fam_native_type
                                        get_created_marige_fam.save()
                                        
                                        # count
                                        coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                        get_created_marige_fam.members_count=coun
                                        get_created_marige_fam.save()
                                        
                                        try:
                                            get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                            m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                            get_fam.members_count=m_count
                                            get_fam.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                            m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                            get_new_grm_fam1.members_count=m_coun1t3
                                            get_new_grm_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                            m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                            get_old_br_fam1.members_count=m_coun1t2
                                            get_old_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                            m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                            get_new_br_fam1.members_count=m_coun1t
                                            get_new_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_obj.member=temp_family.groom_member
                                        get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.save() 
                                                                          
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()                                        
                                        get_bride_mariage_amt_objoi=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        get_bride_mariage_amt_objoi.member=bride_father
                                        get_bride_mariage_amt_objoi.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_objoi.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_objoi.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_objoi.save()
                                        
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_ballksh=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_gm_ballksh:
                                                new_mem_report_obj43= TempleMemberReport.objects.filter(id__gt=ol_gm_ballksh.id,members=ol_gm_ballksh.members)
                                                for new_mem in  new_mem_report_obj43:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(g_m_amt)
                                                    new.save()     
                                                ol_gm_ballksh.delete()
                                            # create new
                                            new_grm_mem_reportk23= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                            if new_grm_mem_reportk23:
                                                mem_report_obj= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                                bal1=float(mem_report_obj.balance_amt) + float(temp_family.groom_marriage_amt)
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                            else:
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                     
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                        
                                        # bride 
                                        try:
                                            br_father_bal=TempleMemberReport.objects.filter(members=bride_father,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if br_father_bal:
                                                t_mem_amt=br_father_bal.credit_amt
                                                check_lessjret=TempleMemberReport.objects.filter(id__lt=br_father_bal.id,members=bride_father)
                                                if check_lessjret:
                                                    new_mem_report_objmh87 = check_lessjret.last()
                                                    br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                    br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                    br_father_bal.save()
                                                else:
                                                    br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                    br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)
                                                    br_father_bal.save()
                                                
                                                if t_mem_amt>temp_family.bride_marriage_amt:
                                                    cal_dif_bal4=float(t_mem_amt)-float(temp_family.bride_marriage_amt)
                                                    new_mem_report_obj89= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                    for new_mem in  new_mem_report_obj89:
                                                        new=TempleMemberReport.objects.get(id=new_mem.id)
                                                        new.balance_amt = float(new.balance_amt)-float(cal_dif_bal4)
                                                        new.save() 
                                                elif t_mem_amt<temp_family.bride_marriage_amt:
                                                    cal_dif_bal=float(temp_family.bride_marriage_amt)-float(t_mem_amt)
                                                    new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                    for new_mem in  new_mem_report_obj:
                                                        new=TempleMemberReport.objects.get(id=new_mem.id)
                                                        new.balance_amt = float(new.balance_amt)+float(cal_dif_bal)
                                                        new.save()  
                                        except Exception:
                                            print('TempleMemberReport bride fath geting error')
                                            pass
                                        
                                    elif old_groom_member!=neww_groom_member_obj and old_bride_member==neww_bride_mem_obj:
                                        print('black fury6')

                                        ol_grm=Member_Details.objects.get(id=old_groom_id)
                                        ol_grm.family=old_groom_family
                                        ol_grm.head=False
                                        ol_grm.member_relation_ship='SON'
                                        ol_grm.save()
                                        
                                        new_grm=Member_Details.objects.get(id=new_grm_id)
                                        new_grm.family=marrige_fam
                                        new_grm.head=True
                                        new_grm.member_relation_ship='FATHER'
                                        new_grm.save()
                                        
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.ancestor=new_grm_fam_id
                                        get_created_marige_fam.address=new_grm_fam_address
                                        get_created_marige_fam.head_native_type=new_grm_fam_native_type
                                        get_created_marige_fam.save()
                                        
                                        # count
                                        coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                        get_created_marige_fam.members_count=coun
                                        get_created_marige_fam.save()
                                        
                                        try:
                                            get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                            m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                            get_fam.members_count=m_count
                                            get_fam.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                            m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                            get_new_grm_fam1.members_count=m_coun1t3
                                            get_new_grm_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        get_grm_mariage_amt_obj634=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_obj634.member=temp_family.groom_member
                                        get_grm_mariage_amt_obj634.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj634.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj634.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj634.save()
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first() 
                                        
                                        get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        # get_bride_mariage_amt_obj.member=temp_family.bride_member
                                        get_bride_mariage_amt_obj.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.save()
                                        
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_bal23=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_gm_bal23:
                                                new_mem_report_obj90= TempleMemberReport.objects.filter(id__gt=ol_gm_bal23.id,members=ol_gm_bal23.members)
                                                for new_mem6444 in  new_mem_report_obj90:
                                                    new=TempleMemberReport.objects.get(id=new_mem6444.id)
                                                    new.balance_amt = float(new.balance_amt)-float(g_m_amt)
                                                    new.save() 
                                                ol_gm_bal23.delete()
                                            
                                            # create new
                                            new_grm_mem_report45= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                            if new_grm_mem_report45:
                                                mem_report_obj746= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                                bal1=float(mem_report_obj746.balance_amt) + float(temp_family.groom_marriage_amt)
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                            else:
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)     
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                        
                                        # bride 
                                        try:
                                            br_father_bal86=TempleMemberReport.objects.filter(members=bride_father,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if br_father_bal86:
                                                t_mem_amt=br_father_bal86.credit_amt
                                                
                                                check_lessjret=TempleMemberReport.objects.filter(id__lt=br_father_bal86.id,members=bride_father)
                                                if check_lessjret:
                                                    new_mem_report_objmh87 = check_lessjret.last()
                                                    br_father_bal86.credit_amt=temp_family.bride_marriage_amt 
                                                    br_father_bal86.balance_amt=float(temp_family.bride_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                    br_father_bal86.save()
                                                else:
                                                    br_father_bal86.credit_amt=temp_family.bride_marriage_amt 
                                                    br_father_bal86.balance_amt=float(temp_family.bride_marriage_amt)
                                                    br_father_bal86.save()
                                                
                                                
                                                if t_mem_amt>temp_family.bride_marriage_amt:
                                                    cal_dif_bal=float(t_mem_amt)-float(temp_family.bride_marriage_amt)
                                                    new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal86.id,members=br_father_bal86.members)
                                                    for new_mem in  new_mem_report_obj:
                                                        new=TempleMemberReport.objects.get(id=new_mem.id)
                                                        new.balance_amt = float(new.balance_amt)-float(cal_dif_bal)
                                                        new.save() 
                                                elif t_mem_amt<temp_family.bride_marriage_amt:
                                                    cal_dif_bal=float(temp_family.bride_marriage_amt)-float(t_mem_amt)
                                                    new_mem_report_obj09= TempleMemberReport.objects.filter(id__gt=br_father_bal86.id,members=br_father_bal86.members)
                                                    for new_mem in  new_mem_report_obj09:
                                                        new=TempleMemberReport.objects.get(id=new_mem.id)
                                                        new.balance_amt = float(new.balance_amt)+float(cal_dif_bal)
                                                        new.save()  
                                        except Exception:
                                            print('TempleMemberReport bride fath geting error')
                                            pass
                                               
                                    elif old_groom_member==neww_groom_member_obj and old_bride_member!=neww_bride_mem_obj:
                                        print('black fury7')
                                        
                                        old_bride=Member_Details.objects.get(id=old_bride_id)
                                        old_bride.family=old_bride_family
                                        old_bride.member_relation_ship='DAUGHTER'
                                        old_bride.save()
                                        
                                        new_brde=Member_Details.objects.get(id=new_br_id)
                                        new_brde.family=marrige_fam
                                        new_brde.member_relation_ship='WIFE'
                                        new_brde.save()
                                        
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.women_ancestor=new_bride_fam_id
                                        get_created_marige_fam.save()
                                        
                                        # count
                                        coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                        get_created_marige_fam.members_count=coun
                                        get_created_marige_fam.save()
                                        
                                        try:
                                            get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                            m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                            get_old_br_fam1.members_count=m_coun1t2
                                            get_old_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                            m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                            get_new_br_fam1.members_count=m_coun1t
                                            get_new_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        
                                        get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        # get_grm_mariage_amt_obj.member=temp_family.groom_member
                                        get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.save()
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
        
                                        get_bride_mariage_amt_obj4=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        get_bride_mariage_amt_obj4.member=bride_father
                                        get_bride_mariage_amt_obj4.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj4.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj4.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj4.save()
                                        
                                        
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_bal53=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_gm_bal53:
                                                t_grm_amt=ol_gm_bal53.credit_amt
                                                
                                                check_lessjret76=TempleMemberReport.objects.filter(id__lt=ol_gm_bal53.id,members=old_groom_member)
                                                if check_lessjret76:
                                                    new_mem_report_objmh87b = check_lessjret76.last()
                                                    ol_gm_bal53.credit_amt=temp_family.groom_marriage_amt 
                                                    ol_gm_bal53.balance_amt=float(temp_family.groom_marriage_amt)+float(new_mem_report_objmh87b.balance_amt)
                                                    ol_gm_bal53.save()
                                                else:
                                                    ol_gm_bal53.credit_amt=temp_family.groom_marriage_amt 
                                                    ol_gm_bal53.balance_amt=float(temp_family.groom_marriage_amt)
                                                    ol_gm_bal53.save()
                                                
                                                
                                                if t_grm_amt>temp_family.groom_marriage_amt:
                                                    cal_dif_bal_grm=float(t_grm_amt)-float(temp_family.groom_marriage_amt) 
                                                    new_mem_report_obj3= TempleMemberReport.objects.filter(id__gt=ol_gm_bal53.id,members=ol_gm_bal53.members)
                                                    for new_memn in new_mem_report_obj3:
                                                        new=TempleMemberReport.objects.get(id=new_memn.id)
                                                        new.balance_amt = float(new.balance_amt)-float(cal_dif_bal_grm)
                                                        new.save() 
                                                        
                                                elif t_grm_amt<temp_family.groom_marriage_amt:
                                                    cal_dif_bal_grm78=float(temp_family.groom_marriage_amt)-float(t_grm_amt)
                                                    new_mem_report_obj332= TempleMemberReport.objects.filter(id__gt=ol_gm_bal53.id,members=ol_gm_bal53.members)
                                                    for new_mem3 in new_mem_report_obj332:
                                                        new98=TempleMemberReport.objects.get(id=new_mem3.id)
                                                        new98.balance_amt = float(new98.balance_amt)+float(cal_dif_bal_grm78)
                                                        new98.save()    
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                        
                                        # bride 
                                        try:
                                            br_father_bal08=TempleMemberReport.objects.filter(members=bride_father,marriage=temp_family,type_choice="Marriage Amount").first()
                                            t_mem_amtfg=br_father_bal08.credit_amt
                                            
                                            check_lessjret=TempleMemberReport.objects.filter(id__lt=br_father_bal08.id,members=bride_father)
                                            if check_lessjret:
                                                new_mem_report_objmh87 = check_lessjret.last()
                                                br_father_bal08.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal08.balance_amt=float(temp_family.bride_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                br_father_bal08.save()
                                            else:
                                                br_father_bal08.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal08.balance_amt=float(temp_family.bride_marriage_amt)
                                                br_father_bal08.save()
                                            
                                            
                                            if t_mem_amtfg>temp_family.bride_marriage_amt:
                                                cal_dif_balg=float(t_mem_amtfg)-float(temp_family.bride_marriage_amt)
                                                new_mem_report_objd= TempleMemberReport.objects.filter(id__gt=br_father_bal08.id,members=br_father_bal08.members)
                                                for new_mem in  new_mem_report_objd:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(cal_dif_balg)
                                                    new.save() 
                                            elif t_mem_amtfg<temp_family.bride_marriage_amt:
                                                cal_dif_balg=float(temp_family.bride_marriage_amt)-float(t_mem_amtfg)
                                                new_mem_report_objd= TempleMemberReport.objects.filter(id__gt=br_father_bal08.id,members=br_father_bal08.members)
                                                for new_mem in  new_mem_report_objd:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)+float(cal_dif_balg)
                                                    new.save()  
                                        except Exception:
                                            print('TempleMemberReport bride fath geting error')
                                            pass
                                        
                                    
                                    else:
                                        print('no changes detected')
                                            
                                elif old_groom_family!=new_groom_family and old_bride_family!=new_bride_family:
                                    print('black fury8')
                                    
                                    my_dadfam=Fammily_Details.objects.get(id=temp_family.groom_family_id)
                                    fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()
                                    
                                    get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                    get_created_marige_fam.ancestor=new_grm_fam_id
                                    get_created_marige_fam.ancestor_detail=f"{my_dadfam.family_no}/{fath.member_name}"
                                    get_created_marige_fam.women_ancestor=new_bride_fam_id
                                    get_created_marige_fam.address=new_grm_fam_address
                                    get_created_marige_fam.head_native_type=new_grm_fam_native_type
                                    get_created_marige_fam.save()
                                    
                                    ol_grm=Member_Details.objects.get(id=old_groom_id)
                                    ol_grm.family=old_groom_family
                                    ol_grm.head=False
                                    ol_grm.member_relation_ship='SON'
                                    ol_grm.save()
                                    
                                    old_bride=Member_Details.objects.get(id=old_bride_id)
                                    old_bride.family=old_bride_family
                                    old_bride.member_relation_ship='DAUGHTER'
                                    old_bride.save()
                                    
                                    new_grm=Member_Details.objects.get(id=new_grm_id)
                                    new_grm.family=marrige_fam
                                    new_grm.head=True
                                    new_grm.member_relation_ship='FATHER'
                                    new_grm.save()
                                    
                                    new_brde=Member_Details.objects.get(id=new_br_id)
                                    new_brde.family=marrige_fam
                                    new_brde.member_relation_ship='WIFE'
                                    new_brde.save()
                                    
                                    # count
                                    coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                    get_created_marige_fam.members_count=coun
                                    get_created_marige_fam.save()
                                    
                                    try:
                                        get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                        m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                        get_fam.members_count=m_count
                                        get_fam.save()
                                    except Exception:
                                        pass
                                    
                                    try:
                                        get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                        m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                        get_new_grm_fam1.members_count=m_coun1t3
                                        get_new_grm_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    try:
                                        get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                        m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                        get_old_br_fam1.members_count=m_coun1t2
                                        get_old_br_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    try:
                                        get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                        m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                        get_new_br_fam1.members_count=m_coun1t
                                        get_new_br_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                    get_grm_mariage_amt_obj.member=temp_family.groom_member
                                    get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                    get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                    get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                    get_grm_mariage_amt_obj.save()
                                    
                                    bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                    
                                    get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                    if get_bride_mariage_amt_obj:
                                        old_b_fathers=get_bride_mariage_amt_obj.member
                                        get_bride_mariage_amt_obj.member=bride_father
                                        get_bride_mariage_amt_obj.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.save()
                                    
                                    # balasheet
                                    # groom
                                    try:
                                        ol_gm_bal=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                        if ol_gm_bal:
                                            new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_gm_bal.id,members=ol_gm_bal.members)
                                            for new_mem in  new_mem_report_obj:
                                                new=TempleMemberReport.objects.get(id=new_mem.id)
                                                new.balance_amt = float(new.balance_amt)-float(g_m_amt)
                                                new.save() 
                                                
                                            ol_gm_bal.delete()
                                        
                                        # create new
                                        new_grm_mem_reportk3= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                        if new_grm_mem_reportk3:
                                            mem_report_obj= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                            bal1=float(mem_report_obj.balance_amt) + float(temp_family.groom_marriage_amt)
                                            TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                        else:
                                            TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                    
                                    except Exception:
                                        print('TempleMemberReport groom geting error')
                                        pass
                                    
                                    # bride
                                    try:
                                        ol_br_fath_bal=TempleMemberReport.objects.filter(members=old_b_fathers,marriage=temp_family,type_choice="Marriage Amount").first()
                                        if ol_br_fath_bal:
                                            new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_br_fath_bal.id,members=ol_br_fath_bal.members)
                                            for new_mem in  new_mem_report_obj:
                                                new=TempleMemberReport.objects.get(id=new_mem.id)
                                                new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                                new.save() 
                                                
                                            ol_br_fath_bal.delete()
                                        
                                        # create new
                                        new_bride_father_reportk3ty= TempleMemberReport.objects.filter(members=bride_father)
                                        if new_bride_father_reportk3ty:
                                            mem_report_obj= TempleMemberReport.objects.filter(members=bride_father).last()
                                            bal1f=float(mem_report_obj.balance_amt) + float(temp_family.bride_marriage_amt)
                                            TempleMemberReport.objects.create(management_profile=management,members=bride_father,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=bal1f,type_choice="Marriage Amount",created_by=rejin.id)
                                        else:
                                            TempleMemberReport.objects.create(management_profile=management,members=bride_father,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=temp_family.bride_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)           
                                    except Exception:
                                        print('TempleMemberReport groom geting error')
                                        pass
                                    
                                    
                                elif old_groom_family==new_groom_family and old_bride_family!=new_bride_family:
                                    print('black fury9')
                                    
                                    if old_groom_member!=neww_groom_member_obj:
                                        print('black fury10')
                                        
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.women_ancestor=new_bride_fam_id
                                        get_created_marige_fam.save()
                                        
                                        ol_grm=Member_Details.objects.get(id=old_groom_id)
                                        ol_grm.family=old_groom_family
                                        ol_grm.head=False
                                        ol_grm.member_relation_ship='SON'
                                        ol_grm.save()
                                        
                                        new_grm=Member_Details.objects.get(id=new_grm_id)
                                        new_grm.family=marrige_fam
                                        new_grm.head=True
                                        new_grm.member_relation_ship='FATHER'
                                        new_grm.save()
                                        
                                        old_bride=Member_Details.objects.get(id=old_bride_id)
                                        old_bride.family=old_bride_family
                                        old_bride.member_relation_ship='DAUGHTER'
                                        old_bride.save()
                                    
                                        new_brde=Member_Details.objects.get(id=new_br_id)
                                        new_brde.family=marrige_fam
                                        new_brde.member_relation_ship='WIFE'
                                        new_brde.save()
                                        
                                        # count
                                        coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                        get_created_marige_fam.members_count=coun
                                        get_created_marige_fam.save()
                                        
                                        try:
                                            get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                            m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                            get_fam.members_count=m_count
                                            get_fam.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                            m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                            get_new_grm_fam1.members_count=m_coun1t3
                                            get_new_grm_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                            m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                            get_old_br_fam1.members_count=m_coun1t2
                                            get_old_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                            m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                            get_new_br_fam1.members_count=m_coun1t
                                            get_new_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_obj.member=temp_family.groom_member
                                        get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.save()
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                        
                                        get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        if get_bride_mariage_amt_obj:
                                            old_b_fathers=get_bride_mariage_amt_obj.member
                                            get_bride_mariage_amt_obj.member=bride_father
                                            get_bride_mariage_amt_obj.amount=temp_family.bride_marriage_amt
                                            get_bride_mariage_amt_obj.amount_balance=temp_family.bride_marriage_amt
                                            get_bride_mariage_amt_obj.total_bal_amt=temp_family.bride_marriage_amt
                                            get_bride_mariage_amt_obj.save()
                                        
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_bal23=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_gm_bal23:
                                                new_mem_report_obj90= TempleMemberReport.objects.filter(id__gt=ol_gm_bal23.id,members=ol_gm_bal23.members)
                                                for new_mem6444 in  new_mem_report_obj90:
                                                    newm=TempleMemberReport.objects.get(id=new_mem6444.id)
                                                    newm.balance_amt = float(newm.balance_amt)-float(g_m_amt)
                                                    newm.save() 
                                                ol_gm_bal23.delete()
                                            
                                            # create new
                                            new_grm_mem_rreport45= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                            if new_grm_mem_rreport45:
                                                mem_report_obj746= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                                bal31=float(mem_report_obj746.balance_amt) + float(temp_family.groom_marriage_amt)
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal31,type_choice="Marriage Amount",created_by=rejin.id)
                                            else:
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)     
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                        
                                        # bride
                                        try:
                                            ol_br_fath_bal=TempleMemberReport.objects.filter(members=old_b_fathers,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_br_fath_bal:
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_br_fath_bal.id,members=ol_br_fath_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                                    new.save() 
                                                    
                                                ol_br_fath_bal.delete()
                                            
                                            # create new
                                            new_bride_father_reportk3ty= TempleMemberReport.objects.filter(members=bride_father)
                                            if new_bride_father_reportk3ty:
                                                mem_report_obj= TempleMemberReport.objects.filter(members=bride_father).last()
                                                bal1f=float(mem_report_obj.balance_amt) + float(temp_family.bride_marriage_amt)
                                                TempleMemberReport.objects.create(management_profile=management,members=bride_father,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=bal1f,type_choice="Marriage Amount",created_by=rejin.id)
                                            else:
                                                TempleMemberReport.objects.create(management_profile=management,members=bride_father,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=temp_family.bride_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)          
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                        
                                    elif old_groom_member==neww_groom_member_obj:
                                        print('black fury11')
                                        
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.women_ancestor=new_bride_fam_id
                                        get_created_marige_fam.save()
                                        
                                        old_bride=Member_Details.objects.get(id=old_bride_id)
                                        old_bride.family=old_bride_family
                                        old_bride.member_relation_ship='DAUGHTER'
                                        old_bride.save()
                                    
                                        new_brde=Member_Details.objects.get(id=new_br_id)
                                        new_brde.family=marrige_fam
                                        new_brde.member_relation_ship='WIFE'
                                        new_brde.save()
                                        
                                        # count
                                        coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                        get_created_marige_fam.members_count=coun
                                        get_created_marige_fam.save()
                                        
                                        try:
                                            get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                            m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                            get_new_br_fam1.members_count=m_coun1t
                                            get_new_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                            m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                            get_old_br_fam1.members_count=m_coun1t2
                                            get_old_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_obj.member=temp_family.groom_member
                                        get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.save()
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                        
                                        get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        if get_bride_mariage_amt_obj:
                                            old_b_fathers=get_bride_mariage_amt_obj.member
                                            get_bride_mariage_amt_obj.member=bride_father
                                            get_bride_mariage_amt_obj.amount=temp_family.bride_marriage_amt
                                            get_bride_mariage_amt_obj.amount_balance=temp_family.bride_marriage_amt
                                            get_bride_mariage_amt_obj.total_bal_amt=temp_family.bride_marriage_amt
                                            get_bride_mariage_amt_obj.save()
                                            
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_bal53gf=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_gm_bal53gf:
                                                t_grm_amt=ol_gm_bal53gf.credit_amt
                                                
                                                check_lessjret=TempleMemberReport.objects.filter(id__lt=ol_gm_bal53gf.id,members=old_groom_member)
                                                if check_lessjret:
                                                    new_mem_report_objmh87 = check_lessjret.last()
                                                    ol_gm_bal53gf.credit_amt=temp_family.groom_marriage_amt 
                                                    ol_gm_bal53gf.balance_amt=float(temp_family.groom_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                    ol_gm_bal53gf.save()
                                                else:
                                                    ol_gm_bal53gf.credit_amt=temp_family.groom_marriage_amt 
                                                    ol_gm_bal53gf.balance_amt=float(temp_family.groom_marriage_amt)
                                                    ol_gm_bal53gf.save()

                                                if t_grm_amt>temp_family.groom_marriage_amt:
                                                    cal_dif_bal_grm=float(t_grm_amt)-float(temp_family.groom_marriage_amt) 
                                                    new_mem_report_obj3= TempleMemberReport.objects.filter(id__gt=ol_gm_bal53gf.id,members=ol_gm_bal53gf.members)
                                                    for new_mem in new_mem_report_obj3:
                                                        new=TempleMemberReport.objects.get(id=new_mem.id)
                                                        new.balance_amt = float(new.balance_amt)-float(cal_dif_bal_grm)
                                                        new.save() 
                                                        
                                                elif t_grm_amt<temp_family.groom_marriage_amt:
                                                    cal_dif_bal_grm78=float(temp_family.groom_marriage_amt)-float(t_grm_amt)
                                                    new_mem_report_obj332= TempleMemberReport.objects.filter(id__gt=ol_gm_bal53gf.id,members=ol_gm_bal53gf.members)
                                                    for new_mem3 in new_mem_report_obj332:
                                                        new98=TempleMemberReport.objects.get(id=new_mem3.id)
                                                        new98.balance_amt = float(new98.balance_amt)+float(cal_dif_bal_grm78)
                                                        new98.save()    
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                        
                                        
                                        # bride
                                        try:
                                            ol_br_fath_bal=TempleMemberReport.objects.filter(members=old_b_fathers,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_br_fath_bal:
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_br_fath_bal.id,members=ol_br_fath_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                                    new.save() 
                                                    
                                                ol_br_fath_bal.delete()
                                            
                                            # create new
                                            new_bride_father_reportk3ty= TempleMemberReport.objects.filter(members=bride_father)
                                            if new_bride_father_reportk3ty:
                                                mem_report_obj= TempleMemberReport.objects.filter(members=bride_father).last()
                                                bal1f=float(mem_report_obj.balance_amt) + float(temp_family.bride_marriage_amt)
                                                TempleMemberReport.objects.create(management_profile=management,members=bride_father,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=bal1f,type_choice="Marriage Amount",created_by=rejin.id)
                                            else:
                                                TempleMemberReport.objects.create(management_profile=management,members=bride_father,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=temp_family.bride_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)          
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                    
                                elif old_groom_family!=new_groom_family and old_bride_family==new_bride_family:
                                    print('black fury12')
                                    
                                    if old_bride_member!=neww_bride_mem_obj:
                                        print('black fury13')
                                        
                                        my_dadfam=Fammily_Details.objects.get(id=temp_family.groom_family_id)
                                        fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()
                                        
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.ancestor=new_grm_fam_id
                                        get_created_marige_fam.ancestor_detail=f"{my_dadfam.family_no}/{fath.member_name}"
                                        get_created_marige_fam.address=new_grm_fam_address
                                        get_created_marige_fam.head_native_type=new_grm_fam_native_type
                                        get_created_marige_fam.save()
                                        
                                        ol_grm=Member_Details.objects.get(id=old_groom_id)
                                        ol_grm.family=old_groom_family
                                        ol_grm.head=False
                                        ol_grm.member_relation_ship='SON'
                                        ol_grm.save()
                                        
                                        new_grm=Member_Details.objects.get(id=new_grm_id)
                                        new_grm.family=marrige_fam
                                        new_grm.head=True
                                        new_grm.member_relation_ship='FATHER'
                                        new_grm.save()
                                        
                                        old_bride=Member_Details.objects.get(id=old_bride_id)
                                        old_bride.family=old_bride_family
                                        old_bride.marriage_remove=False
                                        old_bride.member_relation_ship='DAUGHTER'
                                        old_bride.save()
                                        
                                        new_brde=Member_Details.objects.get(id=new_br_id)
                                        new_brde.family=get_created_marige_fam
                                        new_brde.member_relation_ship='WIFE'
                                        new_brde.save()
                                        
                                        # count
                                        coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                        get_created_marige_fam.members_count=coun
                                        get_created_marige_fam.save()
                                        
                                        try:
                                            get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                            m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                            get_fam.members_count=m_count
                                            get_fam.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                            m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                            get_new_grm_fam1.members_count=m_coun1t3
                                            get_new_grm_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                            m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                            get_old_br_fam1.members_count=m_coun1t2
                                            get_old_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_obj.member=temp_family.groom_member
                                        get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.save()
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                        
                                        get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        get_bride_mariage_amt_obj.member=bride_father
                                        get_bride_mariage_amt_obj.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.save()
                                        
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_ballj=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_gm_ballj.id,members=ol_gm_ballj.members)
                                            for new_mem in  new_mem_report_obj:
                                                new=TempleMemberReport.objects.get(id=new_mem.id)
                                                new.balance_amt = float(new.balance_amt)-float(g_m_amt)
                                                new.save() 
                                                
                                            ol_gm_ballj.delete()
                                            
                                            # create new
                                            ne_grm_mem_reportke= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                            if ne_grm_mem_reportke:
                                                mem_report_obj5= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                                bal1=float(mem_report_obj5.balance_amt) + float(temp_family.groom_marriage_amt)
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                            else:
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                     
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                        
                                        # bride 
                                        try:
                                            br_father_bal=TempleMemberReport.objects.filter(members=bride_father,marriage=temp_family,type_choice="Marriage Amount").first()
                                            t_mem_amt=br_father_bal.credit_amt
                                            
                                            check_lessjret=TempleMemberReport.objects.filter(id__lt=br_father_bal.id,members=bride_father)
                                            if check_lessjret:
                                                new_mem_report_objmh87 = check_lessjret.last()
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                br_father_bal.save()
                                            else:
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)
                                                br_father_bal.save()
                                            
                                            if t_mem_amt>temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(t_mem_amt)-float(temp_family.bride_marriage_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(cal_dif_bal)
                                                    new.save() 
                                            elif t_mem_amt<temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(temp_family.bride_marriage_amt)-float(t_mem_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)+float(cal_dif_bal)
                                                    new.save()  
                                        except Exception:
                                            print('TempleMemberReport bride fath geting error')
                                            pass
                                        
                                    
                                    else:
                                        print('black fury-14')
                                        my_dadfam=Fammily_Details.objects.get(id=temp_family.groom_family_id)
                                        fath=Member_Details.objects.filter(family=my_dadfam,head=True).first() 
                                           
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.ancestor=new_grm_fam_id
                                        get_created_marige_fam.ancestor_detail=f"{my_dadfam.family_no}/{fath.member_name}"
                                        get_created_marige_fam.address=new_grm_fam_address
                                        get_created_marige_fam.head_native_type=new_grm_fam_native_type
                                        get_created_marige_fam.save()
                                        
                                        ol_grm=Member_Details.objects.get(id=old_groom_id)
                                        ol_grm.family=old_groom_family
                                        ol_grm.head=False
                                        ol_grm.member_relation_ship='SON'
                                        ol_grm.save()
                                        
                                        new_grm=Member_Details.objects.get(id=new_grm_id)
                                        new_grm.family=marrige_fam
                                        new_grm.head=True
                                        new_grm.member_relation_ship='FATHER'
                                        new_grm.save()
                                        
                                        # count
                                        coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                        get_created_marige_fam.members_count=coun
                                        get_created_marige_fam.save()
                                        
                                        try:
                                            get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                            m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                            get_fam.members_count=m_count
                                            get_fam.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                            m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                            get_new_grm_fam1.members_count=m_coun1t3
                                            get_new_grm_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_obj.member=temp_family.groom_member
                                        get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.save()
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                        
                                        get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        get_bride_mariage_amt_obj.member=bride_father
                                        get_bride_mariage_amt_obj.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.save()
                                        
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_balljvc=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_gm_balljvc.id,members=ol_gm_balljvc.members)
                                            for new_mem in  new_mem_report_obj:
                                                new=TempleMemberReport.objects.get(id=new_mem.id)
                                                new.balance_amt = float(new.balance_amt)-float(g_m_amt)
                                                new.save() 
                                                
                                            ol_gm_balljvc.delete()
                                            
                                            # create new
                                            ne_grm_mem_reportke4= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                            if ne_grm_mem_reportke4:
                                                mem_report_obj5z= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                                bal1=float(mem_report_obj5z.balance_amt) + float(temp_family.groom_marriage_amt)
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                            else:
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                     
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                        
                                        # bride 
                                        try:
                                            br_father_bal=TempleMemberReport.objects.filter(members=bride_father,marriage=temp_family,type_choice="Marriage Amount").first()
                                            t_mem_amt=br_father_bal.credit_amt
                                            
                                            check_lessjret=TempleMemberReport.objects.filter(id__lt=br_father_bal.id,members=bride_father)
                                            if check_lessjret:
                                                new_mem_report_objmh87 = check_lessjret.last()
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                br_father_bal.save()
                                            else:
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)
                                                br_father_bal.save()
                                            
                                            if t_mem_amt>temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(t_mem_amt)-float(temp_family.bride_marriage_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(cal_dif_bal)
                                                    new.save() 
                                            elif t_mem_amt<temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(temp_family.bride_marriage_amt)-float(t_mem_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)+float(cal_dif_bal)
                                                    new.save()  
                                        except Exception:
                                            print('TempleMemberReport bride fath geting error')
                                            pass
                                        
                                else:
                                    print('no changes in family and member')
                                    
                    elif old_groom_member!=None and old_bride_member==None:
                        
                        print('kattaikal vilai')
                        if old_groom_family!=None and old_bride_family==None:  
                            print('glad home')
                            if new_groom_family!=None and new_bride_family!=None:
                                print('gopi---ooooo')
                                if old_groom_family==new_groom_family:
                                    print('mathar')
                                    if old_groom_member!=neww_groom_member_obj:
                                        print('goblin')
                                        ol_grm=Member_Details.objects.get(id=old_groom_id)
                                        ol_grm.family=old_groom_family
                                        ol_grm.head=False
                                        ol_grm.member_relation_ship='SON'
                                        ol_grm.save()
                                        
                                        new_grm=Member_Details.objects.get(id=new_grm_id)
                                        new_grm.family=marrige_fam
                                        new_grm.head=True
                                        new_grm.member_relation_ship='FATHER'
                                        new_grm.save()
                                        
                                        new_brde=Member_Details.objects.get(id=new_br_id)
                                        new_brde.family=marrige_fam
                                        new_brde.member_relation_ship='WIFE'
                                        new_brde.save()
                                        
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.ancestor=new_grm_fam_id
                                        get_created_marige_fam.women_ancestor=new_bride_fam_id
                                        get_created_marige_fam.address=new_grm_fam_address
                                        get_created_marige_fam.head_native_type=new_grm_fam_native_type
                                        get_created_marige_fam.save()
                                        
                                        # count
                                        coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                        get_created_marige_fam.members_count=coun
                                        get_created_marige_fam.save()
                                        
                                        try:
                                            get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                            m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                            get_fam.members_count=m_count
                                            get_fam.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                            m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                            get_new_grm_fam1.members_count=m_coun1t3
                                            get_new_grm_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                            m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                            get_new_br_fam1.members_count=m_coun1t
                                            get_new_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_obj.member=temp_family.groom_member
                                        get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.save()
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                        # # bride amount
                                        urfm=PeoplesAmountDetails.objects.create(amount_balance=temp_family.bride_marriage_amt,total_bal_amt=temp_family.bride_marriage_amt,management_profile=management,member=bride_father,
                                                        marriage=temp_family,amount=temp_family.bride_marriage_amt,name='Marriage',daughters_amt=True,created_by=rejin.id)
                                        
                                        mem_reportsste= TempleMemberReport.objects.filter(members=urfm.member)
                                        if mem_reportsste:
                                            mem_report_obj11= TempleMemberReport.objects.filter(members=urfm.member).last()
                                            bal=float(mem_report_obj11.balance_amt) + float(temp_family.bride_marriage_amt)
                                            TempleMemberReport.objects.create(management_profile=management,members=urfm.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=bal,type_choice="Marriage Amount",created_by=rejin.id)
                                        else:
                                            TempleMemberReport.objects.create(management_profile=management,members=urfm.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=temp_family.bride_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id) 
                                        
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_balvb=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_gm_balvb:
                                                new_mem_report_objh= TempleMemberReport.objects.filter(id__gt=ol_gm_balvb.id,members=ol_gm_balvb.members)
                                                for new_mem in  new_mem_report_objh:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(g_m_amt)
                                                    new.save() 
                                                    
                                                ol_gm_balvb.delete()
                                            
                                            # create new
                                            new_grm_mem_reportkcd= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                            if new_grm_mem_reportkcd:
                                                mem_report_objds= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                                bal1=float(mem_report_objds.balance_amt) + float(temp_family.groom_marriage_amt)
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                            else:
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                     
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                        
                                    elif old_groom_member==neww_groom_member_obj:
                                        print('jino')
                                        
                                        old_bride1=Member_Details.objects.filter(family=marrige_fam,member_relation_ship='WIFE').first()
                                        if old_bride1:
                                            old_bride1.delete()

                                        new_brde=Member_Details.objects.get(id=new_br_id)
                                        new_brde.family=marrige_fam
                                        new_brde.member_relation_ship='WIFE'
                                        new_brde.save()
                
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.women_ancestor=new_bride_fam_id
                                        get_created_marige_fam.save()
                                        
                                        # count
                                        coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                        get_created_marige_fam.members_count=coun
                                        get_created_marige_fam.save()
                                        
                                        try:
                                            get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                            m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                            get_new_br_fam1.members_count=m_coun1t
                                            get_new_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_obj.member=temp_family.groom_member
                                        get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.save()
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                        # # bride amount
                                        ioeiu=PeoplesAmountDetails.objects.create(amount_balance=temp_family.bride_marriage_amt,total_bal_amt=temp_family.bride_marriage_amt,management_profile=management,member=bride_father,
                                                        marriage=temp_family,amount=temp_family.bride_marriage_amt,name='Marriage',daughters_amt=True,created_by=rejin.id)
                                        
                                        mem_reportsste= TempleMemberReport.objects.filter(members=ioeiu.member)
                                        if mem_reportsste:
                                            mem_report_obj11= TempleMemberReport.objects.filter(members=ioeiu.member).last()
                                            bal=float(mem_report_obj11.balance_amt) + float(temp_family.bride_marriage_amt)
                                            TempleMemberReport.objects.create(management_profile=management,members=ioeiu.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=bal,type_choice="Marriage Amount",created_by=rejin.id)
                                        else:
                                            TempleMemberReport.objects.create(management_profile=management,members=ioeiu.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=temp_family.bride_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id) 
                                        
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_bal53=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_gm_bal53:
                                                t_grm_amt=ol_gm_bal53.credit_amt
                                                
                                                check_lessjret=TempleMemberReport.objects.filter(id__lt=ol_gm_bal53.id,members=old_groom_member)
                                                if check_lessjret:
                                                    new_mem_report_objmh87 = check_lessjret.last()
                                                    ol_gm_bal53.credit_amt=temp_family.groom_marriage_amt 
                                                    ol_gm_bal53.balance_amt=float(temp_family.groom_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                    ol_gm_bal53.save()
                                                else:
                                                    ol_gm_bal53.credit_amt=temp_family.groom_marriage_amt 
                                                    ol_gm_bal53.balance_amt=float(temp_family.groom_marriage_amt)
                                                    ol_gm_bal53.save()
                                                
                                                if t_grm_amt>temp_family.groom_marriage_amt:
                                                    cal_dif_bal_grm=float(t_grm_amt)-float(temp_family.groom_marriage_amt) 
                                                    new_mem_report_obj3= TempleMemberReport.objects.filter(id__gt=ol_gm_bal53.id,members=ol_gm_bal53.members)
                                                    for new_mem in new_mem_report_obj3:
                                                        new=TempleMemberReport.objects.get(id=new_mem.id)
                                                        new.balance_amt = float(new.balance_amt)-float(cal_dif_bal_grm)
                                                        new.save() 
                                                        
                                                elif t_grm_amt<temp_family.groom_marriage_amt:
                                                    cal_dif_bal_grm78=float(temp_family.groom_marriage_amt)-float(t_grm_amt)
                                                    new_mem_report_obj332= TempleMemberReport.objects.filter(id__gt=ol_gm_bal53.id,members=ol_gm_bal53.members)
                                                    for new_mem3 in new_mem_report_obj332:
                                                        new98=TempleMemberReport.objects.get(id=new_mem3.id)
                                                        new98.balance_amt = float(new98.balance_amt)+float(cal_dif_bal_grm78)
                                                        new98.save()    
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                        
                                        
                                    else:
                                        print('gold items')
                                        
                                elif old_groom_family!=new_groom_family:
                                    print('flipkart')
                                    my_dadfam=Fammily_Details.objects.get(id=temp_family.groom_family_id)
                                    fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()
                                    
                                    get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                    get_created_marige_fam.ancestor=new_grm_fam_id
                                    get_created_marige_fam.ancestor_detail=f"{my_dadfam.family_no}/{fath.member_name}"
                                    get_created_marige_fam.women_ancestor=new_bride_fam_id
                                    get_created_marige_fam.address=new_grm_fam_address
                                    get_created_marige_fam.head_native_type=new_grm_fam_native_type
                                    get_created_marige_fam.save()
                                    
                                    ol_grm=Member_Details.objects.get(id=old_groom_id)
                                    ol_grm.family=old_groom_family
                                    ol_grm.head=False
                                    ol_grm.member_relation_ship='SON'
                                    ol_grm.save()
                                    
                                    new_grm=Member_Details.objects.get(id=new_grm_id)
                                    new_grm.family=marrige_fam
                                    new_grm.head=True
                                    new_grm.member_relation_ship='FATHER'
                                    new_grm.save()
                                    
                                    new_brde=Member_Details.objects.get(id=new_br_id)
                                    new_brde.family=marrige_fam
                                    new_brde.member_relation_ship='WIFE'
                                    new_brde.save()
                                    
                                    # count
                                    coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                    get_created_marige_fam.members_count=coun
                                    get_created_marige_fam.save()
                                    
                                    try:
                                        get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                        m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                        get_fam.members_count=m_count
                                        get_fam.save()
                                    except Exception:
                                        pass
                                    
                                    try:
                                        get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                        m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                        get_new_grm_fam1.members_count=m_coun1t3
                                        get_new_grm_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    try:
                                        get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                        m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                        get_new_br_fam1.members_count=m_coun1t
                                        get_new_br_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                    get_grm_mariage_amt_obj.member=temp_family.groom_member
                                    get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                    get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                    get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                    get_grm_mariage_amt_obj.save()
                                    
                                    bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                    # # bride amount
                                    yte=PeoplesAmountDetails.objects.create(amount_balance=temp_family.bride_marriage_amt,total_bal_amt=temp_family.bride_marriage_amt,management_profile=management,member=bride_father,
                                                        marriage=temp_family,amount=temp_family.bride_marriage_amt,name='Marriage',daughters_amt=True,created_by=rejin.id)
                                    
                                    mem_reportsste= TempleMemberReport.objects.filter(members=yte.member)
                                    if mem_reportsste:
                                        mem_report_obj11= TempleMemberReport.objects.filter(members=yte.member).last()
                                        bal=float(mem_report_obj11.balance_amt) + float(temp_family.bride_marriage_amt)
                                        TempleMemberReport.objects.create(management_profile=management,members=yte.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=bal,type_choice="Marriage Amount",created_by=rejin.id)
                                    else:
                                        TempleMemberReport.objects.create(management_profile=management,members=yte.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=temp_family.bride_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                        
                                        
                                    # balasheet
                                    # groom
                                    try:
                                        ol_gm_bal=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                        new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_gm_bal.id,members=ol_gm_bal.members)
                                        for new_mem in  new_mem_report_obj:
                                            new=TempleMemberReport.objects.get(id=new_mem.id)
                                            new.balance_amt = float(new.balance_amt)-float(g_m_amt)
                                            new.save() 
                                            
                                        ol_gm_bal.delete()
                                        
                                        # create new
                                        new_grm_mem_reportk3= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                        if new_grm_mem_reportk3:
                                            mem_report_obj= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                            bal1=float(mem_report_obj.balance_amt) + float(temp_family.groom_marriage_amt)
                                            TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                        else:
                                            TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                    
                                    except Exception:
                                        print('TempleMemberReport groom geting error')
                                        pass
                                    
                    elif old_groom_member==None and old_bride_member!=None:
                        
                        print('old grom none and newbride&oldbride != ')
                        if old_groom_family==None and old_bride_family!=None:
                            print('lady')
                            if new_groom_family!=None and new_bride_family!=None:
                                print('china')
                                if old_bride_family==new_bride_family:
                                    print('india')
                                    if old_bride_member!=neww_bride_mem_obj:
                                        print('body builder')
                                        my_dadfam=Fammily_Details.objects.get(id=temp_family.groom_family_id)
                                        fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()
                                        
                                        cretae_fam=Fammily_Details.objects.create(ancestor_detail=f"{my_dadfam.family_no}/{fath.member_name}",ancestor=temp_family.groom_family_id,women_ancestor=temp_family.bride_family_id,
                                        management_profile=management,family_no=family_no(),address=temp_family.groom_address,head_member_type='EXCISTING',
                                        head_native_type=temp_family.groom_family.head_native_type,created_by=rejin.id)                                        
                                        new_grm=Member_Details.objects.get(id=new_grm_id)
                                        new_grm.family=cretae_fam
                                        new_grm.head=True
                                        new_grm.member_relation_ship='FATHER'
                                        new_grm.save()
                                        
                                        old_bride=Member_Details.objects.get(id=old_bride_id)
                                        old_bride.marriage_remove=False
                                        old_bride.member_relation_ship='DAUGHTER'
                                        old_bride.save()
                                        
                                        new_brde=Member_Details.objects.get(id=new_br_id)
                                        new_brde.family=cretae_fam
                                        new_brde.member_relation_ship='WIFE'
                                        new_brde.save()
                                        
                                        # count
                                        fam_mem_count=Member_Details.objects.filter(family=cretae_fam,marriage_remove=False,death=False).count()
                                        cretae_fam.members_count=fam_mem_count
                                        cretae_fam.save()
                                        
                                        try:
                                            get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                            m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                            get_new_grm_fam1.members_count=m_coun1t3
                                            get_new_grm_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                            m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                            get_new_br_fam1.members_count=m_coun1t
                                            get_new_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                            m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                            get_old_br_fam1.members_count=m_coun1t2
                                            get_old_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        xiu=PeoplesAmountDetails.objects.create(amount_balance=temp_family.groom_marriage_amt,total_bal_amt=temp_family.groom_marriage_amt,management_profile=management,member=temp_family.groom_member,
                                                        marriage=temp_family,amount=temp_family.groom_marriage_amt,name='Marriage',daughters_amt=False,created_by=rejin.id)
                                        
                                        mem_reporthdg= TempleMemberReport.objects.filter(members=xiu.member)
                                        if mem_reporthdg:
                                            mem_report_obj87= TempleMemberReport.objects.filter(members=xiu.member).last()
                                            bal1=float(mem_report_obj87.balance_amt) + float(temp_family.groom_marriage_amt)
                                            TempleMemberReport.objects.create(management_profile=management,members=xiu.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                        else:
                                            TempleMemberReport.objects.create(management_profile=management,members=xiu.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                        
                                        get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        get_bride_mariage_amt_obj.member=bride_father
                                        get_bride_mariage_amt_obj.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.save()
                                        
                                        # new
                                        temp_family.new_family=cretae_fam
                                        temp_family.save()
                                        
                                        
                                        # bride 
                                        try:
                                            br_father_bal=TempleMemberReport.objects.filter(members=bride_father,marriage=temp_family,type_choice="Marriage Amount").first()
                                            t_mem_amt=br_father_bal.credit_amt
                                            check_lessjret=TempleMemberReport.objects.filter(id__lt=br_father_bal.id,members=bride_father)
                                            if check_lessjret:
                                                new_mem_report_objmh87 = check_lessjret.last()
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                br_father_bal.save()
                                            else:
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)
                                                br_father_bal.save()
                                                    
                                            if t_mem_amt>temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(t_mem_amt)-float(temp_family.bride_marriage_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(cal_dif_bal)
                                                    new.save() 
                                            elif t_mem_amt<temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(temp_family.bride_marriage_amt)-float(t_mem_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)+float(cal_dif_bal)
                                                    new.save()  
                                        except Exception:
                                            print('TempleMemberReport bride fath geting error')
                                            pass
                                        
                                                        
                                    elif old_bride_member==neww_bride_mem_obj:
                                        print('huwai')
                                        my_dadfam=Fammily_Details.objects.get(id=temp_family.groom_family_id)
                                        fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()
                                        
                                        cretae_fam=Fammily_Details.objects.create(ancestor_detail=f"{my_dadfam.family_no}/{fath.member_name}",ancestor=temp_family.groom_family_id,women_ancestor=temp_family.bride_family_id,
                                        management_profile=management,family_no=family_no(),address=temp_family.groom_address,head_member_type='EXCISTING',created_by=rejin.id,
                                        head_native_type=temp_family.groom_family.head_native_type)
                                        
                                        new_grm=Member_Details.objects.get(id=new_grm_id)
                                        new_grm.family=cretae_fam
                                        new_grm.head=True
                                        new_grm.member_relation_ship='FATHER'
                                        new_grm.save()                                        
                                        new_brde=Member_Details.objects.get(id=new_br_id)
                                        new_brde.family=cretae_fam
                                        new_brde.marriage_remove=False
                                        new_brde.member_relation_ship='WIFE'
                                        new_brde.save()                                        
                                        # count
                                        fam_mem_count=Member_Details.objects.filter(family=cretae_fam,marriage_remove=False,death=False).count()
                                        cretae_fam.members_count=fam_mem_count
                                        cretae_fam.save()                                        
                                        try:
                                            get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                            m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                            get_new_grm_fam1.members_count=m_coun1t3
                                            get_new_grm_fam1.save()
                                        except Exception:
                                            pass                                        
                                        try:
                                            get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                            m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                            get_new_br_fam1.members_count=m_coun1t
                                            get_new_br_fam1.save()
                                        except Exception:
                                            pass  
                                                                              
                                        xiu=PeoplesAmountDetails.objects.create(amount_balance=temp_family.groom_marriage_amt,total_bal_amt=temp_family.groom_marriage_amt,management_profile=management,member=temp_family.groom_member,
                                                        marriage=temp_family,amount=temp_family.groom_marriage_amt,name='Marriage',daughters_amt=False,created_by=rejin.id)
                                        
                                        mem_reporthdg= TempleMemberReport.objects.filter(members=xiu.member)
                                        if mem_reporthdg:
                                            mem_report_obj87= TempleMemberReport.objects.filter(members=xiu.member).last()
                                            bal1=float(mem_report_obj87.balance_amt) + float(temp_family.groom_marriage_amt)
                                            TempleMemberReport.objects.create(management_profile=management,members=xiu.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                        else:
                                            TempleMemberReport.objects.create(management_profile=management,members=xiu.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                        
                                        get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        get_bride_mariage_amt_obj.member=bride_father
                                        get_bride_mariage_amt_obj.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.save()
                                        
                                        # new
                                        temp_family.new_family=cretae_fam
                                        temp_family.save()
                                        
                                        # bride 
                                        try:
                                            br_father_bal=TempleMemberReport.objects.filter(members=bride_father,marriage=temp_family,type_choice="Marriage Amount").first()
                                            t_mem_amt=br_father_bal.credit_amt
                                            
                                            check_lessjret=TempleMemberReport.objects.filter(id__lt=br_father_bal.id,members=bride_father)
                                            if check_lessjret:
                                                new_mem_report_objmh87 = check_lessjret.last()
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                br_father_bal.save()
                                            else:
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)
                                                br_father_bal.save()
                                            
                                            if t_mem_amt>temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(t_mem_amt)-float(temp_family.bride_marriage_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(cal_dif_bal)
                                                    new.save() 
                                            elif t_mem_amt<temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(temp_family.bride_marriage_amt)-float(t_mem_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)+float(cal_dif_bal)
                                                    new.save()  
                                        except Exception:
                                            print('TempleMemberReport bride fath geting error')
                                            pass
                                        
                                elif old_bride_family!=new_bride_family:
                                    print('lenskart')
                                    
                                    my_dadfam=Fammily_Details.objects.get(id=temp_family.groom_family_id)
                                    fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()
                                    
                                    cretae_fam=Fammily_Details.objects.create(ancestor_detail=f"{my_dadfam.family_no}/{fath.member_name}",ancestor=temp_family.groom_family_id,women_ancestor=temp_family.bride_family_id,
                                    management_profile=management,family_no=family_no(),address=temp_family.groom_address,head_member_type='EXCISTING',created_by=rejin.id,
                                    head_native_type=temp_family.groom_family.head_native_type)
                                    
                                    new_grm=Member_Details.objects.get(id=new_grm_id)
                                    new_grm.family=cretae_fam
                                    new_grm.head=True
                                    new_grm.member_relation_ship='FATHER'
                                    new_grm.save()
                                    
                                    old_bride=Member_Details.objects.get(id=old_bride_id)
                                    old_bride.marriage_remove=False
                                    old_bride.member_relation_ship='DAUGHTER'
                                    old_bride.save()
                                    
                                    new_brde=Member_Details.objects.get(id=new_br_id)
                                    new_brde.family=cretae_fam
                                    new_brde.member_relation_ship='WIFE'
                                    new_brde.save()
                                    
                                    # count
                                    fam_mem_count=Member_Details.objects.filter(family=cretae_fam,marriage_remove=False,death=False).count()
                                    cretae_fam.members_count=fam_mem_count
                                    cretae_fam.save()
                                    
                                    try:
                                        get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                        m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                        get_new_grm_fam1.members_count=m_coun1t3
                                        get_new_grm_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    try:
                                        get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                        m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                        get_new_br_fam1.members_count=m_coun1t
                                        get_new_br_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    try:
                                        get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                        m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                        get_old_br_fam1.members_count=m_coun1t2
                                        get_old_br_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    xiu=PeoplesAmountDetails.objects.create(amount_balance=temp_family.groom_marriage_amt,total_bal_amt=temp_family.groom_marriage_amt,management_profile=management,member=temp_family.groom_member,
                                                        marriage=temp_family,amount=temp_family.groom_marriage_amt,name='Marriage',daughters_amt=False,created_by=rejin.id)
                                    
                                    mem_reporthdg= TempleMemberReport.objects.filter(members=xiu.member)
                                    if mem_reporthdg:
                                        mem_report_obj87= TempleMemberReport.objects.filter(members=xiu.member).last()
                                        bal1=float(mem_report_obj87.balance_amt) + float(temp_family.groom_marriage_amt)
                                        TempleMemberReport.objects.create(management_profile=management,members=xiu.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                    else:
                                        TempleMemberReport.objects.create(management_profile=management,members=xiu.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                    
                                    bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                    
                                    get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                    if get_bride_mariage_amt_obj:
                                        old_b_fathers=get_bride_mariage_amt_obj.member
                                        get_bride_mariage_amt_obj.member=bride_father
                                        get_bride_mariage_amt_obj.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.save()
                                    
                                    # new
                                    temp_family.new_family=cretae_fam
                                    temp_family.save()
                                    
                                    # bride
                                    try:
                                        ol_br_fath_bal=TempleMemberReport.objects.filter(members=old_b_fathers,marriage=temp_family,type_choice="Marriage Amount").first()
                                        if ol_br_fath_bal:
                                            new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_br_fath_bal.id,members=ol_br_fath_bal.members)
                                            for new_mem in  new_mem_report_obj:
                                                new=TempleMemberReport.objects.get(id=new_mem.id)
                                                new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                                new.save() 
                                                
                                            ol_br_fath_bal.delete()
                                        
                                        # create new
                                        new_bride_father_reportk3ty= TempleMemberReport.objects.filter(members=bride_father)
                                        if new_bride_father_reportk3ty:
                                            mem_report_obj= TempleMemberReport.objects.filter(members=bride_father).last()
                                            bal1f=float(mem_report_obj.balance_amt) + float(temp_family.bride_marriage_amt)
                                            TempleMemberReport.objects.create(management_profile=management,members=bride_father,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=bal1f,type_choice="Marriage Amount",created_by=rejin.id)
                                        else:
                                            TempleMemberReport.objects.create(management_profile=management,members=bride_father,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=temp_family.bride_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                    
                                    except Exception:
                                        print('TempleMemberReport groom geting error')
                                        pass
                                    
                                
                elif neww_groom_member_obj!=None and neww_bride_mem_obj==None:
                    print('new grm id and new bride none')
                    if old_groom_member!=None and old_bride_member==None:
                        print('harry porter-1')
                        if old_groom_family!=None and old_bride_family==None:
                            print('harry porter-2')
                            if new_groom_family!=None and new_bride_family==None:
                                print('harry porter-3')
                                if old_groom_family==new_groom_family:
                                    print('harry porter-4')
                                    if old_groom_member!=neww_groom_member_obj:
                                        print('harry porter')
                                        ol_grm=Member_Details.objects.get(id=old_groom_id)
                                        ol_grm.family=old_groom_family
                                        ol_grm.head=False
                                        ol_grm.member_relation_ship='SON'
                                        ol_grm.save()

                                        new_grm=Member_Details.objects.get(id=new_grm_id)
                                        new_grm.family=marrige_fam
                                        new_grm.head=True
                                        new_grm.member_relation_ship='FATHER'
                                        new_grm.save()
                                        
                                        # bride details update
                                        get_bride=Member_Details.objects.filter(family=marrige_fam,member_relation_ship='WIFE').first()
                                        get_bride.member_name=temp_family.bride_name
                                        get_bride.member_mobile_number=temp_family.bride_mobile_number
                                        get_bride.member_dob=temp_family.bride_dob
                                        get_bride.save()                                        
                                        # COUNT
                                        fam_mem_count=Member_Details.objects.filter(family=marrige_fam,marriage_remove=False,death=False).count()
                                        try:
                                            get_famly=Fammily_Details.objects.get(id=get_marige_fam_id)
                                            get_famly.members_count=fam_mem_count 
                                            get_famly.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                            m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                            get_fam.members_count=m_count
                                            get_fam.save()
                                        except Exception:
                                            pass
                                        try:
                                            get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                            m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                            get_new_grm_fam1.members_count=m_coun1t3
                                            get_new_grm_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_obj.member=temp_family.groom_member
                                        get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.save()
                                        
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_bal23=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_gm_bal23:
                                                new_mem_report_obj90= TempleMemberReport.objects.filter(id__gt=ol_gm_bal23.id,members=ol_gm_bal23.members)
                                                for new_mem6444 in  new_mem_report_obj90:
                                                    new=TempleMemberReport.objects.get(id=new_mem6444.id)
                                                    new.balance_amt = float(new.balance_amt)-float(g_m_amt)
                                                    new.save() 
                                                ol_gm_bal23.delete()
                                            
                                            # create new
                                            new_grm_mem_report45= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                            if new_grm_mem_report45:
                                                mem_report_obj746= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                                bal1=float(mem_report_obj746.balance_amt) + float(temp_family.groom_marriage_amt)
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                            else:
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)     
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                        
                                    else:
                                        print('back bag')
                                        # rejin
                                        # bride details update
                                        get_bride=Member_Details.objects.filter(family=marrige_fam,member_relation_ship='WIFE').first()
                                        get_bride.member_name=temp_family.bride_name
                                        get_bride.member_mobile_number=temp_family.bride_mobile_number
                                        get_bride.member_dob=temp_family.bride_dob
                                        get_bride.save()                                        
                                        # COUNT
                                        fam_mem_count=Member_Details.objects.filter(family=marrige_fam,marriage_remove=False,death=False).count()
                                        try:
                                            get_famly=Fammily_Details.objects.get(id=get_marige_fam_id)
                                            get_famly.members_count=fam_mem_count 
                                            get_famly.save()
                                        except Exception:
                                            pass
                                        
                                        get_grm_mariage_amt_objc=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_objc.member=temp_family.groom_member
                                        get_grm_mariage_amt_objc.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_objc.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_objc.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_objc.save()
                                        
                                                                                
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_bal53=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_gm_bal53:
                                                t_grm_amt=ol_gm_bal53.credit_amt
                                                
                                                check_lessjret=TempleMemberReport.objects.filter(id__lt=ol_gm_bal53.id,members=old_groom_member)
                                                if check_lessjret:
                                                    new_mem_report_objmh87 = check_lessjret.last()
                                                    ol_gm_bal53.credit_amt=temp_family.groom_marriage_amt 
                                                    ol_gm_bal53.balance_amt=float(temp_family.groom_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                    ol_gm_bal53.save()
                                                else:
                                                    ol_gm_bal53.credit_amt=temp_family.groom_marriage_amt 
                                                    ol_gm_bal53.balance_amt=float(temp_family.groom_marriage_amt)
                                                    ol_gm_bal53.save()

                                                if t_grm_amt>temp_family.groom_marriage_amt:
                                                    cal_dif_bal_grm=float(t_grm_amt)-float(temp_family.groom_marriage_amt) 
                                                    new_mem_report_obj3= TempleMemberReport.objects.filter(id__gt=ol_gm_bal53.id,members=ol_gm_bal53.members)
                                                    for new_mem in new_mem_report_obj3:
                                                        new=TempleMemberReport.objects.get(id=new_mem.id)
                                                        new.balance_amt = float(new.balance_amt)-float(cal_dif_bal_grm)
                                                        new.save() 
                                                              
                                                elif t_grm_amt<temp_family.groom_marriage_amt:
                                                    cal_dif_bal_grm78=float(temp_family.groom_marriage_amt)-float(t_grm_amt)
                                                    new_mem_report_obj332= TempleMemberReport.objects.filter(id__gt=ol_gm_bal53.id,members=ol_gm_bal53.members)
                                                    for new_mem3 in new_mem_report_obj332:
                                                        new98=TempleMemberReport.objects.get(id=new_mem3.id)
                                                        new98.balance_amt = float(new98.balance_amt)+float(cal_dif_bal_grm78)
                                                        new98.save()    
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                        
                                                   
                                elif old_groom_family!=new_groom_family:
                                    print('vadakans')
                                    my_dadfam=Fammily_Details.objects.get(id=temp_family.groom_family_id)
                                    fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()
                                    
                                    get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                    get_created_marige_fam.ancestor=new_grm_fam_id
                                    get_created_marige_fam.ancestor_detail=f"{my_dadfam.family_no}/{fath.member_name}"
                                    get_created_marige_fam.address=new_grm_fam_address
                                    get_created_marige_fam.head_native_type=new_grm_fam_native_type
                                    get_created_marige_fam.save()
                                    
                                    ol_grm=Member_Details.objects.get(id=old_groom_id)
                                    ol_grm.family=old_groom_family
                                    ol_grm.head=False
                                    ol_grm.member_relation_ship='SON'
                                    ol_grm.save()
                                
                                    new_grm=Member_Details.objects.get(id=new_grm_id)
                                    new_grm.family=marrige_fam
                                    new_grm.head=True
                                    new_grm.member_relation_ship='FATHER'
                                    new_grm.save()
                                    
                                    # bride details update
                                    get_bride=Member_Details.objects.filter(family=marrige_fam,member_relation_ship='WIFE').first()
                                    get_bride.member_name=temp_family.bride_name
                                    get_bride.member_mobile_number=temp_family.bride_mobile_number
                                    get_bride.member_dob=temp_family.bride_dob
                                    get_bride.save()
                                    
                                    # count
                                    coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                    get_created_marige_fam.members_count=coun
                                    get_created_marige_fam.save()                                    
                                    try:
                                        get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                        m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                        get_fam.members_count=m_count
                                        get_fam.save()
                                    except Exception:
                                        pass
                                    try:
                                        get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                        m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                        get_new_grm_fam1.members_count=m_coun1t3
                                        get_new_grm_fam1.save()
                                    except Exception:
                                        pass                                    
                                    get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                    get_grm_mariage_amt_obj.member=temp_family.groom_member
                                    get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                    get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                    get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                    get_grm_mariage_amt_obj.save()
                                    
                                    # balasheet
                                    # groom
                                    try:
                                        ol_gm_bal=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                        if ol_gm_bal:
                                            new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_gm_bal.id,members=ol_gm_bal.members)
                                            for new_mem in  new_mem_report_obj:
                                                new=TempleMemberReport.objects.get(id=new_mem.id)
                                                new.balance_amt = float(new.balance_amt)-float(g_m_amt)
                                                new.save() 
                                                
                                            ol_gm_bal.delete()
                                        
                                        # create new
                                        new_grm_mem_reportk3= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                        if new_grm_mem_reportk3:
                                            mem_report_obj= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                            bal1=float(mem_report_obj.balance_amt) + float(temp_family.groom_marriage_amt)
                                            TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                        else:
                                            TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                    
                                    except Exception:
                                        print('TempleMemberReport groom geting error')
                                        pass
                    
                    elif old_groom_member!=None and old_bride_member!=None:
                        print('pakistan')
                        if old_groom_family!=None and old_bride_family!=None:
                            print('pakistan-1')
                            if new_groom_family!=None and new_bride_family==None:
                                print('pakistan-2')
                                if old_groom_family==new_groom_family:
                                    print('pakistan-3')
                                    if old_groom_member!=neww_groom_member_obj:
                                        print('pakistan-4')
                                        ol_grm=Member_Details.objects.get(id=old_groom_id)
                                        ol_grm.family=old_groom_family
                                        ol_grm.head=False
                                        ol_grm.member_relation_ship='SON'
                                        ol_grm.save()

                                        new_grm=Member_Details.objects.get(id=new_grm_id)
                                        new_grm.family=marrige_fam
                                        new_grm.head=True
                                        new_grm.member_relation_ship='FATHER'
                                        new_grm.save()
                                        
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.women_ancestor=None
                                        get_created_marige_fam.save()

                                        old_bride=Member_Details.objects.get(id=old_bride_id)
                                        old_bride.family=old_bride_family
                                        old_bride.marriage_remove=False
                                        old_bride.member_relation_ship='DAUGHTER'
                                        old_bride.save()
                                        
                                        # wife 
                                        Member_Details.objects.create(management_profile=management,family=marrige_fam,member_no=member_no(),member_name=temp_family.bride_name,created_by=rejin.id,adult=True,
                                                    member_mobile_number=temp_family.bride_mobile_number,member_dob=temp_family.bride_dob,member_relation_ship='WIFE',member_gender='Female')
                                        
                                        # count
                                        coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                        get_created_marige_fam.members_count=coun
                                        get_created_marige_fam.save()
                                        
                                        try:
                                            get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                            m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                            get_fam.members_count=m_count
                                            get_fam.save()
                                        except Exception:
                                            pass
                                        try:
                                            get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                            m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                            get_new_grm_fam1.members_count=m_coun1t3
                                            get_new_grm_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                            m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                            get_old_br_fam1.members_count=m_coun1t2
                                            get_old_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_obj.member=temp_family.groom_member
                                        get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.save()
                                        
                                        try:
                                            get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                            get_bride_mariage_amt_obj.delete()
                                            
                                            # bride balancesheet
                                            old_b_fathers=get_bride_mariage_amt_obj.member
                                            
                                            ol_br_fath_bal=TempleMemberReport.objects.filter(members=old_b_fathers,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_br_fath_bal:
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_br_fath_bal.id,members=ol_br_fath_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                                    new.save() 
                                                    
                                                ol_br_fath_bal.delete()
                                            
                                        except Exception:
                                            pass
                                        
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_bal=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_gm_bal:
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_gm_bal.id,members=ol_gm_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(g_m_amt)
                                                    new.save() 
                                                    
                                                ol_gm_bal.delete()
                                            
                                            # create new
                                            new_grm_mem_reportk3= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                            if new_grm_mem_reportk3:
                                                mem_report_obj= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                                bal1=float(mem_report_obj.balance_amt) + float(temp_family.groom_marriage_amt)
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                            else:
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                        
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
                                    
                                    else:
                                        print(' pak-cricket')
                                        # rejin
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.women_ancestor=None
                                        get_created_marige_fam.save()

                                        old_bride=Member_Details.objects.get(id=old_bride_id)
                                        old_bride.family=old_bride_family
                                        old_bride.marriage_remove=False
                                        old_bride.member_relation_ship='DAUGHTER'
                                        old_bride.save()
                                        
                                        # wife 
                                        Member_Details.objects.create(management_profile=management,family=marrige_fam,member_no=member_no(),member_name=temp_family.bride_name,created_by=rejin.id,adult=True,
                                                    member_mobile_number=temp_family.bride_mobile_number,member_dob=temp_family.bride_dob,member_relation_ship='WIFE',member_gender='Female')
 
                                        # count
                                        coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                        get_created_marige_fam.members_count=coun
                                        get_created_marige_fam.save()
                                        
                                        try:
                                            get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                            m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                            get_old_br_fam1.members_count=m_coun1t2
                                            get_old_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_obj.member=temp_family.groom_member
                                        get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                        get_grm_mariage_amt_obj.save()
                                        
                                        try:
                                            get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                            get_bride_mariage_amt_obj.delete()
                                            
                                            # bride balancesheet
                                            old_b_fathers=get_bride_mariage_amt_obj.member
                                            
                                            ol_br_fath_bal=TempleMemberReport.objects.filter(members=old_b_fathers,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_br_fath_bal:
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_br_fath_bal.id,members=ol_br_fath_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                                    new.save() 
                                                    
                                                ol_br_fath_bal.delete()
                                        except Exception:
                                            pass
                                        
                                        
                                        # balasheet
                                        # groom
                                        try:
                                            ol_gm_bal=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_gm_bal:
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_gm_bal.id,members=ol_gm_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(g_m_amt)
                                                    new.save() 
                                                    
                                                ol_gm_bal.delete()
                                            
                                            # create new
                                            new_grm_mem_reportk3= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                            if new_grm_mem_reportk3:
                                                mem_report_obj= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                                bal1=float(mem_report_obj.balance_amt) + float(temp_family.groom_marriage_amt)
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                            else:
                                                TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                        
                                        except Exception:
                                            print('TempleMemberReport groom geting error')
                                            pass
    
                                elif old_groom_family!=new_groom_family:
                                    print('pakistan-5')
                                    my_dadfam=Fammily_Details.objects.get(id=temp_family.groom_family_id)
                                    fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()
                                    
                                    get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                    get_created_marige_fam.ancestor=new_grm_fam_id
                                    get_created_marige_fam.ancestor_detail=f"{my_dadfam.family_no}/{fath.member_name}"
                                    get_created_marige_fam.address=new_grm_fam_address
                                    get_created_marige_fam.head_native_type=new_grm_fam_native_type
                                    get_created_marige_fam.save()
                                    
                                    ol_grm=Member_Details.objects.get(id=old_groom_id)
                                    ol_grm.family=old_groom_family
                                    ol_grm.head=False
                                    ol_grm.member_relation_ship='SON'
                                    ol_grm.save()
                                
                                    new_grm=Member_Details.objects.get(id=new_grm_id)
                                    new_grm.family=marrige_fam
                                    new_grm.head=True
                                    new_grm.member_relation_ship='FATHER'
                                    new_grm.save()
                                    
                                    # wife 
                                    Member_Details.objects.create(management_profile=management,family=marrige_fam,member_no=member_no(),member_name=temp_family.bride_name,created_by=rejin.id,adult=True,
                                                    member_mobile_number=temp_family.bride_mobile_number,member_dob=temp_family.bride_dob,member_relation_ship='WIFE',member_gender='Female')
                                    
                                    # count
                                    coun=Member_Details.objects.filter(family=get_created_marige_fam,marriage_remove=False,death=False).count()
                                    get_created_marige_fam.members_count=coun
                                    get_created_marige_fam.save()
                                    
                                    try:
                                        get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                        m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                        get_fam.members_count=m_count
                                        get_fam.save()
                                    except Exception:
                                        pass
                                    try:
                                        get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                        m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                        get_new_grm_fam1.members_count=m_coun1t3
                                        get_new_grm_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                    get_grm_mariage_amt_obj.member=temp_family.groom_member
                                    get_grm_mariage_amt_obj.amount=temp_family.groom_marriage_amt
                                    get_grm_mariage_amt_obj.amount_balance=temp_family.groom_marriage_amt
                                    get_grm_mariage_amt_obj.total_bal_amt=temp_family.groom_marriage_amt
                                    get_grm_mariage_amt_obj.save()
                                    
                                    try:
                                        get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        get_bride_mariage_amt_obj.delete()
                                        
                                        # bride balancesheet
                                        old_b_fathers=get_bride_mariage_amt_obj.member
                                        
                                        ol_br_fath_bal=TempleMemberReport.objects.filter(members=old_b_fathers,marriage=temp_family,type_choice="Marriage Amount").first()
                                        if ol_br_fath_bal:
                                            new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_br_fath_bal.id,members=ol_br_fath_bal.members)
                                            for new_mem in  new_mem_report_obj:
                                                new=TempleMemberReport.objects.get(id=new_mem.id)
                                                new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                                new.save() 
                                                
                                            ol_br_fath_bal.delete()
                                    except Exception:
                                        pass
                                    
                                    # balasheet
                                    # groom
                                    try:
                                        ol_gm_bal=TempleMemberReport.objects.filter(members=old_groom_member,marriage=temp_family,type_choice="Marriage Amount").first()
                                        if ol_gm_bal:
                                            new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_gm_bal.id,members=ol_gm_bal.members)
                                            for new_mem in  new_mem_report_obj:
                                                new=TempleMemberReport.objects.get(id=new_mem.id)
                                                new.balance_amt = float(new.balance_amt)-float(g_m_amt)
                                                new.save() 
                                                
                                            ol_gm_bal.delete()
                                        
                                        # create new
                                        new_grm_mem_reportk3= TempleMemberReport.objects.filter(members=neww_groom_member_obj)
                                        if new_grm_mem_reportk3:
                                            mem_report_obj= TempleMemberReport.objects.filter(members=neww_groom_member_obj).last()
                                            bal1=float(mem_report_obj.balance_amt) + float(temp_family.groom_marriage_amt)
                                            TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                        else:
                                            TempleMemberReport.objects.create(management_profile=management,members=neww_groom_member_obj,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                    
                                    except Exception:
                                        print('TempleMemberReport groom geting error')
                                        pass
                        
                    elif old_groom_member==None and old_bride_member!=None:
                        print('wakanda')
                        if old_groom_family==None and old_bride_family!=None:
                            print('wakanda-1')
                            if new_groom_family!=None and new_bride_family==None:
                                print('wakanda-2')
                                my_dadfam=Fammily_Details.objects.get(id=temp_family.groom_family_id)
                                fath=Member_Details.objects.filter(family=my_dadfam,head=True).first()
                                
                                cretae_fam=Fammily_Details.objects.create(ancestor_detail=f"{my_dadfam.family_no}/{fath.member_name}",ancestor=temp_family.groom_family_id,
                                management_profile=management,family_no=family_no(),address=temp_family.groom_address,head_member_type='EXCISTING',
                                head_native_type=temp_family.groom_family.head_native_type,created_by=rejin.id)
                                
                                new_grm=Member_Details.objects.get(id=new_grm_id)
                                new_grm.family=cretae_fam
                                new_grm.head=True
                                new_grm.member_relation_ship='FATHER'
                                new_grm.save()
                                
                                old_bride=Member_Details.objects.get(id=old_bride_id)
                                old_bride.family=old_bride_family
                                old_bride.marriage_remove=False
                                old_bride.member_relation_ship='DAUGHTER'
                                old_bride.save()
                                
                                # wife 
                                Member_Details.objects.create(management_profile=management,family=cretae_fam,member_no=member_no(),member_name=temp_family.bride_name,created_by=rejin.id,adult=True,
                                                member_mobile_number=temp_family.bride_mobile_number,member_dob=temp_family.bride_dob,member_relation_ship='WIFE',member_gender='Female')
                                
                                # count
                                coun=Member_Details.objects.filter(family=cretae_fam,marriage_remove=False,death=False).count()
                                cretae_fam.members_count=coun
                                cretae_fam.save()
                                
                                try:
                                    get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                    m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                    get_old_br_fam1.members_count=m_coun1t2
                                    get_old_br_fam1.save()
                                except Exception:
                                    pass
                                
                                try:
                                    get_new_grm_fam1=Fammily_Details.objects.get(id=new_grm_fam_id)
                                    m_coun1t3=Member_Details.objects.filter(family=get_new_grm_fam1,marriage_remove=False,death=False).count()
                                    get_new_grm_fam1.members_count=m_coun1t3
                                    get_new_grm_fam1.save()
                                except Exception:
                                    pass
                                
                                x=PeoplesAmountDetails.objects.create(amount_balance=temp_family.groom_marriage_amt,total_bal_amt=temp_family.groom_marriage_amt,management_profile=management,member=temp_family.groom_member,
                                                        marriage=temp_family,amount=temp_family.groom_marriage_amt,name='Marriage',daughters_amt=False,created_by=rejin.id)
                                
                                mem_report= TempleMemberReport.objects.filter(members=x.member)
                                if mem_report:
                                    mem_report_obj= TempleMemberReport.objects.filter(members=x.member).last()
                                    bal1=float(mem_report_obj.balance_amt) + float(temp_family.groom_marriage_amt)
                                    tem_report=TempleMemberReport.objects.create(management_profile=management,members=x.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=bal1,type_choice="Marriage Amount",created_by=rejin.id)
                                else:
                                    tem_report=TempleMemberReport.objects.create(management_profile=management,members=x.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.groom_marriage_amt,balance_amt=temp_family.groom_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                
                                try:
                                    get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                    get_bride_mariage_amt_obj.delete()
                                    
                                    # bride balancesheet
                                    old_b_fathers=get_bride_mariage_amt_obj.member
                                    
                                    ol_br_fath_bal=TempleMemberReport.objects.filter(members=old_b_fathers,marriage=temp_family,type_choice="Marriage Amount").first()
                                    if ol_br_fath_bal:
                                        new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_br_fath_bal.id,members=ol_br_fath_bal.members)
                                        for new_mem in  new_mem_report_obj:
                                            new=TempleMemberReport.objects.get(id=new_mem.id)
                                            new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                            new.save() 
                                            
                                        ol_br_fath_bal.delete()
                                    
                                except Exception:
                                    pass
                                
                                # new
                                temp_family.new_family=cretae_fam
                                temp_family.save()
                                
                elif neww_groom_member_obj==None and neww_bride_mem_obj!=None:
                    print('aqua man')
                    if old_groom_member==None and old_bride_member!=None:
                        print('aqua man--1')
                        if old_groom_family==None and old_bride_family!=None:
                            print('aqua man--2')
                            if new_groom_family==None and new_bride_family!=None:
                                print('aqua man--3')
                                if old_bride_family==new_bride_family:
                                    print('aqua man--4')
                                    if old_bride_member!=neww_bride_mem_obj:
                                        print('aqua man--5')
                                        old_bride=Member_Details.objects.get(id=old_bride_id)
                                        old_bride.marriage_remove=False
                                        old_bride.member_relation_ship='DAUGHTER'
                                        old_bride.save()
                                        
                                        new_brde=Member_Details.objects.get(id=new_br_id)
                                        new_brde.marriage_remove=True
                                        new_brde.member_relation_ship='DAUGHTER'
                                        new_brde.save()
                                        
                                        try:
                                            get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                            m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                            get_new_br_fam1.members_count=m_coun1t
                                            get_new_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                            m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                            get_old_br_fam1.members_count=m_coun1t2
                                            get_old_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                        
                                        get_bride_mariage_amt_objmj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        get_bride_mariage_amt_objmj.member=bride_father
                                        get_bride_mariage_amt_objmj.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_objmj.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_objmj.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_objmj.save()
                                        
                                        # bride sheet
                                        try:
                                            br_father_bal=TempleMemberReport.objects.filter(members=bride_father,marriage=temp_family,type_choice="Marriage Amount").first()
                                            t_mem_amt=br_father_bal.credit_amt
                                            
                                            check_lessjret=TempleMemberReport.objects.filter(id__lt=br_father_bal.id,members=bride_father)
                                            if check_lessjret:
                                                new_mem_report_objmh87 = check_lessjret.last()
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                br_father_bal.save()
                                            else:
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)
                                                br_father_bal.save()
                                            
                                            if t_mem_amt>temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(t_mem_amt)-float(temp_family.bride_marriage_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(cal_dif_bal)
                                                    new.save() 
                                            elif t_mem_amt<temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(temp_family.bride_marriage_amt)-float(t_mem_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)+float(cal_dif_bal)
                                                    new.save()  
                                        except Exception:
                                            print('TempleMemberReport bride fath geting error')
                                            pass
                                        
                                    else:
                                        print('aqua man--6')
                                        
                                        # rejin
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                        get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        get_bride_mariage_amt_obj.member=bride_father
                                        get_bride_mariage_amt_obj.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.save()
                                        
                                        # bride sheet
                                        try:
                                            br_father_bal=TempleMemberReport.objects.filter(members=bride_father,marriage=temp_family,type_choice="Marriage Amount").first()
                                            t_mem_amt=br_father_bal.credit_amt
                                            
                                            check_lessjreth=TempleMemberReport.objects.filter(id__lt=br_father_bal.id,members=bride_father)
                                            if check_lessjreth:
                                                new_mem_report_objmh87q = check_lessjreth.last()
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)+float(new_mem_report_objmh87q.balance_amt)
                                                br_father_bal.save()
                                            else:
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)
                                                br_father_bal.save()
                                            
                                            if t_mem_amt>temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(t_mem_amt)-float(temp_family.bride_marriage_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(cal_dif_bal)
                                                    new.save() 
                                            elif t_mem_amt<temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(temp_family.bride_marriage_amt)-float(t_mem_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)+float(cal_dif_bal)
                                                    new.save()  
                                        except Exception:
                                            print('TempleMemberReport bride fath geting error')
                                            pass
                                        
                                             
                                elif old_bride_family!=new_bride_family:
                                    print('aqua man--7')
                                    
                                    old_bride=Member_Details.objects.get(id=old_bride_id)
                                    old_bride.marriage_remove=False
                                    old_bride.member_relation_ship='DAUGHTER'
                                    old_bride.save()
                                    
                                    new_brde=Member_Details.objects.get(id=new_br_id)
                                    new_brde.marriage_remove=True
                                    new_brde.member_relation_ship='WIFE'
                                    new_brde.save()
                                    
                                    try:
                                        get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                        m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                        get_new_br_fam1.members_count=m_coun1t
                                        get_new_br_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    try:
                                        get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                        m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                        get_old_br_fam1.members_count=m_coun1t2
                                        get_old_br_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                    
                                    get_bride_mariage_amt_objcf=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                    if get_bride_mariage_amt_objcf:
                                        old_b_fathers=get_bride_mariage_amt_objcf.member
                                        get_bride_mariage_amt_objcf.member=bride_father
                                        get_bride_mariage_amt_objcf.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_objcf.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_objcf.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_objcf.save()
                                    
                                    # bride
                                    try:
                                        ol_br_fath_bal=TempleMemberReport.objects.filter(members=old_b_fathers,marriage=temp_family,type_choice="Marriage Amount").first()
                                        if ol_br_fath_bal:
                                            new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_br_fath_bal.id,members=ol_br_fath_bal.members)
                                            for new_mem in  new_mem_report_obj:
                                                new=TempleMemberReport.objects.get(id=new_mem.id)
                                                new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                                new.save() 
                                                
                                            ol_br_fath_bal.delete()
                                        
                                        # create new
                                        new_bride_father_reportk3ty= TempleMemberReport.objects.filter(members=bride_father)
                                        if new_bride_father_reportk3ty:
                                            mem_report_obj= TempleMemberReport.objects.filter(members=bride_father).last()
                                            bal1f=float(mem_report_obj.balance_amt) + float(temp_family.bride_marriage_amt)
                                            TempleMemberReport.objects.create(management_profile=management,members=bride_father,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=bal1f,type_choice="Marriage Amount",created_by=rejin.id)
                                        else:
                                            TempleMemberReport.objects.create(management_profile=management,members=bride_father,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=temp_family.bride_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                    
                                    except Exception:
                                        print('TempleMemberReport groom geting error')
                                        pass
                                    
                    elif old_groom_member!=None and old_bride_member!=None:
                        print('shipmarin')
                        if old_groom_family!=None and old_bride_family!=None:
                            print('jacki')
                            if new_groom_family==None and new_bride_family!=None:
                                print('helloooooo')
                                if old_bride_family==new_bride_family:
                                    print('mdjhd')
                                    if old_bride_member!=neww_bride_mem_obj:
                                        print('gdgdhvgv')
                                        old_bride=Member_Details.objects.get(id=old_bride_id)
                                        old_bride.family=old_bride_family
                                        old_bride.marriage_remove=False
                                        old_bride.member_relation_ship='DAUGHTER'
                                        old_bride.save()
                                        
                                        new_brde=Member_Details.objects.get(id=new_br_id)
                                        new_brde.marriage_remove=True
                                        new_brde.member_relation_ship='DAUGHTER'
                                        new_brde.save()
                                        
                                        ol_grm=Member_Details.objects.get(id=old_groom_id)
                                        ol_grm.family=old_groom_family
                                        ol_grm.head=False
                                        ol_grm.member_relation_ship='SON'
                                        ol_grm.save()

                                        temp_family.new_family=None
                                        temp_family.save()
                                        
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.delete()
                                        
                                        # count
                                        try:
                                            get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                            m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                            get_fam.members_count=m_count
                                            get_fam.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                            m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                            get_new_br_fam1.members_count=m_coun1t
                                            get_new_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                            m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                            get_old_br_fam1.members_count=m_coun1t2
                                            get_old_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                        
                                        get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        get_bride_mariage_amt_obj.member=bride_father
                                        get_bride_mariage_amt_obj.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.save()
                                        
                                        try:
                                            get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                            get_grm_mariage_amt_obj.delete()
                                            
                                            # groom balancesheet
                                            old_g_memb=get_grm_mariage_amt_obj.member
                                            
                                            ol_grm_mem_balsheeet=TempleMemberReport.objects.filter(members=old_g_memb,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_grm_mem_balsheeet:
                                                new_mem_report_objmh= TempleMemberReport.objects.filter(id__gt=ol_grm_mem_balsheeet.id,members=ol_grm_mem_balsheeet.members)
                                                for new_mem in  new_mem_report_objmh:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                                    new.save() 
                                                    
                                                ol_grm_mem_balsheeet.delete()
                                            
                                        except Exception:
                                            pass
                                        
                                        # bride 
                                        try:
                                            br_father_bal=TempleMemberReport.objects.filter(members=bride_father,marriage=temp_family,type_choice="Marriage Amount").first()
                                            t_mem_amt=br_father_bal.credit_amt
                                            
                                            check_lessjret=TempleMemberReport.objects.filter(id__lt=br_father_bal.id,members=bride_father)
                                            if check_lessjret:
                                                new_mem_report_objmh87 = check_lessjret.last()
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                br_father_bal.save()
                                            else:
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)
                                                br_father_bal.save()
                                            
                                            if t_mem_amt>temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(t_mem_amt)-float(temp_family.bride_marriage_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(cal_dif_bal)
                                                    new.save() 
                                            elif t_mem_amt<temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(temp_family.bride_marriage_amt)-float(t_mem_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)+float(cal_dif_bal)
                                                    new.save()  
                                        except Exception:
                                            print('TempleMemberReport bride fath geting error')
                                            pass
                                            
                                    else:
                                        print('avatar')
                                        old_bride=Member_Details.objects.get(id=old_bride_id)
                                        old_bride.family=old_bride_family
                                        old_bride.marriage_remove=True
                                        old_bride.member_relation_ship='DAUGHTER'
                                        old_bride.save()
                                        
                                        ol_grm=Member_Details.objects.get(id=old_groom_id)
                                        ol_grm.family=old_groom_family
                                        ol_grm.head=False
                                        ol_grm.member_relation_ship='SON'
                                        ol_grm.save()

                                        temp_family.new_family=None
                                        temp_family.save()
                                        
                                        get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                        get_created_marige_fam.delete()
                                        
                                        # count
                                        try:
                                            get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                            m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                            get_fam.members_count=m_count
                                            get_fam.save()
                                        except Exception:
                                            pass
                                        
                                        try:
                                            get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                            m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                            get_old_br_fam1.members_count=m_coun1t2
                                            get_old_br_fam1.save()
                                        except Exception:
                                            pass
                                        
                                        bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                        
                                        get_bride_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                        get_bride_mariage_amt_obj.member=bride_father
                                        get_bride_mariage_amt_obj.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj.save()
                                        
                                        try:
                                            get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                            get_grm_mariage_amt_obj.delete()
                                            
                                            # groom balancesheet
                                            old_g_memb=get_grm_mariage_amt_obj.member
                                            
                                            ol_grm_mem_balsheeet=TempleMemberReport.objects.filter(members=old_g_memb,marriage=temp_family,type_choice="Marriage Amount").first()
                                            if ol_grm_mem_balsheeet:
                                                new_mem_report_objmh= TempleMemberReport.objects.filter(id__gt=ol_grm_mem_balsheeet.id,members=ol_grm_mem_balsheeet.members)
                                                for new_mem in  new_mem_report_objmh:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                                    new.save() 
                                                    
                                                ol_grm_mem_balsheeet.delete()
                                            
                                        except Exception:
                                            pass
                                        
                                        # bride 
                                        try:
                                            br_father_bal=TempleMemberReport.objects.filter(members=bride_father,marriage=temp_family,type_choice="Marriage Amount").first()
                                            t_mem_amt=br_father_bal.credit_amt
                                            
                                            check_lessjret=TempleMemberReport.objects.filter(id__lt=br_father_bal.id,members=bride_father)
                                            if check_lessjret:
                                                new_mem_report_objmh87 = check_lessjret.last()
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)+float(new_mem_report_objmh87.balance_amt)
                                                br_father_bal.save()
                                            else:
                                                br_father_bal.credit_amt=temp_family.bride_marriage_amt 
                                                br_father_bal.balance_amt=float(temp_family.bride_marriage_amt)
                                                br_father_bal.save()
                                            
                                            if t_mem_amt>temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(t_mem_amt)-float(temp_family.bride_marriage_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)-float(cal_dif_bal)
                                                    new.save() 
                                            elif t_mem_amt<temp_family.bride_marriage_amt:
                                                cal_dif_bal=float(temp_family.bride_marriage_amt)-float(t_mem_amt)
                                                new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=br_father_bal.id,members=br_father_bal.members)
                                                for new_mem in  new_mem_report_obj:
                                                    new=TempleMemberReport.objects.get(id=new_mem.id)
                                                    new.balance_amt = float(new.balance_amt)+float(cal_dif_bal)
                                                    new.save()  
                                        except Exception:
                                            print('TempleMemberReport bride fath geting error')
                                            pass
                                        
                                elif old_bride_family!=new_bride_family:
                                    print('lljhdggd')
                                    old_bride=Member_Details.objects.get(id=old_bride_id)
                                    old_bride.family=old_bride_family
                                    old_bride.marriage_remove=False
                                    old_bride.member_relation_ship='DAUGHTER'
                                    old_bride.save()
                                    
                                    new_brde=Member_Details.objects.get(id=new_br_id)
                                    new_brde.marriage_remove=True
                                    new_brde.member_relation_ship='DAUGHTER'
                                    new_brde.save()
                                    
                                    ol_grm=Member_Details.objects.get(id=old_groom_id)
                                    ol_grm.family=old_groom_family
                                    ol_grm.head=False
                                    ol_grm.member_relation_ship='SON'
                                    ol_grm.save()

                                    temp_family.new_family=None
                                    temp_family.save()
                                    
                                    get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                    get_created_marige_fam.delete()
                                    
                                    # count
                                    try:
                                        get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                        m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                        get_fam.members_count=m_count
                                        get_fam.save()
                                    except Exception:
                                        pass
                                    
                                    try:
                                        get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                        m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                        get_new_br_fam1.members_count=m_coun1t
                                        get_new_br_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    try:
                                        get_old_br_fam1=Fammily_Details.objects.get(id=ol_bride_famlyid)
                                        m_coun1t2=Member_Details.objects.filter(family=get_old_br_fam1,marriage_remove=False,death=False).count()
                                        get_old_br_fam1.members_count=m_coun1t2
                                        get_old_br_fam1.save()
                                    except Exception:
                                        pass
                                    
                                    bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                    
                                    get_bride_mariage_amt_obj763=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=True).first()
                                    if get_bride_mariage_amt_obj763:
                                        old_b_fathers=get_bride_mariage_amt_obj763.member
                                        get_bride_mariage_amt_obj763.member=bride_father
                                        get_bride_mariage_amt_obj763.amount=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj763.amount_balance=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj763.total_bal_amt=temp_family.bride_marriage_amt
                                        get_bride_mariage_amt_obj763.save()
                                    
                                    # bride
                                    try:
                                        ol_br_fath_bal=TempleMemberReport.objects.filter(members=old_b_fathers,marriage=temp_family,type_choice="Marriage Amount").first()
                                        if ol_br_fath_bal:
                                            new_mem_report_obj= TempleMemberReport.objects.filter(id__gt=ol_br_fath_bal.id,members=ol_br_fath_bal.members)
                                            for new_mem in  new_mem_report_obj:
                                                new=TempleMemberReport.objects.get(id=new_mem.id)
                                                new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                                new.save() 
                                                
                                            ol_br_fath_bal.delete()
                                        
                                        # create new
                                        new_bride_father_reportk3ty= TempleMemberReport.objects.filter(members=bride_father)
                                        if new_bride_father_reportk3ty:
                                            mem_report_obj= TempleMemberReport.objects.filter(members=bride_father).last()
                                            bal1f=float(mem_report_obj.balance_amt) + float(temp_family.bride_marriage_amt)
                                            TempleMemberReport.objects.create(management_profile=management,members=bride_father,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=bal1f,type_choice="Marriage Amount",created_by=rejin.id)
                                        else:
                                            TempleMemberReport.objects.create(management_profile=management,members=bride_father,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=temp_family.bride_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                                    
                                    except Exception:
                                        print('TempleMemberReport groom geting error')
                                        pass
                                    
                                    try:
                                        get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                        get_grm_mariage_amt_obj.delete()
                                        
                                        # groom balancesheet
                                        old_g_memb=get_grm_mariage_amt_obj.member
                                        
                                        ol_grm_mem_balsheeet=TempleMemberReport.objects.filter(members=old_g_memb,marriage=temp_family,type_choice="Marriage Amount").first()
                                        if ol_grm_mem_balsheeet:
                                            new_mem_report_objmh= TempleMemberReport.objects.filter(id__gt=ol_grm_mem_balsheeet.id,members=ol_grm_mem_balsheeet.members)
                                            for new_mem in  new_mem_report_objmh:
                                                new=TempleMemberReport.objects.get(id=new_mem.id)
                                                new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                                new.save() 
                                                
                                            ol_grm_mem_balsheeet.delete()
                                        
                                    except Exception:
                                        pass
                                    
                    elif old_groom_member!=None and old_bride_member==None:
                        print('modi ji')
                        if old_groom_family!=None and old_bride_family==None:
                            print('bjp')
                            if new_groom_family==None and new_bride_family!=None:
                                print('sawmiji')
                                new_brde=Member_Details.objects.get(id=new_br_id)
                                new_brde.marriage_remove=True
                                new_brde.member_relation_ship='DAUGHTER'
                                new_brde.save()
                                
                                ol_grm=Member_Details.objects.get(id=old_groom_id)
                                ol_grm.family=old_groom_family
                                ol_grm.head=False
                                ol_grm.member_relation_ship='SON'
                                ol_grm.save()

                                temp_family.new_family=None
                                temp_family.save()
                                
                                get_created_marige_fam=Fammily_Details.objects.get(id=get_marige_fam_id)
                                get_created_marige_fam.delete()
                                
                                # count
                                try:
                                    get_fam=Fammily_Details.objects.get(id=ol_grm_familyid)
                                    m_count=Member_Details.objects.filter(family=get_fam,marriage_remove=False,death=False).count()
                                    get_fam.members_count=m_count
                                    get_fam.save()
                                except Exception:
                                    pass
                                
                                try:
                                    get_new_br_fam1=Fammily_Details.objects.get(id=new_bride_fam_id)
                                    m_coun1t=Member_Details.objects.filter(family=get_new_br_fam1,marriage_remove=False,death=False).count()
                                    get_new_br_fam1.members_count=m_coun1t
                                    get_new_br_fam1.save()
                                except Exception:
                                    pass
                                
                                try:
                                    get_grm_mariage_amt_obj=PeoplesAmountDetails.objects.filter(marriage=temp_family,daughters_amt=False).first()
                                    get_grm_mariage_amt_obj.delete()
                                    
                                    # groom balancesheet
                                    old_g_memb=get_grm_mariage_amt_obj.member
                                    
                                    ol_grm_mem_balsheeet=TempleMemberReport.objects.filter(members=old_g_memb,marriage=temp_family,type_choice="Marriage Amount").first()
                                    if ol_grm_mem_balsheeet:
                                        new_mem_report_objmh= TempleMemberReport.objects.filter(id__gt=ol_grm_mem_balsheeet.id,members=ol_grm_mem_balsheeet.members)
                                        for new_mem in  new_mem_report_objmh:
                                            new=TempleMemberReport.objects.get(id=new_mem.id)
                                            new.balance_amt = float(new.balance_amt)-float(b_m_amt)
                                            new.save() 
                                            
                                        ol_grm_mem_balsheeet.delete()
                                    
                                except Exception:
                                    pass
                                
                                bride_father=Member_Details.objects.filter(family=temp_family.bride_family,head=True).first()
                                y=PeoplesAmountDetails.objects.create(created_by=rejin.id,amount_balance=temp_family.bride_marriage_amt,total_bal_amt=temp_family.bride_marriage_amt,management_profile=management,member=bride_father,
                                                    marriage=temp_family,amount=temp_family.bride_marriage_amt,name='Marriage',daughters_amt=True)
                                
                                mem_reportss= TempleMemberReport.objects.filter(members=y.member)
                                if mem_reportss:
                                    mem_report_obj11= TempleMemberReport.objects.filter(members=y.member).last()
                                    bal=float(mem_report_obj11.balance_amt) + float(temp_family.bride_marriage_amt)
                                    TempleMemberReport.objects.create(management_profile=management,members=y.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=bal,type_choice="Marriage Amount",created_by=rejin.id)
                                else:
                                    TempleMemberReport.objects.create(management_profile=management,members=y.member,marriage=temp_family,reportdate=datetime.date.today(),credit_amt=temp_family.bride_marriage_amt,balance_amt=temp_family.bride_marriage_amt,type_choice="Marriage Amount",created_by=rejin.id)
                                        
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)


    elif request.method == 'PATCH':
        if get_role=="Admin" or rejin.is_superuser == True  or get_role=="User" and perm.marriage_edit==True:

            serializer876 = MarriageDetailsSerializer(customer,data=request.data,partial=True)
            if serializer876.is_valid():
                temp_family=serializer876.save()
                temp_family.created_by=rejin.id
                temp_family.save()
                return Response(serializer876.data,status=status.HTTP_201_CREATED)
            else:
                return Response(serializer876.errors,status=status.HTTP_400_BAD_REQUEST)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)
            
    elif request.method == 'DELETE':
        if get_role=="Admin" or rejin.is_superuser == True or get_role=="User" and perm.marriage_delete or get_role=="User" and perm.marriage_edit==True:
            marriage_check=CollectionDetails.objects.filter(marriage_id=pk)
            if marriage_check:
                return Response({'message':"Cannot be deleted as it is involved in transactions"},status.HTTP_302_FOUND)
            date_check=  (customer.created_at.month != datetime.datetime.now().month and customer.created_at.year != datetime.datetime.now().year)  or  (customer.created_at.month != datetime.datetime.now().month and customer.created_at.year == datetime.datetime.now().year)   or (customer.created_at.month == datetime.datetime.now().month and customer.created_at.year != datetime.datetime.now().year)     
            if date_check:
                return Response({'message':"Cannot be deleted"},status.HTTP_302_FOUND)
            if customer.groom_member!=None and customer.bride_member!=None:
                groom_check=Member_Details.objects.filter(id=customer.groom_member_id).first()
                bride_check=Member_Details.objects.filter(id=customer.bride_member_id).first()
                # chage_mem=Member_Details.objects.filter(id=customer.groom_member_id).first()
                if groom_check:
                    groom_check.family=customer.groom_family
                    groom_check.head=False
                    groom_check.member_relation_ship="SON"
                    groom_check.save()
                if bride_check:
                    bride_check.family=customer.bride_family
                    bride_check.member_relation_ship="DAUGHTER"
                    bride_check.save()
                family_check=Fammily_Details.objects.filter(id=customer.new_family_id).first()                
                ancestor_check=Fammily_Details.objects.filter(ancestor=str(family_check.id))
                if ancestor_check:
                    for i in ancestor_check:
                        i.ancestor=None
                        i.ancestor_detail=None
                        i.save()
                family_check.delete()

            elif customer.groom_member==None and customer.bride_member!=None:
                bride_check=Member_Details.objects.filter(id=customer.bride_member_id).first()              
                if bride_check:
                    bride_check.family=customer.bride_family
                    bride_check.marriage_remove=False
                    bride_check.member_relation_ship="DAUGHTER"
                    bride_check.save()         
              
            elif customer.groom_member!=None and customer.bride_member==None:
                groom_check=Member_Details.objects.filter(id=customer.groom_member_id).first()                
                if groom_check:
                    groom_check.family=customer.groom_family
                    groom_check.head=False
                    groom_check.member_relation_ship="SON" 
                    groom_check.save()                
                family_check=Fammily_Details.objects.filter(id=customer.new_family_id).first()                
                ancestor_check=Fammily_Details.objects.filter(ancestor=str(family_check.id))
                if ancestor_check:
                    for i in ancestor_check:
                        i.ancestor=None
                        i.ancestor_detail=None
                        i.save()
                family_check.delete()           
            customer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"un-authenticate"},status.HTTP_401_UNAUTHORIZED)