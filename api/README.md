# Movie API

This project is a Movie API that allows users to search for movies and sync movie data from an external API. It uses Node.js, Express, Typescript, MongoDB, and Redis.

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **MongoDB** (running locally or accessible via a connection string)
- **Redis** (running locally or accessible via a connection string)
- **Docker** (if running with Docker)

---

## Running the Project Normally

### 1. Clone the Repository
```bash
git clone <repository-url>
cd demo/api
```

### 2. Install dependencies
```bash
npm install
```
### 3. Setup Environment variables

Create a `.env` file in the root of the api project and add the following variables
```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/movies
REDIS_HOST=localhost
REDIS_PORT=6379
OMDB_API_KEY=<your-omdb-api-key>
OMDB_URL=http://www.omdbapi.com/
```

### 4. Start MongoDB and Redis

Ensure MongoDB and Redis are running locally or accessible via the connetion strings provided in the `.env` file

### 5. Run the project
```bash
npm run start
```

## Running the Project With Docker

#### 1. Build the docker image

Run the following command to build the docker image

```bash
docker build -t movie-api .
```

#### 2. Run the docker container

Run the container with the following command

```bash
docker run -p 3000:3000 --env-file .env movie-api
```

This will star the API on `http://localhost:3000`.

## API Endpoints

#### 1. Search Movies

**GET** `/api/v1/movies/search?q=<query>`
- **Description**: Search for movies by title, director, or plot
- **Query Parameters**: `q` - The search query

#### 2. Sync Movies

**POST** `/api/v1/movies/sync`
- **Description**: Sync movie data from the OMDb API.

## Running Tests

To run the tests, use this command

```bash
npm run test
```
