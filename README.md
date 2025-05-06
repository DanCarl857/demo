# Demo project

You can run this project either manually or using docker

## Prerequisites


Before running the project, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **MongoDB** (running locally or accessible via a connection string)
- **Redis** (running locally or accessible via a connection string)
- **Docker** (if running with Docker)

---

## Running the project normally

### 1. Clone the repository
```bash
git clone https://github.com/DanCarl857/demo.git
```

### 2. Ensure that you have setup environment variables in the backend

Create a `.env` file based on the `.env.local` in the root of the api project and add the following variables
```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/movies
REDIS_HOST=localhost
REDIS_PORT=6379
OMDB_API_KEY=<your-omdb-api-key>
OMDB_URL=http://www.omdbapi.com/
```

### 3. Run the backend
```bash
cd api && npm run start
```

### 4. Run the frontend
In a different terminal, run the frontend

```bash
cd frontend && npm run dev
```

## Running the project with Make and Docker
Before running this, ensure you have docker installed on your computer

### Run the project
```bash
make up
```

If you don't have make, you can use
```bash
docker-compose up --build
```

After this, app should be available in the browser at: `http://localhost:5173`

## System Design

![system design](https://github.com/user-attachments/assets/cf7e117f-a038-46f2-9cde-04262951a0ae)

