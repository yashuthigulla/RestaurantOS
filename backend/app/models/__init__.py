from sqlalchemy import Column, Float, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime


from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="owner")
    created_at = Column(DateTime, default=datetime.utcnow)

    outlets = relationship("Outlet", back_populates="owner")


class Outlet(Base):
    __tablename__ = "outlets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(150), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="outlets")
    expenses = relationship("Expense", back_populates="outlet")
    revenues = relationship("Revenue", back_populates="outlet")
    orders = relationship("Order",back_populates="outlet")
    menu_items = relationship("MenuItem", back_populates="outlet")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    outlet_id = Column(Integer, ForeignKey("outlets.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    outlet = relationship("Outlet", back_populates="expenses")    

class Revenue(Base):
    __tablename__ = "revenues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    source = Column(String(50), nullable=True)
    outlet_id = Column(Integer, ForeignKey("outlets.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    payment_method = Column(String(50), nullable=True)
    date = Column(DateTime, default=datetime.utcnow)

    outlet = relationship("Outlet", back_populates="revenues")    

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    total_amount = Column(Float, default=0)
    payment_method = Column(String(50), nullable=False)
    status = Column(String(50), default="pending")
    outlet_id = Column(Integer, ForeignKey("outlets.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    outlet = relationship("Outlet", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String(50), nullable=True)
    outlet_id = Column(Integer, ForeignKey("outlets.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    outlet = relationship("Outlet", back_populates="menu_items")    

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    quantity = Column(Integer, nullable=False)
    subtotal = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem")    

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    subtotal = Column(Float, nullable=False)
    discount = Column(Float, default=0)
    cgst = Column(Float, default=0)
    sgst = Column(Float, default=0)
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)    