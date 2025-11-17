# pantheon_assignment

I received assignment from Pantheon to test my skills and I chose to develop a simple Spring boot application with react as a web

---

## **1. Spustenie MySQL databázy (Docker)**

V priečinku **backend** (kde je `docker-compose.yml`) spusti:

```bash
docker-compose up -d
```

Databáza sa vytvorí automaticky s týmito údajmi:

- **DB name:** `chatty`
- **User:** `user`
- **Password:** `ChattyPro.2025`
- **Port:** `3306`

Overenie, že databáza beží:

```bash
docker ps
```

---

## **2. Build projektu (Maven)**

V priečinku **backend** spusti:

```bash
mvn clean install
```

---

## **3. Spustenie Spring Boot backendu (LOCAL profil)**

Je potrebné aktivovať **local** profil, inak Spring nenačíta databázu.

Spusti:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Backend sa spustí na:

**[http://localhost:8080](http://localhost:8080)**
