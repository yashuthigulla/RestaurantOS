# import jwt
# from datetime import datetime, timedelta

# SECRET_KEY = "restaurantos-secret-key"
# ALGORITHM = "HS256"

# def create_access_token(data: dict):
#     to_encode = data.copy()

#     expire = datetime.utcnow() + timedelta(days=7)
#     to_encode.update({"exp": expire})

#     encoded_jwt = jwt.encode(
#         to_encode,
#         SECRET_KEY,
#         algorithm=ALGORITHM
#     )

#     return encoded_jwt

from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "restaurantos-secret-key"
ALGORITHM = "HS256"


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )