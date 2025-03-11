from pydantic import BaseModel
from typing import List;

class RecieptItem(BaseModel):
  name: str
  type: str
  price: float

class Reciept(BaseModel):
  shop: str
  time: str
  items: List[RecieptItem]

class UserInfo(BaseModel):
  username: str
  password: str

class DataPoint(BaseModel):
  name: str
  type: str
  price: float
  shop: str
  time: str