# TigerLift - Fall 2024 COS 333 Project

Originally created by Julia Ying, Grace Kim, Ritika Bhatnagar, Aasha Jain

### Setting up

Ask your team lead for shared API keys and any email credentials you do not generate yourself.

**1. Download PostgreSQL**

You need Postgres for `DATABASE_URL`. Install, start it, then create the database:

```bash
brew install postgresql@16
brew services start postgresql@16
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
createdb tigerlift
```

Add the `export PATH=...` line to `~/.zshrc` so `createdb` / `psql` work in new terminals. If `createdb` says the database already exists, you are set.

Then ask your copilot (Cursor, Copilot, or any AI coding assistant) for your Postgres database URL so you can put it in `.env`. It should look like:

```bash
DATABASE_URL=postgresql://YOUR_MAC_USERNAME@localhost:5432/tigerlift
```

Use your Mac username (`whoami`) in place of `YOUR_MAC_USERNAME`.

**2. Generate a secret app key**

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**3. Create `.env` in the project root** (`TigerLift/.env`)

```bash
APP_SECRET_KEY=
DATABASE_URL=postgresql://YOUR_MAC_USERNAME@localhost:5432/tigerlift
EMAIL_ADDRESS=
EMAIL_PASSWORD=
EMAILS_ON=False
FLASK_ENV=development
```

Paste the secret from step 2 into `APP_SECRET_KEY` and the Postgres URL from step 1 into `DATABASE_URL`. Leave email blank and `EMAILS_ON=False` unless your team lead gives you credentials.

**4. Frontend `.env` (optional for now)**

Skip this for now. The servers can start without a Google API key; address autocomplete will not work until you add `frontend/.env` with `VITE_GOOGLE_API_KEY=` from your team lead.

**5. Start the servers**

Once Postgres and the root `.env` are ready, ask your copilot to start the localhost servers, or run them yourself:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

```bash
cd frontend
npm install
npm run dev
```

If `psycopg2` fails to install, run `source ~/.zshrc` and try `pip install` again. The app is at http://localhost:5173/. The backend uses http://localhost:5001/ because macOS AirPlay often takes port 5000. Princeton CAS login is still required to use the app.

### Deploying

- `cd frontend` and run `npm run build`. This will create a `dist` folder in `frontend`.
- Commit that new `dist` folder.
- Navigate to https://lift.tigerapps.org/.
