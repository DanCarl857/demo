import express from "express";
import movieRoutes from "./routes/movie.routes";
import bodyParser from "body-parser";

export const app = express();

app.use(express.json());
app.use(bodyParser.json());

app.use("/api/v1/movies", movieRoutes);

app.get("/", (_, res) => {
  res.send("[SEVER]: Server is up and running...");
});
