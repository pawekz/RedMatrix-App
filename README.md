# RedMatrix Notes App

A simple full‑stack notes app.
- Backend: Spring Boot 3 (Java 17, JPA, MySQL)
- Frontend: React + Vite

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

### Frontend Configuration  
Create: `frontend/.env`
```env
VITE_API_URL=http://localhost:8080
```

<!-- Troubleshooting -->

## Troubleshooting

| Issue | Solution |
|-------|----------|
| ❌ Cannot connect to DB | Ensure MySQL is running, credentials match, and `redmatrix_notes` database exists |
| ❌ Port conflicts | Change `server.port` in backend properties or Vite dev server port via `vite.config.js` |
| ❌ Maven/Java version | Confirm Project SDK is Java 17 and reload Maven |
| ❌ Extensions not working (VS Code) | Reload VS Code window: `Ctrl+Shift+P` → `Developer: Reload Window` |

---

**Note:** This project currently serves frontend and backend separately. If you want Spring Boot to serve the built frontend, configure static resources (e.g., copy `frontend/dist` to `backend/src/main/resources/static` during build or use a reverse proxy).
