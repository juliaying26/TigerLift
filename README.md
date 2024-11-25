# TigerLift - Fall 2024 COS 333 Project

Julia Ying, Grace Kim, Ritika Bhatnagar, Aasha Jain

### Setting up

- Create `.env` with our env variables (database, secret key, email info)
- Create `.env` in the `frontend` folder with the Google API key
- `cd backend`, activate your COS333 virtual environment, and `pip install -r requirements.txt`
- `cd frontend`, and run `npm install`.
- To run the application, make two terminals:
  - Make sure you are in `backend` and run `python app.py`
  - Make sure you are in `frontend` and run `npm run dev`
- Navigate to http://localhost:5173/ to view application. (Backend runs on http://localhost:3100/)

### Deploying

- `cd frontend` and run `npm run build`. This will create a `dist` folder in `frontend`.
- Commit that new `dist` folder.
- Go to Render and Manual Deploy using that latest commit.
- Navigate to https://tigerlift.onrender.com/.
