# **pantheon_assignment**

I received an assignment from Pantheon to test my skills, and I chose to develop a simple Spring Boot application with a React-based web frontend.

---

## **1. Start the MySQL Database (Docker)**

Inside the **backend** folder (where `docker-compose.yml` is located), run:

```bash
docker-compose up -d
```

The database is created automatically with the following configuration:

- **DB name:** `chatty`
- **User:** `user`
- **Password:** `ChattyPro.2025`
- **Port:** `3306`

Verify that the database is running:

```bash
docker ps
```

---

## **2. Build the Backend Project (Maven)**

Inside the **backend** directory, run:

```bash
mvn clean install
```

---

## **3. Run the Spring Boot Backend (LOCAL profile)**

You must activate the **local** profile, otherwise Spring will not load the datasource.

Run:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The backend starts at:

**[http://localhost:8080](http://localhost:8080)**

---

# **Frontend – React**

The frontend is built using **Vite + React**.

---

## **1. Install Dependencies**

Inside the **frontend** folder, run:

```bash
npm install
```

---

## **2. Start the Development Server**

```bash
npm run dev
```

The frontend starts at:

**[http://localhost:5173](http://localhost:5173)**

---
