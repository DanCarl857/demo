"use client";
import React from "react";
import { useGetMovieQuery } from "./api/hooks/use-get-movies-query";
import { MovieType } from "./api/endpoints";

const Home = () => {
  const { data: movieData, isPending: isLoading } = useGetMovieQuery("");

  console.log(movieData);

  if (isLoading) {
    return (
      <div>
        <p>Fetching data...</p>
      </div>
    )
  }

  return (
    <main className="w-full p-10">
      <div className="flex flex-col">
        <h2 className="my-4 font-bold">Welcome to our movie database</h2>
        <input
          type="text"
          className="w-[100%] border border-gray-400 py-3 px-4 outline-none"
          placeholder="Search to start..."
        />

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {movieData.map((movie: MovieType) => {
            return (
              <div
                key={movie.imdbID}
                className="bg-white rounded-xl overflow-hidden "
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-80 object-contain"
                />
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold">{movie.title}</h3>
                  <p className="text-sm text-gray-600">{movie.writer}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

export default Home;
