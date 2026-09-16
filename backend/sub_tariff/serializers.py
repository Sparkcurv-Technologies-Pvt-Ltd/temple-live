from rest_framework import serializers
from .models import ADDSubscriptionTariffDetails
from django.utils import timezone
from datetime import datetime

class ADDSubscriptionTariffDetailseSerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model =ADDSubscriptionTariffDetails
        fields = '__all__'
        
    def validate_from_date(self, from_date):
        # date_r=self.instance.created_at        
        # from_date_obj = datetime.strftime(date_r, "%Y-%m-%d") 
        if self.instance is None:
            if from_date and from_date < timezone.now().date():
                raise serializers.ValidationError("From date cannot be less than today's date.")
            return from_date
        else:
            
            date_r=self.instance.from_date  
            print("ooooooooooooooo")
            data_initial=self.initial_data['from_date'] 
            data_initial_obj=  datetime.strptime(data_initial, "%Y-%m-%d")  
            # from_date_obj = datetime.strftime(date_r, "%Y-%m-%d")  
            print(date_r) 
            print(data_initial_obj)         
            print((data_initial))
            print(type(date_r)) 
            print(type(data_initial_obj)) 
            print("yyyyyyyyyyyyyyyyyyyy")   
            print(data_initial_obj.date())  
            if data_initial_obj.date()==date_r:
                return from_date             
            else:                
                if from_date:
                    print(type(from_date))                    
                    if from_date < datetime.now().date():
                        print("ooooooooo")
                        raise serializers.ValidationError("From date cannot be less than today's date.")
                return from_date  
      
    def validate(self, data):
        print("kkkkkk")
        print(data)
        from_date=data.get("from_date")
        print(type(from_date))
        to_date=data.get("to_date")
        print(type(to_date))

        print(data)
        
        if to_date <= from_date:
                print("hnnnnnnnnnnn")
                raise serializers.ValidationError("To date cannot be less than or equal to start date.")

        # Percentage guard – Exception & Penalty must not exceed 100 % when
        # their respective type flag is set to "Percentage".
        exp_type = data.get("exp_amount_type") or (
            getattr(self.instance, "exp_amount_type", None) if self.instance else None
        )
        exp_value = data.get("exp_amount")
        if exp_value is None and self.instance is not None:
            exp_value = getattr(self.instance, "exp_amount", None)
        if exp_type == "Percentage" and exp_value is not None and float(exp_value) > 100:
            raise serializers.ValidationError({
                "exp_amount": "Exception percentage cannot exceed 100%.",
            })

        pen_type = data.get("penalty_amount_type") or (
            getattr(self.instance, "penalty_amount_type", None) if self.instance else None
        )
        pen_value = data.get("penalty_amt")
        if pen_value is None and self.instance is not None:
            pen_value = getattr(self.instance, "penalty_amt", None)
        if pen_type == "Percentage" and pen_value is not None and float(pen_value) > 100:
            raise serializers.ValidationError({
                "penalty_amt": "Penalty percentage cannot exceed 100%.",
            })
        return data
    
    def validate_to_date(self, to_date):        
            print(type(to_date))    
            print(datetime.now().date())   
            if to_date and to_date < (datetime.now().date()):
                raise serializers.ValidationError("To date cannot be less than today's date.")
            return to_date
      
    