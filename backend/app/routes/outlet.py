from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Outlet
from app.schemas import OutletCreate
from app.utils.auth_dependency import get_current_user


router = APIRouter()


@router.post("/")
def create_outlet(
    outlet: OutletCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_outlet = Outlet(
        name=outlet.name,
        location=outlet.location,
        owner_id=current_user["user_id"]
    )

    db.add(new_outlet)
    db.commit()
    db.refresh(new_outlet)

    return {
        "message": "Outlet created successfully",
        "outlet_id": new_outlet.id,
        "name": new_outlet.name,
        "location": new_outlet.location
    }

@router.get("/")
def get_outlets(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    outlets = db.query(Outlet).filter(
        Outlet.owner_id == current_user["user_id"]
    ).all()


    return outlets

@router.get("/{id}")
def get_outlet_by_id(
    id:int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
   
):
    outlet = db.query(Outlet).filter(
        Outlet.id==id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

    if not outlet:
        raise HTTPException(
            status_code=404,
            detail="Outlet not found"
        )
    
    return outlet
    
@router.put("/{id}")
def update_outlet_by_id(
    id: int,
    outlet_data: OutletCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    outlet = db.query(Outlet).filter(
        Outlet.id == id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

    if not outlet:
        raise HTTPException(
            status_code=404,
            detail="Outlet not found"
        )

    outlet.name = outlet_data.name
    outlet.location = outlet_data.location

    db.commit()
    db.refresh(outlet)

    return outlet
    
@router.delete("/{id}")
def del_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    outlet = db.query(Outlet).filter(
        Outlet.id == id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

    if not outlet:
        raise HTTPException(
            status_code=404,
            detail="Outlet not found"
        )

    db.delete(outlet)
    db.commit()

    return {
        "message": "Outlet deleted successfully"
    }