from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OutletCreate(BaseModel):
    name: str
    location: str    

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    outlet_id: int    

class RevenueCreate(BaseModel):
    title: str
    amount: float
    source: str
    payment_method: str
    outlet_id: int    

class OrderCreate(BaseModel):
    total_amount: float
    payment_method: str
    status: str
    outlet_id: int    

class MenuItemCreate(BaseModel):
    name: str
    price: float
    category: str
    outlet_id: int


class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int


class OrderCreate(BaseModel):
    outlet_id: int
    payment_method: str
    items: list[OrderItemCreate]    

class BillCreate(BaseModel):
    order_id: int
    discount: float = 0    