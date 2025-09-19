# RedMatrix Notes App

A simple full‑stack notes app.
- Backend: Spring Boot 3 (Java 17, JPA, MySQL)
- Frontend: React + Vite

## Prerequisites
- IntelliJ IDEA (Community or Ultimate)
- Java 17 SDK configured in IntelliJ
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

## 2) Open in IntelliJ
1. File → Open → select the project root (`RedMatrixNotesApp`).
2. Trust the project when prompted.
3. Ensure IntelliJ uses at least JDK 17 (File → Project Structure → Project SDK).
4. Maven should auto‑import the backend. If not, open `backend/pom.xml` and click “Load Maven Changes”.
5. (Optional) Install the Node.js plugin in IntelliJ for better frontend support.

## 3) Run the Backend (Spring Boot)
- In IntelliJ, open `backend/src/main/java/com/redmatrix/notesapp/BackendApplication.java` and click Run on the `main` method, or use the Maven panel to run `spring-boot:run`.
- Backend starts on `http://localhost:8080`.
- Verify DB connectivity in the run console; fix credentials if needed.

## 4) Run the Frontend (Vite + React)
From the project or IntelliJ terminal:
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

