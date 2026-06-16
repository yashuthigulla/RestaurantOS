from app.database import SessionLocal
from app.models import (
    User,
    Outlet,
    MenuItem,
    Expense,
    Revenue,
    Order,
    OrderItem,
    Bill
)
from app.utils.security import hash_password
from datetime import datetime, timedelta
import random

db = SessionLocal()

print("Seeding data...")


# --------------------
# USERS
# --------------------

owner = db.query(User).filter(
    User.email == "yash@gmail.com"
).first()

cashier = db.query(User).filter(
    User.email == "cashier@gmail.com"
).first()

if not owner:
    owner = User(
        full_name="Yashwanth Goud",
        email="yash@gmail.com",
        password=hash_password("123456"),
        role="owner"
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)

if not cashier:
    cashier = User(
        full_name="Cashier User",
        email="cashier@gmail.com",
        password=hash_password("123456"),
        role="cashier"
    )
    db.add(cashier)
    db.commit()
    db.refresh(cashier)

# --------------------
# OUTLETS
# --------------------

outlet1 = Outlet(
    name="Hyderabad Central Kitchen",
    location="Madhapur",
    owner_id=owner.id
)

outlet2 = Outlet(
    name="Vijayawada Food Court",
    location="Benz Circle",
    owner_id=owner.id
)

db.add_all([outlet1, outlet2])
db.commit()

db.refresh(outlet1)
db.refresh(outlet2)

# --------------------
# MENU ITEMS
# --------------------

menu_items = [
    ("Chicken Biryani", 250, "Biryani"),
    ("Mutton Biryani", 320, "Biryani"),
    ("Paneer Biryani", 220, "Biryani"),
    ("Veg Fried Rice", 180, "Rice"),
    ("Chicken Fried Rice", 220, "Rice"),
    ("Butter Naan", 40, "Bread"),
    ("Butter Chicken", 280, "Curry"),
    ("Paneer Butter Masala", 240, "Curry"),
    ("Masala Dosa", 120, "Breakfast"),
    ("Idli", 60, "Breakfast"),
    ("Vada", 50, "Breakfast"),
    ("Tea", 20, "Beverages"),
    ("Coffee", 30, "Beverages"),
    ("Lassi", 70, "Beverages"),
    ("Coke", 40, "Beverages"),
]

created_items = []

for name, price, category in menu_items:
    item = MenuItem(
        name=name,
        price=price,
        category=category,
        outlet_id=random.choice([outlet1.id, outlet2.id])
    )

    db.add(item)
    created_items.append(item)

db.commit()


# --------------------
# EXPENSES - MONTHLY DATA
# --------------------

monthly_expenses = [
    ("Rent", 25000),
    ("Electricity", 8500),
    ("Ingredients", 45000),
    ("Packaging", 6000),
    ("Staff Salary", 55000),
    ("Marketing", 12000),
    ("Maintenance", 7000),
]

for month in range(6):
    expense_date = datetime.now() - timedelta(days=30 * month)

    for title, base_amount in monthly_expenses:
        amount = base_amount + random.randint(-3000, 5000)

        db.add(
            Expense(
                title=title,
                amount=amount,
                category=title,
                outlet_id=random.choice([outlet1.id, outlet2.id]),
                date=expense_date,
                created_at=expense_date
            )
        )

db.commit()

# --------------------
# ORDERS - 6 MONTH REALISTIC DATA
# --------------------

revenue_sources = [
    "POS",
    "Swiggy",
    "Zomato",
    "Dine-In",
    "Takeaway"
]

payment_methods = [
    "Cash",
    "UPI",
    "Card"
]

start_date = datetime.now() - timedelta(days=180)

for day in range(180):
    current_date = start_date + timedelta(days=day)

    # Weekends slightly more busy
    if current_date.weekday() in [5, 6]:
        daily_orders = random.randint(10, 18)
    else:
        daily_orders = random.randint(5, 12)

    for _ in range(daily_orders):
        outlet_id = random.choice([outlet1.id, outlet2.id])
        payment_method = random.choice(payment_methods)

        order = Order(
            payment_method=payment_method,
            status="completed",
            outlet_id=outlet_id,
            total_amount=0,
            created_at=current_date
        )

        db.add(order)
        db.commit()
        db.refresh(order)

        total = 0

        for _ in range(random.randint(1, 4)):
            item = random.choice(db.query(MenuItem).all())
            qty = random.randint(1, 3)
            subtotal = item.price * qty
            total += subtotal

            db.add(
                OrderItem(
                    order_id=order.id,
                    menu_item_id=item.id,
                    quantity=qty,
                    subtotal=subtotal
                )
            )

        order.total_amount = total
        db.commit()

        db.add(
            Revenue(
                title=f"Order #{order.id}",
                amount=total,
                source=random.choice(revenue_sources),
                payment_method=payment_method,
                outlet_id=outlet_id,
                created_at=current_date,
                date=current_date
            )
        )

        subtotal = total
        discount = round(subtotal * random.choice([0, 0.03, 0.05, 0.1]), 2)
        taxable = subtotal - discount
        cgst = round(taxable * 0.025, 2)
        sgst = round(taxable * 0.025, 2)
        final_total = round(taxable + cgst + sgst, 2)

        db.add(
            Bill(
                order_id=order.id,
                subtotal=subtotal,
                discount=discount,
                cgst=cgst,
                sgst=sgst,
                total_amount=final_total,
                created_at=current_date
            )
        )

        db.commit()




print("Seed data created successfully!")