from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import  Order, OrderItem, MenuItem, Outlet, Revenue
from app.schemas import OrderCreate
from app.utils.auth_dependency import get_current_user



router = APIRouter()


def apply_owner_scope(query, current_user):
    if current_user["role"] == "owner":
        return query.filter(Outlet.owner_id == current_user["user_id"])

    return query


@router.post("/")
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    outlet_query = db.query(Outlet).filter(Outlet.id == order.outlet_id)
    outlet = apply_owner_scope(outlet_query, current_user).first()

    if not outlet:
        raise HTTPException(
            status_code=404,
            detail="Outlet not found"
        )

    new_order = Order(
        payment_method=order.payment_method,
        status="pending",
        outlet_id=order.outlet_id,
        total_amount=0
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    total_amount = 0

    for item in order.items:

        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item.menu_item_id
        ).first()

        if not menu_item:
            raise HTTPException(
                status_code=404,
                detail=f"Menu item {item.menu_item_id} not found"
            )

        subtotal = menu_item.price * item.quantity

        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=menu_item.id,
            quantity=item.quantity,
            subtotal=subtotal
        )

        db.add(order_item)

        total_amount += subtotal

    new_order.total_amount = total_amount

    db.commit()
    db.refresh(new_order)

    return {
        "message": "Order created successfully",
        "order_id": new_order.id,
        "total_amount": new_order.total_amount
    }


@router.get("/")
def get_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Order).join(Outlet)
    orders = apply_owner_scope(query, current_user).all()

    return orders

@router.get("/summary")
def get_order_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    base_query = db.query(Order).join(Outlet)

    total_orders = apply_owner_scope(base_query, current_user).count()

    pending_orders = apply_owner_scope(
        base_query.filter(Order.status == "pending"),
        current_user
    ).count()

    completed_orders = apply_owner_scope(
        base_query.filter(Order.status == "completed"),
        current_user
    ).count()

    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders
    }    


@router.get("/top-selling-items")
def get_top_selling_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(
        MenuItem.name,
        func.sum(OrderItem.quantity).label("total_quantity"),
        func.sum(OrderItem.subtotal).label("total_sales")
    ).join(
        OrderItem,
        OrderItem.menu_item_id == MenuItem.id
    ).join(
        Order,
        Order.id == OrderItem.order_id
    ).join(
        Outlet,
        Outlet.id == Order.outlet_id
    )

    items = apply_owner_scope(query, current_user).group_by(
        MenuItem.name
    ).order_by(
        func.sum(OrderItem.quantity).desc()
    ).limit(5).all()

    return [
        {
            "item_name": item.name,
            "total_quantity": item.total_quantity,
            "total_sales": item.total_sales
        }
        for item in items
    ]


@router.get("/{id}")
def get_order_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Order).join(Outlet).filter(
        Order.id == id,
        Order.outlet_id == Outlet.id
    )

    order = apply_owner_scope(query, current_user).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return order

@router.get("/{id}/items")
def get_order_items(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Order).join(Outlet).filter(Order.id == id)
    order = apply_owner_scope(query, current_user).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    items = db.query(
        OrderItem.id,
        MenuItem.name,
        MenuItem.price,
        OrderItem.quantity,
        OrderItem.subtotal
    ).join(
        MenuItem,
        MenuItem.id == OrderItem.menu_item_id
    ).filter(
        OrderItem.order_id == id
    ).all()

    return [
        {
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "quantity": item.quantity,
            "subtotal": item.subtotal
        }
        for item in items
    ]


@router.put("/{id}")
def update_order_by_id(
    id: int,
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Order).join(Outlet).filter(
        Order.id == id,
        Order.outlet_id == Outlet.id
    )

    order = apply_owner_scope(query, current_user).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    order.total_amount = order_data.total_amount
    order.payment_method = order_data.payment_method
    order.status = order_data.status
    order.outlet_id = order_data.outlet_id

    db.commit()
    db.refresh(order)

    return order


@router.delete("/{id}")
def delete_order_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Order).join(Outlet).filter(
        Order.id == id,
        Order.outlet_id == Outlet.id
    )

    order = apply_owner_scope(query, current_user).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    db.delete(order)
    db.commit()

    return {
        "message": "Order deleted successfully"
    }

@router.put("/{id}/complete")
def complete_order(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Order).join(Outlet).filter(
        Order.id == id,
        Order.outlet_id == Outlet.id
    )

    order = apply_owner_scope(query, current_user).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    if order.status == "completed":
        return {
            "message": "Order already completed"
        }

    order.status = "completed"

    revenue = Revenue(
        title=f"Order #{order.id}",
        amount=order.total_amount,
        source="Order",
        payment_method=order.payment_method,
        outlet_id=order.outlet_id
    )

    db.add(revenue)
    db.commit()

    return {
        "message": "Order completed successfully"
    }
