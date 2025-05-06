import express from "express";
import movieRoutes from "./routes/movie.routes";
import bodyParser from "body-parser";
import cors from "cors";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/api/v1/movies", movieRoutes);

app.get("/", (_, res) => {
  res.send("[SEVER]: Server is up and running...");
});
