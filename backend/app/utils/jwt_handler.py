import jwt
from datetime import datetime, timedelta

SECRET_KEY = "restaurantos-secret-key"
ALGORITHM = "HS256"

# def create_access_token(data: dict):
#     to_encode = data.copy()

#     # expire = datetime.utcnow() + timedelta(hours=1)
#     expire = datetime.utcnow() + timedelta(days=7)


#     to_encode.update({"exp": expire})

#     return jwt.encode(
#         to_encode,
#         SECRET_KEY,
#         algorithm=ALGORITHM
#     )


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt