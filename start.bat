@echo off
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting CineAI server...
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
