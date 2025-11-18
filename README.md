# RedMatrix Notes App

A full‑stack notes app with an auditable Cardano Preview Testnet trail for every note action.
- Backend: Spring Boot 3 (Java 17, JPA, MySQL) — REST API + blockchain proof storage (`backend/`)
- Frontend: React + Vite — wallet flow + Blockfrost integration (`frontend/`)

The UI never stores private keys. Signing always happens inside a CIP-30 compatible wallet (Lace, Nami, Eternl, ...). The backend only persists the business data plus the blockchain proof (`content_hash`, `last_tx_hash`).

---

## Blockchain Overview

| Actor | Responsibilities |
|-------|------------------|
| React/Vite frontend | Generates SHA-256 content hash, prepares metadata, connects to wallet, asks wallet to sign, submits signed TX through Blockfrost, sends note + `txHash` + `contentHash` to backend |
| Spring Boot backend | Stores note, `owner_wallet`, `content_hash`, and `last_tx_hash` in MySQL; exposes CRUD APIs used by the UI |
| Cardano blockchain | Holds immutable metadata for CREATE/UPDATE/DELETE actions (no note content) |

All blockchain activity runs against the **Cardano Preview Testnet** using Blockfrost.

<!-- Prerequisites -->

## Prerequisites

Before installing the project, make sure you have the following installed on your system:

