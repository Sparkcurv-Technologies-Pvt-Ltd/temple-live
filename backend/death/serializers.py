from rest_framework import serializers
from .models import DeathDetails
from django.utils import timezone

def death_no():
    l=DeathDetails.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1
    return ("DEATH" '%01d' % l)

class DeathDetailsSerializer(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    documents=serializers.FileField(required=False)
    action = serializers.BooleanField(default=True)
    photo=serializers.ImageField(required=False)
    class Meta:
        model =DeathDetails
        fields = '__all__'

    def validate(self, data):
        # Percentage cap – tariff_peanalty must not exceed 100 % when
        # pen_amt_type is "Percentage".
        pen_type = data.get("pen_amt_type") or (
            getattr(self.instance, "pen_amt_type", None) if self.instance else None
        )
        tariff = data.get("tariff_peanalty")
        if tariff is None and self.instance is not None:
            tariff = getattr(self.instance, "tariff_peanalty", None)
        if pen_type == "Percentage" and tariff is not None and float(tariff) > 100:
            raise serializers.ValidationError({
                "tariff_peanalty": "Tariff penalty percentage cannot exceed 100%.",
            })
        return data


    def validate_penalty_apply_date(self, penalty_apply_date):
        if self.instance is None: 
            if penalty_apply_date  <= timezone.now().date():
                raise serializers.ValidationError("Penalty date cannot be less than or equal to today's date.")
            return penalty_apply_date
        else:
            if penalty_apply_date:
                penalty_apply_date3=penalty_apply_date
                print(type(penalty_apply_date3))
                penalty_apply_date2=self.instance.penalty_apply_date
                print(type(penalty_apply_date2))
                
                if penalty_apply_date3==penalty_apply_date2:
                    penalty_apply_date=penalty_apply_date2
                else:
                    if penalty_apply_date3<penalty_apply_date2: 
                        if penalty_apply_date3== timezone.now().date(): 
                            penalty_apply_date=penalty_apply_date2
                            # raise serializers.ValidationError("Penalty date cannot be less than or equal to today's date.")
                        elif penalty_apply_date3<timezone.now().date():
                            penalty_apply_date=penalty_apply_date2
                        elif penalty_apply_date3>timezone.now().date():
                            penalty_apply_date=penalty_apply_date3
                            # raise serializers.ValidationError("Penalty date cannot be less than or equal to today's date.") 
                    else:
                        penalty_apply_date=penalty_apply_date3      

                # penalty_apply_date=self.instance.penalty_apply_date
                return penalty_apply_date  
    

    def validate_death_date(self, death_date):
        print(death_date)
        if death_date > timezone.now().date():
            raise serializers.ValidationError("Death date cannot be greater than today")
        # if death_date.month != timezone.now().month and death_date.year == timezone.now().year:
        #     raise serializers.ValidationError("Death date cannot be added other than this month")
        # elif death_date.month == timezone.now().month and death_date.year != timezone.now().year:
        #     raise serializers.ValidationError("Death date cannot be added other than this month")
        # elif death_date.month != timezone.now().month and death_date.year != timezone.now().year:
        #     raise serializers.ValidationError("Death date cannot be added other than this month")        
        return death_date
    
    def create(self, validated_data):
        profile_instance = DeathDetails.objects.create(death_no=death_no(),**validated_data)               
        return profile_instance

class DeathDetailsSerializer45(serializers.ModelSerializer):
    id=serializers.IntegerField(required=False)
    documents=serializers.FileField(required=False)
    photo=serializers.ImageField(required=False)
    class Meta:
        model =DeathDetails
        fields = '__all__'
        
    def validate_death_date(self, death_date):
        print(death_date)
        if death_date and death_date > timezone.now().date():
            raise serializers.ValidationError("Death date cannot be greater than today")      
        return death_date