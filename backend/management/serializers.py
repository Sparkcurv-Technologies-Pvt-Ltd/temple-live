from rest_framework import serializers
from .models import ManagementDetails,BankDetails
from .models import Instructions
from collection.models import CollectionDetails
from amount.models import CashTransactionDetails


class BankDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    class Meta:
        model =BankDetails
        # fields = '__all__'
        fields = ['id','bank_name','account_no','ifsc','account_holder_name','branch_name',
                  'bank_opening_balance_amt','bank_opening_balance_type']
        
class ManagementDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    images=serializers.ImageField(required=False)
    documents=serializers.FileField(required=False)
    management = BankDetailsSerializer(many=True)
    class Meta:
        model = ManagementDetails
        fields = ['id','temple_name','address','comments','opening_balance','opening_balance_type','tax_age','documents','images','management'] 
        
    def validate_tax_age(self, tax_age):
        if tax_age and tax_age >60:
            raise serializers.ValidationError("Tax applicable age cannot be greater than 60")
        return tax_age

    def create(self, validated_data):
        management = validated_data.pop('management')
        profile_instance = ManagementDetails.objects.create(**validated_data)
        for hobby in management:
            BankDetails.objects.create(management=profile_instance,**hobby)
        return profile_instance
    
    def update(self, instance, validated_data):
            user_hobby_list = validated_data.pop('management')
            instance.temple_name = validated_data.get('temple_name', instance.temple_name)         
            instance.address = validated_data.get('address', instance.address)                 
            instance.comments = validated_data.get('comments', instance.comments)          
            instance.opening_balance = validated_data.get('opening_balance', instance.opening_balance)
            instance.opening_balance_type = validated_data.get('opening_balance_type', instance.opening_balance_type)
            instance.tax_age = validated_data.get('tax_age', instance.tax_age)
            instance.documents = validated_data.get('documents', instance.documents)
            instance.images = validated_data.get('images', instance.images)
            instance.save()
                    
            hobbies_with_same_profile_instance = BankDetails.objects.filter(management=instance.pk).values_list('id', flat=True)
            print(hobbies_with_same_profile_instance)
            
            hobbies_with_s = BankDetails.objects.filter(management=instance.pk)
            
            hobbies_id_pool = []
            for hobby in user_hobby_list:
                if "id" in hobby.keys():
                    if BankDetails.objects.filter(id=hobby['id']).exists():
                        hobby_instance = BankDetails.objects.get(id=hobby['id'])
                        check_with_collection=CollectionDetails.objects.filter(bank_link=hobby_instance)
                        
                        check_trans983=CashTransactionDetails.objects.filter(banks=hobby_instance)
                        check_trans984=CashTransactionDetails.objects.filter(banks2=hobby_instance)
                        
                        if not check_with_collection and not check_trans983 and not check_trans984:
                            hobby_instance.bank_name = hobby.get('bank_name', hobby_instance.bank_name)
                            hobby_instance.account_no = hobby.get('account_no', hobby_instance.account_no)
                            hobby_instance.ifsc = hobby.get('ifsc', hobby_instance.ifsc)
                            hobby_instance.account_holder_name = hobby.get('account_holder_name', hobby_instance.account_holder_name)
                            hobby_instance.branch_name = hobby.get('branch_name', hobby_instance.branch_name)
                            
                            hobby_instance.bank_opening_balance_amt = hobby.get('bank_opening_balance_amt', hobby_instance.bank_opening_balance_amt)
                            hobby_instance.bank_opening_balance_type = hobby.get('bank_opening_balance_type', hobby_instance.bank_opening_balance_type)
                            
                            hobby_instance.save()
                            hobbies_id_pool.append(hobby_instance.id)
                    else:
                        continue
                else:
                    hobbies_instance = BankDetails.objects.create(management=instance, **hobby)
                    hobbies_id_pool.append(hobbies_instance.id)
                    
            for hobby_id in hobbies_with_same_profile_instance:
                if hobby_id not in hobbies_id_pool:
                    h_bank=BankDetails.objects.filter(pk=hobby_id).first()
                    if h_bank:
                        check_cashtrans1=CashTransactionDetails.objects.filter(banks=h_bank)
                        check_cashtrans2=CashTransactionDetails.objects.filter(banks2=h_bank)
                        check_with_collection=CollectionDetails.objects.filter(bank_link=h_bank)
                        if not check_cashtrans1 and not check_cashtrans2 and not check_with_collection:
                            h_bank.delete()
                        # if not check_with_collection:
                        #     h_bank.delete()

            return instance
    
    
class InstructionSerializer(serializers.ModelSerializer):
    class Meta:
        model= Instructions
        fields='__all__'



class BankDetailsNewSerializer(serializers.ModelSerializer):
    # id=serializers.IntegerField(required=False)
    class Meta:
        model =BankDetails
        fields = '__all__'