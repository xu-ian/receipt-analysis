# Receipt Analysis and Storage Website
Website that records receipts and analyzes price trends in receipts.

# Prerequisites
- Node.js, Python 3.0+, Postgresql, and FastAPI must be installed on your system
- Run `database_setup.sql` in Postgresql to setup the database.
- Call `npm install` in the frontend folder to install all the required packages.
- Replace `YOUR_PASSWORD` and `YOUR_USERNAME` with your postgresql password and username in `backend/main.py`.

# Features
- Manually input the receipt or upload a photo of the receipt and submit the receipt to add the data.   
- View analysis of receipt data, allowing users to see price trends over time and by store.

# Running the application
- In the `backend` folder, run `fastapi run main.py`.
- In the `frontend` folder, run `npm run dev`.