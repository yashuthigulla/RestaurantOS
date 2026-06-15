from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MenuItem, Outlet
from app.schemas import MenuItemCreate
from app.utils.auth_dependency import get_current_user
from app.utils.auth_dependency import require_owner

router = APIRouter()


@router.post("/")
def create_menu_item(
    item: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_owner)
):
    outlet = db.query(Outlet).filter(
        Outlet.id == item.outlet_id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

    if not outlet:
        raise HTTPException(
            status_code=404,
            detail="Outlet not found or not owned by user"
        )

    new_item = MenuItem(
        name=item.name,
        price=item.price,
        category=item.category,
        outlet_id=item.outlet_id
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


@router.get("/")
def get_menu_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    items = db.query(MenuItem).all()
    return items


@router.delete("/{id}")
def delete_menu_item(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_owner)
):
    item = db.query(MenuItem).join(Outlet).filter(
        MenuItem.id == id,
        MenuItem.outlet_id == Outlet.id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    db.delete(item)
    db.commit()

    return {"message": "Menu item deleted successfully"}