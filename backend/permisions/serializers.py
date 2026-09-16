from rest_framework import serializers
from .models import My_Roles,Permisions

class PermisionsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    class Meta:
        model =Permisions
        fields = '__all__'

class My_RolesSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    role_link = PermisionsSerializer(many=True)
    class Meta:
        model = My_Roles
        fields = ['id','Role_name','role_link'] 

    def create(self, validated_data):
        role_link = validated_data.pop('role_link')
        profile_instance = My_Roles.objects.create(**validated_data)
        for hobby in role_link:
            Permisions.objects.create(role_link=profile_instance,**hobby)
            
        return profile_instance
    
    def update(self, instance, validated_data):
            user_hobby_list = validated_data.pop('role_link')
            instance.Role_name = validated_data.get('Role_name', instance.Role_name)                        
            instance.save()
                    
            hobbies_with_same_profile_instance = Permisions.objects.filter(role_link=instance.pk).values_list('id', flat=True)
            print(hobbies_with_same_profile_instance)
            
            hobbies_with_s = Permisions.objects.filter(role_link=instance.pk)
            
            hobbies_id_pool = []
            for hobby in user_hobby_list:
                if "id" in hobby.keys():
                    if Permisions.objects.filter(id=hobby['id']).exists():
                        hobby_instance = Permisions.objects.get(id=hobby['id'])
                        # dash
                        hobby_instance.dashboard = hobby.get('dashboard', hobby_instance.dashboard)
                        # family
                        hobby_instance.fam_add = hobby.get('fam_add', hobby_instance.fam_add)
                        hobby_instance.fam_view = hobby.get('fam_view', hobby_instance.fam_view)
                        hobby_instance.fam_edit = hobby.get('fam_edit', hobby_instance.fam_edit)
                        hobby_instance.fam_delete = hobby.get('fam_del', hobby_instance.fam_del)
                        # asset
                        hobby_instance.asset_add = hobby.get('asset_add', hobby_instance.asset_add)
                        hobby_instance.asset_view = hobby.get('asset_view', hobby_instance.asset_view)
                        hobby_instance.asset_edit = hobby.get('asset_edit', hobby_instance.asset_edit)
                        hobby_instance.asset_delete = hobby.get('asset_del', hobby_instance.asset_del)
                        # expense
                        hobby_instance.expense_add = hobby.get('expense_add', hobby_instance.expense_add)
                        hobby_instance.expense_view = hobby.get('expense_view', hobby_instance.expense_view)
                        hobby_instance.expense_edit = hobby.get('expense_edit', hobby_instance.expense_edit)
                        hobby_instance.expense_delete = hobby.get('expense_del', hobby_instance.expense_del)
                        # collection
                        # hobby_instance.collection_add = hobby.get('collection_add', hobby_instance.collection_add)
                        # hobby_instance.collection_view = hobby.get('collection_view', hobby_instance.collection_view)
                        # hobby_instance.collection_edit = hobby.get('collection_edit', hobby_instance.collection_edit)
                        # hobby_instance.collection_del = hobby.get('collection_del', hobby_instance.collection_del)
                        # management
                        # hobby_instance.manage_add = hobby.get('manage_add', hobby_instance.manage_add)
                        # hobby_instance.manage_view = hobby.get('manage_view', hobby_instance.manage_view)
                        # hobby_instance.manage_edit = hobby.get('manage_edit', hobby_instance.manage_edit)
                        # hobby_instance.manage_del = hobby.get('manage_del', hobby_instance.manage_del)
                        # fund
                        hobby_instance.fund_add = hobby.get('fund_add', hobby_instance.fund_add)
                        hobby_instance.fund_view = hobby.get('fund_view', hobby_instance.fund_view)
                        hobby_instance.fund_edit = hobby.get('fund_edit', hobby_instance.fund_edit)
                        hobby_instance.fund_delete = hobby.get('fund_del', hobby_instance.fund_del)
                        # chit_fund
                        hobby_instance.chit_fund_add = hobby.get('chit_fund_add', hobby_instance.chit_fund_add)
                        hobby_instance.chit_fund_view = hobby.get('chit_fund_view', hobby_instance.chit_fund_view)
                        hobby_instance.chit_fund_edit = hobby.get('chit_fund_edit', hobby_instance.chit_fund_edit)
                        hobby_instance.chit_fund_delete = hobby.get('chit_fund_del', hobby_instance.chit_fund_del)
                        # fund_lease
                        # hobby_instance.fund_lease_add = hobby.get('fund_lease_add', hobby_instance.fund_lease_add)
                        # hobby_instance.fund_lease_view = hobby.get('fund_lease_view', hobby_instance.fund_lease_view)
                        # hobby_instance.fund_lease_edit = hobby.get('fund_lease_edit', hobby_instance.fund_lease_edit)
                        # hobby_instance.fund_lease_del = hobby.get('fund_lease_del', hobby_instance.fund_lease_del)
                        # authority
                        hobby_instance.authority_add = hobby.get('authority_add', hobby_instance.authority_add)
                        hobby_instance.authority_view = hobby.get('authority_view', hobby_instance.authority_view)
                        hobby_instance.authority_edit = hobby.get('authority_edit', hobby_instance.authority_edit)
                        hobby_instance.authority_delete = hobby.get('authority_del', hobby_instance.authority_del)
                        # user
                        # hobby_instance.user_add = hobby.get('user_add', hobby_instance.user_add)
                        # hobby_instance.user_view = hobby.get('user_view', hobby_instance.user_view)
                        # hobby_instance.user_edit = hobby.get('user_edit', hobby_instance.user_edit)
                        # hobby_instance.user_del = hobby.get('user_del', hobby_instance.user_del)
                        # death
                        hobby_instance.death_add = hobby.get('death_add', hobby_instance.death_add)
                        hobby_instance.death_view = hobby.get('death_view', hobby_instance.death_view)
                        hobby_instance.death_edit = hobby.get('death_edit', hobby_instance.death_edit)
                        hobby_instance.death_delete = hobby.get('death_del', hobby_instance.death_del)
                        # marriage
                        hobby_instance.marriage_add = hobby.get('marriage_add', hobby_instance.marriage_add)
                        hobby_instance.marriage_view = hobby.get('marriage_view', hobby_instance.marriage_view)
                        hobby_instance.marriage_edit = hobby.get('marriage_edit', hobby_instance.marriage_edit)
                        hobby_instance.marriage_delete = hobby.get('marriage_del', hobby_instance.marriage_del)
                        
                        # income
                        hobby_instance.income_add = hobby.get('income_add', hobby_instance.income_add)
                        hobby_instance.income_view = hobby.get('income_view', hobby_instance.income_view)
                        hobby_instance.income_edit = hobby.get('income_edit', hobby_instance.income_edit)
                        hobby_instance.income_delete = hobby.get('income_del', hobby_instance.income_del)
                        # sangam
                        hobby_instance.sangam_add = hobby.get('sangam_add', hobby_instance.sangam_add)
                        hobby_instance.sangam_view = hobby.get('sangam_view', hobby_instance.sangam_view)
                        hobby_instance.sangam_edit = hobby.get('sangam_edit', hobby_instance.sangam_edit)
                        hobby_instance.sangam_delete = hobby.get('sangam_del', hobby_instance.sangam_del)
                        # balance sheet
                        hobby_instance.balance_sheet_view = hobby.get('balance_sheet_view', hobby_instance.balance_sheet_view)
                        # rental
                        hobby_instance.rental_add = hobby.get('rental_add', hobby_instance.rental_add)
                        hobby_instance.rental_view = hobby.get('rental_view', hobby_instance.rental_view)
                        hobby_instance.rental_edit = hobby.get('rental_edit', hobby_instance.rental_edit)
                        hobby_instance.rental_delete = hobby.get('rental_del', hobby_instance.rental_del)
                        # festival
                        hobby_instance.festival_add = hobby.get('festival_add', hobby_instance.festival_add)
                        hobby_instance.festival_view = hobby.get('festival_view', hobby_instance.festival_view)
                        hobby_instance.festival_edit = hobby.get('festival_edit', hobby_instance.festival_edit)
                        hobby_instance.festival_delete = hobby.get('festival_del', hobby_instance.festival_del)
                        # sub_tariff
                        hobby_instance.sub_tarif_add = hobby.get('sub_tarif_add', hobby_instance.sub_tarif_add)
                        hobby_instance.sub_tarif_view = hobby.get('sub_tarif_view', hobby_instance.sub_tarif_view)
                        hobby_instance.sub_tarif_edit = hobby.get('sub_tarif_edit', hobby_instance.sub_tarif_edit)
                        hobby_instance.sub_tarif_delete = hobby.get('sub_tarif_del', hobby_instance.sub_tarif_del)
                        # tax
                        # hobby_instance.tax_add = hobby.get('tax_add', hobby_instance.tax_add)
                        # hobby_instance.tax_view = hobby.get('tax_view', hobby_instance.tax_view)
                        # hobby_instance.tax_edit = hobby.get('tax_edit', hobby_instance.tax_edit)
                        # hobby_instance.tax_del = hobby.get('tax_del', hobby_instance.tax_del)
                        # interest
                        hobby_instance.interest_add = hobby.get('interest_add', hobby_instance.interest_add)
                        hobby_instance.interest_view = hobby.get('interest_view', hobby_instance.interest_view)
                        hobby_instance.interest_edit = hobby.get('interest_edit', hobby_instance.interest_edit)
                        hobby_instance.interest_delete = hobby.get('interest_del', hobby_instance.interest_del)
                        # amount_collection
                        hobby_instance.fund = hobby.get('fund', hobby_instance.fund)
                        hobby_instance.festival = hobby.get('festival', hobby_instance.festival)
                        # hobby_instance.tax = hobby.get('tax', hobby_instance.tax)
                        hobby_instance.rent = hobby.get('rent', hobby_instance.rent)
                        hobby_instance.lease = hobby.get('lease', hobby_instance.lease)
                        hobby_instance.management_interest = hobby.get('management_interest', hobby_instance.management_interest)
                        hobby_instance.chit_interest = hobby.get('chit_interest', hobby_instance.chit_interest)
                        hobby_instance.sub_tariff = hobby.get('sub_tariff', hobby_instance.sub_tariff)
                        # hobby_instance.chit_fund = hobby.get('chit_fund', hobby_instance.chit_fund)
                        hobby_instance.balance = hobby.get('balance', hobby_instance.balance)
                        
                        hobby_instance.save()
                        hobbies_id_pool.append(hobby_instance.id)
                    else:
                        continue
                else:
                    hobbies_instance = Permisions.objects.create(role_link=instance, **hobby)
                    hobbies_id_pool.append(hobbies_instance.id)
                    

            for hobby_id in hobbies_with_same_profile_instance:
                if hobby_id not in hobbies_id_pool:
                    Permisions.objects.filter(pk=hobby_id).delete()

            return instance