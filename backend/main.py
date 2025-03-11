from fastapi import FastAPI, HTTPException, Cookie, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
import psycopg2
from hashlib import sha256
from models import Reciept, RecieptItem, UserInfo, DataPoint
from pydantic import BaseModel

app = FastAPI()

origins = [
  "http://localhost:5173"
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)

connection = psycopg2.connect(database="postgres", user="YOUR_USERNAME", password="YOUR_PASSWORD", host="localhost", port=5432)

def detectExists(query, data):
  cursor = connection.cursor()
  cursor.execute(query,data)
  record = cursor.fetchone()
  cursor.close()
  return record != None

def returnEntries(query, data):
  cursor = connection.cursor()
  cursor.execute(query, data)
  record = cursor.fetchall()
  connection.commit()
  cursor.close()
  return record

def executeOnly(query, data):
  cursor = connection.cursor()
  cursor.execute(query,data)
  record = cursor.fetchone()
  connection.commit()
  cursor.close()

def returnEntry(query, data):
  cursor = connection.cursor()
  cursor.execute(query,data)
  record = cursor.fetchone()
  connection.commit()
  cursor.close()
  return record

#User passes their username and password to logs in
@app.post("/login/", status_code=200)
async def login(user:UserInfo, response:Response):
  sql_query = "SELECT * FROM purchase_history.users WHERE username=%s and password=%s"
  data = (user.username, sha256(user.password.encode('utf-8')).hexdigest())
  if not detectExists(sql_query, data):
    raise HTTPException(status_code=401, detail="Invalid username or password")

  entry = returnEntry(sql_query, data)
  response.set_cookie(key="session", value=entry[0], httponly=True)
  response.set_cookie(key="loggedin",value="True")
  return { "message":"Signed In" }

#User logs out
@app.post("/logout/", status_code=200)
async def logout(user:UserInfo, response:Response):
  response.delete_cookies(key="session")
  response.delete_cookies(key="loggedin")
  return { "message":"Logged Out" }

#User passes a username and password to sign up
@app.post("/signup/")
async def signup(user:UserInfo, status_code=200):
  
  #Check if the username already exists
  sql_query ="SELECT * FROM purchase_history.users WHERE username=%s"
  data = (user.username,)
  if detectExists(sql_query, data):
    raise HTTPException(status_code=403, detail="The username already exists")
  
  #Add new user to database
  sql_insert="INSERT INTO purchase_history.users (username, password) VALUES (%s,%s) RETURNING id"
  data = (user.username, sha256(user.password.encode('utf-8')).hexdigest())
  executeOnly(sql_insert, data)

  return { "message":"Signed Up Successfully" }

#User passes a reciept to be processed
@app.post("/reciept/")
async def submit_reciept(reciept: Reciept, request: Request):
  uid = request.cookies.get('session')
  sql_check = "SELECT * FROM purchase_history.users WHERE id=%s"
  if not detectExists(sql_check, (uid,)):
    raise HTTPExcept(status_code=401, detail="Invalid user, please log in again")

  sql_check = "SELECT * FROM purchase_history.shops WHERE name=%s AND uid=%s"
  sql_get = "SELECT id FROM purchase_history.shops WHERE name=%s AND uid=%s"
  if not detectExists(sql_check, (reciept.shop.lower(), uid)):
    sql_get = "INSERT INTO purchase_history.shops (name, uid) VALUES (%s, %s) RETURNING id"
  sid = returnEntry(sql_get, (reciept.shop.lower(), uid))

  for item in reciept.items:
    print(item)
  
    sql_check = "SELECT * FROM purchase_history.category WHERE type=%s and uid=%s"
    sql_get = "SELECT id FROM purchase_history.category WHERE type=%s and uid=%s"
    if not detectExists(sql_check, (item.type.lower(), uid)):
      sql_get = "INSERT INTO purchase_history.category (type, uid) VALUES (%s, %s) RETURNING id"
    tid = returnEntry(sql_get, (item.type.lower(), uid))
  
    sql_add = "INSERT INTO purchase_history.items (tid,sid,uid,name,price,time) VALUES (%s,%s,%s,%s,%s,to_date(%s,'YYYY-MM-DD')) RETURNING id"
    returnEntry(sql_add, (tid, sid, uid, item.name.lower(),item.price,reciept.time))
  return {"message":"success"}

