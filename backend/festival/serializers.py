from rest_framework import serializers
from .models import ADDFestivalDetails
from django.utils import timezone
from management.models import ManagementDetails
from datetime import datetime

def fes_no():
    l=ADDFestivalDetails.objects.last()
    if l:
        l=l.id   
    else:
        l=0      
    l=l+1

    return ("FESL" '%01d' % l)

class ADDFestivalDetailsSerializer(serializers.ModelSerializer):
    action = serializers.BooleanField(default=True)
    class Meta:
        model =ADDFestivalDetails
        fields = '__all__'
        
        
    def validate_start_date(self, start_date):
        print("jjjjjj")
        if self.instance is None: 
            if start_date and start_date < (datetime.now().date()):
                print("ooooooooo")
                raise serializers.ValidationError("Start date cannot be less than today's date.")
            return start_date
        else: 

            date_r=self.instance.start_date  
            print("ooooooooooooooo")
            data_initial=self.initial_data['start_date'] 
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
                return start_date             
            else:                
                if start_date:
                    print(type(start_date))                    
                    if start_date < datetime.now().date():
                        print("ooooooooo")
                        raise serializers.ValidationError("Start date cannot be less than today's date.")
                return start_date
               
    
    
    # def validate_end_date(self, end_date):
    #         print("uuuuuuuuu")
        
    #     # if self.instance is None:
    #         if end_date and end_date <= timezone.now().date():
    #             print("eeeeeee")
    #             raise serializers.ValidationError("End date cannot be less than today's date.")
    #         return end_date
        # else:
        #     date_r=self.instance.created_at
        #     end_date_obj = datetime.strftime(date_r, "%Y-%m-%d") 
        #     end_date=self.initial_data['end_date']            
        #     if end_date==end_date_obj:
        #         return end_date 
        #     else:
        #         raise serializers.ValidationError("Start date cannot be less than created date.")
    
    
    def validate(self, data):
        print("kkkkkk")
        print(data)
        start_date=data.get("start_date")
        print(start_date)
        end_date=data.get("end_date")
        print(data)
        
        if end_date <= start_date:
                print("hnnnnnnnnnnn")
                raise serializers.ValidationError("End date cannot be less than or equal to start date.")

        # Guard: Percentage-mode penalty cannot exceed 100 %.
        choice = data.get("choice")
        if choice is None and self.instance is not None:
            choice = self.instance.choice
        penalty_amt = data.get("penalty_amt")
        if penalty_amt is None and self.instance is not None:
            penalty_amt = self.instance.penalty_amt
        if choice == "Percentage" and penalty_amt is not None and float(penalty_amt) > 100:
            raise serializers.ValidationError({
                "penalty_amt": "Penalty percentage cannot exceed 100%.",
            })

        return data
    
    def create(self, validated_data):
        print("kmjjjjjjjjjjjjjj")
        profile_instance = ADDFestivalDetails.objects.create(festival_no=fes_no(),**validated_data) 
        print("ooooooooooooo")              
        return profile_instance