### Required Downloads:
1. **Java 17 SDK**
   - Download from: [Oracle JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) or [OpenJDK 17](https://adoptium.net/)
   - Verify installation: `java -version`

2. **Node.js 18+ and npm**
   - Download from: [Node.js Official Website](https://nodejs.org/)
   - Verify installation: `node -v` and `npm -v`

3. **MySQL 8+**
   - Download from: [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
   - Verify installation: `mysql --version`

4. **Maven** (if not using IDE)
   - Download from: [Apache Maven](https://maven.apache.org/download.cgi)
   - Verify installation: `mvn -version`

5. **IDE** (Choose one):
   - [IntelliJ IDEA Community or Ultimate](https://www.jetbrains.com/idea/download/) (Recommended)
   - you can get free license for Ultimate [here](https://www.jetbrains.com/community/education/#students)
   - [VS Code](https://code.visualstudio.com/download) with Java extensions

### Cardano Testnet Tooling:
1. **Wallet extension** — Lace (recommended) or any CIP-30 wallet switched to the **Preview Testnet**
2. **Blockfrost Project ID** — create a Preview project at [Blockfrost.io](https://blockfrost.io/)
3. **Test ADA** — fund your wallet via the [Cardano faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/) (keep ~5 ADA for fees)

<!-- Project Installation -->

## Installation

### Download the Repository

1. Clone the repository to your local directory using one of the following methods:
   - **Command Line:**
     ```bash
     git clone https://github.com/pawekz/RedMatrix-App.git
     ```
   - **VS Code (User Interface):**
     1. Open VS Code.
     2. Go to the Source Control panel (or use `Ctrl+Shift+G`).
     3. Click "Clone Repository" and enter your repository URL (https://github.com/pawekz/RedMatrix-App.git).
     4. Select a local folder to clone into.
   - **IntelliJ IDEA (User Interface):**
     1. Open IntelliJ IDEA.
     2. On the Welcome screen, click "Get from VCS".
     3. Paste your repository URL (https://github.com/pawekz/RedMatrix-App.git) and choose a directory.
     4. Click "Clone".

2. Navigate to the project directory:
    ```bash
    cd RedMatrixNotesApp
    ```

### Database Setup

1. Start MySQL locally and create the database:
    ```sql
    CREATE DATABASE IF NOT EXISTS redmatrix_notes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```
2. Update database credentials in `backend/src/main/resources/application.properties` if needed:
    ```properties
    spring.datasource.username=root
    spring.datasource.password=root
    ```

### Installing the Backend (Spring Boot)

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install the dependencies using Maven:
    ```bash
    mvn clean install
    ```
3. Start the backend server:
    ```bash
    mvn spring-boot:run
    ```
4. The backend should now be running at [http://localhost:8080/](http://localhost:8080/).

When running locally, the backend schema auto-creates tables defined in `backend/src/main/resources/schema.sql` and seeds optional demo data from `data.sql`.

### Installing the Frontend (ReactJS)

1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2. Install the dependencies using npm:
    ```bash
    npm install
    ```
3. Start the frontend development server:
    ```bash
    npm run dev
    ```
4. The frontend should now be running at [http://localhost:5173/](http://localhost:5173/).

> **Tip:** keep backend and frontend running together for the full blockchain experience. The UI will block C/U/D actions until a wallet is connected.

<br>

Congratulations! You have successfully set up the RedMatrix Notes App project on your local machine (running both Frontend and Backend).

<!-- Configuration -->

## Configuration (Optional)

### Backend Configuration
Edit: `backend/src/main/resources/application.properties`
```properties
# Example customizations
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/redmatrix_notes
```

The `Note` entity (`backend/src/main/java/com/redmatrix/notesapp/entity/Note.java`) already contains `ownerWallet`, `contentHash`, and `lastTxHash` fields used for on-chain verification. No extra backend setup is needed beyond database credentials.

> **IntelliJ tip:** this project already expects environment variables named `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` (see `application.properties`). Open **Run/Debug Configurations → Modify options → Environment variables** and define those keys there so IntelliJ injects the secrets without hardcoding them.

### Frontend Configuration  
Create: `frontend/.env`
```env
VITE_API_URL=http://localhost:8080
VITE_BLOCKFROST_PROJECT_ID=your_preview_project_id
```

- `VITE_API_URL` defaults to the deployed backend but should be pointed to your local instance for development.
- `VITE_BLOCKFROST_PROJECT_ID` is required for submitting signed transactions inside `frontend/src/services/blockchainService.js`.

> **IntelliJ tip:** if you prefer IntelliJ to inject secrets, set **Environment variables** in your Vite run configuration (e.g., define only `VITE_BLOCKFROST_PROJECT_ID` if that is the value you keep outside `.env`).

Restart `npm run dev` after editing `.env`.

<!-- Troubleshooting -->

## Troubleshooting

| Issue | Solution |
|-------|----------|
| ❌ Cannot connect to DB | Ensure MySQL is running, credentials match, and `redmatrix_notes` database exists |
| ❌ Port conflicts | Change `server.port` in backend properties or Vite dev server port via `vite.config.js` |
| ❌ Maven/Java version | Confirm Project SDK is Java 17 and reload Maven |
| ❌ Extensions not working (VS Code) | Reload VS Code window: `Ctrl+Shift+P` → `Developer: Reload Window` |
| ❌ No wallets detected | Install Lace/Nami/Eternl, refresh the app, and confirm the wallet is on Preview Testnet |
| ❌ Transaction failed | Verify you still have test ADA, the wallet is unlocked, and your Blockfrost key targets Preview |
| ❌ Note actions stuck | The UI requires a connected wallet before calling backend APIs |

---

**Note:** This project currently serves frontend and backend separately. If you want Spring Boot to serve the built frontend, configure static resources (e.g., copy `frontend/dist` to `backend/src/main/resources/static` during build or use a reverse proxy).

---

## Cardano Workflow (Preview Testnet)

1. **User action** — create/update/delete inside `frontend/src/components/NotePad.jsx` or `NotesGrid.jsx`.
2. **Hashing** — the UI computes `contentHash = SHA256(content)` before any network calls.
3. **Wallet signing** — `frontend/src/hooks/useWallet.js` requests a CIP-30 wallet connection, then asks it to sign metadata describing the action.
4. **Blockfrost submission** — the signed bytes are POSTed to Blockfrost `/tx/submit` using `VITE_BLOCKFROST_PROJECT_ID`; Blockfrost returns the final `txHash`.
5. **API call** — the frontend sends the note payload + `contentHash` + `txHash` to `backend/src/main/java/com/redmatrix/notesapp/controller/NoteController.java`.
6. **Persistence** — `NoteService` persists the record, storing the blockchain proof for later audits.

No PII lives on-chain. The Cardano metadata (label `674`) looks like:

```json
{
    "674": {
        "msg": ["CREATE"],
        "noteId": "12",
        "contentHash": "a39f92bf12...",
        "owner": "addr1...",
        "timestamp": "1731891234567"
    }
}
```

During incident response you can verify integrity by comparing `content_hash` (database) with the hash embedded in the Cardano transaction.

---

## Security & Privacy Notes

- Wallet ownership and signing remain inside the browser extension; the backend never touches private keys.
- Only hashes and metadata are public. Note titles/content stay in MySQL.
- Tamper detection: if a note changes outside the app, its recomputed hash will no longer match the on-chain record, signaling integrity issues.
