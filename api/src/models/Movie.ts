import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema({
  imdbID: { type: String, unique: true },
  title: String,
  year: String,
  type: String,
  poster: String,
  director: String,
  writer: String,
  plot: String,
});

export default mongoose.model("Movie", MovieSchema);