@app.get("/stores/")
async def retrieve_stores(request: Request, user:bool):
  uid = request.cookies.get('session')
  sql_check = "SELECT * FROM purchase_history.users WHERE id=%s"
  if not detectExists(sql_check, (uid,)):
    raise HTTPExcept(status_code=401, detail="Invalid user, please log in again")
  variables = (uid,)
  sql_get = '''SELECT name 
    FROM purchase_history.shops'''
  if user:
    variables = (uid,)
    sql_get = '''SELECT name 
      FROM purchase_history.shops
      WHERE uid=%s'''  
  entries = returnEntries(sql_get,variables)
  return entries

@app.get("/categories/")
async def retrieve_categories(request: Request, user:bool):
  uid = request.cookies.get('session')
  sql_check = "SELECT * FROM purchase_history.users WHERE id=%s"
  if not detectExists(sql_check, (uid,)):
    raise HTTPExcept(status_code=401, detail="Invalid user, please log in again")
  variables = (uid,)
  sql_get = '''SELECT type 
    FROM purchase_history.category'''
  if user:
    variables = (uid,)
    sql_get = '''SELECT type 
      FROM purchase_history.category
      WHERE uid=%s'''  
  entries = returnEntries(sql_get,variables)
  return entries

@app.get("/items/")
async def retrieve_categories(request: Request, user:bool):
  uid = request.cookies.get('session')
  sql_check = "SELECT * FROM purchase_history.users WHERE id=%s"
  if not detectExists(sql_check, (uid,)):
    raise HTTPExcept(status_code=401, detail="Invalid user, please log in again")
  variables = ()
  sql_get = '''SELECT distinct name 
    FROM purchase_history.items'''
  if user:
    variables = (uid,)
    sql_get = '''SELECT distinct name 
      FROM purchase_history.items
      WHERE uid=%s'''
  entries = returnEntries(sql_get,variables)
  return entries

#User gets a dataset from the database based on query
@app.get("/reciept/")
async def retrieve_data(request: Request, user:bool, item: str, category: str, shop: str):
  uid = request.cookies.get('session')
  print(item, category, shop)
  sql_check = "SELECT * FROM purchase_history.users WHERE id=%s"
  if not detectExists(sql_check, (uid,)):
    raise HTTPExcept(status_code=401, detail="Invalid user, please log in again")

  variables = (item.lower(),category.lower(),shop.lower())
  sql_get = '''SELECT purchase_history.items.time, purchase_history.items.price, 
  purchase_history.items.name, purchase_history.category.type, purchase_history.shops.name 
    FROM purchase_history.items
	    JOIN purchase_history.category ON purchase_history.items.tid=purchase_history.category.id
	    JOIN purchase_history.shops ON purchase_history.items.sid=purchase_history.shops.id
      WHERE purchase_history.items.name LIKE %s AND purchase_history.category.type LIKE %s AND purchase_history.shops.name LIKE %s'''
  if user:
    print("user is true")
    variables = (item.lower(),category.lower(),shop.lower(),uid)
    sql_get = '''SELECT purchase_history.items.time, purchase_history.items.price, 
      purchase_history.items.name, purchase_history.category.type, purchase_history.shops.name 
        FROM purchase_history.items
  	    JOIN purchase_history.category ON purchase_history.items.tid=purchase_history.category.id
	      JOIN purchase_history.shops ON purchase_history.items.sid=purchase_history.shops.id
        WHERE purchase_history.items.name LIKE %s AND purchase_history.category.type LIKE %s 
        AND purchase_history.shops.name LIKE %s AND purchase_history.items.uid = %s'''
  entries = returnEntries(sql_get,variables)
  retVal = []
  for entry in entries:
    retVal.append(DataPoint(name=entry[2],time=entry[0].strftime('%Y-%m-%d'),price=entry[1],type=entry[3],shop=entry[4]))
  print(retVal)
  return retVal
