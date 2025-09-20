# RedMatrix Notes App

A simple full‑stack notes app.
- Backend: Spring Boot 3 (Java 17, JPA, MySQL)
- Frontend: React + Vite

## Prerequisites
- **IDE**: IntelliJ IDEA (Community or Ultimate) OR VS Code
- Java 17 SDK
- Node.js 18+ and npm
- MySQL 8+ running locally

## 1) Database Setup (MySQL)
1. Start MySQL locally and create the database:
```sql
CREATE DATABASE IF NOT EXISTS redmatrix_notes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
2. Default backend credentials are in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/redmatrix_notes
spring.datasource.username=root
spring.datasource.password=root
```
- If your MySQL user/password differ, update those values accordingly.
- Schema is created/updated automatically via `spring.jpa.hibernate.ddl-auto=update`.

## 2) IDE Setup

### Option A: IntelliJ IDEA
1. File → Open → select the project root (`RedMatrixNotesApp`).
2. Trust the project when prompted.
3. Ensure IntelliJ uses at least JDK 17 (File → Project Structure → Project SDK).
4. Maven should auto‑import the backend. If not, open `backend/pom.xml` and click "Load Maven Changes".
5. (Optional) Install the Node.js plugin in IntelliJ for better frontend support.

### Option B: VS Code
1. Open VS Code and select File → Open Folder → choose the project root (`RedMatrixNotesApp`).
2. Install recommended extensions when prompted, or manually install:
   - **Extension Pack for Java** (includes Language Support, Debugger, Test Runner, Maven, Project Manager)
   - **Spring Boot Extension Pack** (Spring Boot Tools, Spring Initializr, Spring Boot Dashboard)
   - **ES7+ React/Redux/React-Native snippets** (for frontend development)
   - **Prettier - Code formatter** (optional, for code formatting)
3. Configure Java 17:
   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Run "Java: Configure Java Runtime"
   - Set Java 17 as the project JDK
4. VS Code should auto-detect the Maven project structure in the `backend` folder.

## 3) Run the Backend (Spring Boot)
### IntelliJ IDEA:
- Open `backend/src/main/java/com/redmatrix/notesapp/BackendApplication.java` and click Run on the `main` method, or use the Maven panel to run `spring-boot:run`.

### VS Code:
- Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run "Spring Boot Dashboard: Refresh"
- In the Spring Boot Dashboard panel, click the play button next to your app, or
- Use the integrated terminal: `cd backend && mvn spring-boot:run`

- Backend starts on `http://localhost:8080`.
- Verify DB connectivity in the run console; fix credentials if needed.

## 4) Run the Frontend (Vite + React)
From the integrated terminal (IntelliJ/VS Code) or system terminal (CMD):
```bash
cd frontend
npm install
npm run dev
```
- Open the printed URL (typically `http://localhost:5173`).


Note: This project currently serves frontend and backend separately. If you want Spring Boot to serve the built frontend, configure static resources (e.g., copy `frontend/dist` to `backend/src/main/resources/static` during build or use a reverse proxy).

## Configuration
- Backend properties: `backend/src/main/resources/application.properties`
- Frontend env (optional): create `frontend/.env` for Vite variables (e.g., `VITE_API_URL=http://localhost:8080`).

## Troubleshooting
- Cannot connect to DB: ensure MySQL is running, credentials match, and `redmatrix_notes` exists.
- Port conflicts: change `server.port` in backend properties or Vite dev server port via `vite.config.js`.
- Maven/Java version: confirm Project SDK is Java 17 and reload Maven.

