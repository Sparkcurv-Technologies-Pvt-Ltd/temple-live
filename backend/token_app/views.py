from rest_framework.response import Response
import jwt
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from user.models import User

from rest_framework.decorators import api_view

def token_checking(request):
    token=request.headers.get('Authorization')
    if not token:
        raise AuthenticationFailed('Unauthenticated!')
    try:
        payload=jwt.decode(token,'secret',algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Unauthenticated!')
    except Exception:
        return None
    user=User.objects.filter(id=payload['id']).first()
    if not user:
        return None
    if not user.is_active:
        return None
    return user


import datetime
@api_view(['POST'])
def generate_token(request):
    if request.method == "POST":
        try:
            token1 = request.data['refresh']
            decoded_token = jwt.decode(token1, options={"verify_signature": False})
            iat_ts = decoded_token.get('iat')
            if iat_ts:
                issued_at = datetime.datetime.utcfromtimestamp(int(iat_ts))
                if datetime.datetime.utcnow() - issued_at > datetime.timedelta(hours=8):
                    return Response(
                        {'error': 'Session has exceeded the 8-hour limit. Please log in again.'},
                        status=status.HTTP_401_UNAUTHORIZED,
                    )
            user_id = decoded_token.get('id')
            user = User.objects.filter(id=user_id).first()
            if user:
                payload = {
                    "id": user.id,
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8),
                    "iat": datetime.datetime.utcnow(),
                }
                token = jwt.encode(payload,'secret',algorithm='HS256')
                response=Response()
                response.data = {
                    'jwt': token,
                    'username': user.name,
                    'email':user.email,
                }
                return response
            else:
                return Response(status=status.HTTP_404_NOT_FOUND)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Expired token'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            print(str(e))
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
