# Running the GigGuard Project Locally

### 1. Frontend (React Dashboard)
1. Ensure Node.js is installed.
2. Enter the folder: `cd frontend`
3. Install dependencies: `npm install`
4. Run standard Vite server: `npm run dev`

### 2. Backend (FastAPI)
1. Ensure Python 3.10+ is installed.
2. Enter the folder: `cd backend`
3. Create a virtual environment (optional but recommended): `python -m venv venv`
4. Install pip requirements: `pip install -r requirements.txt`
5. Run the server dynamically: `uvicorn app.main:app --reload`
6. View API docs: Navigate to `http://127.0.0.1:8000/docs`

### 3. ML Models
- Can be imported into Jupyter Notebooks or standard Python shells testing the placeholder functions inside `ml-models/fraud_detection.py` and `risk_assessment.py`.
