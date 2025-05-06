"use client";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useGetMovieQuery } from "./api/hooks/use-get-movies-query";
import { MovieType } from "./api/endpoints";
import debounce from "lodash.debounce";
import { useSyncMovieQuery } from "./api/hooks/use-sync-movies-query";

const Home = () => {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const { data: movieData, isPending: isLoading, refetch } = useGetMovieQuery(query);
  const { refetch: syncRefetch } = useSyncMovieQuery();

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setQuery(value);
      void refetch();
    }, 1000),
    [debounce]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleBtnPress = () => {
    void syncRefetch().then(() => void refetch());
  }

  useEffect(() => {
    return () => {
      debouncedSearch.cancel(); // cleanup debounce on unmount
    };
  }, [debouncedSearch]);

  return (
    <main className="w-full p-10">
      <div className="flex flex-col">
        <h2 className="my-4 font-bold">Welcome to our movie database</h2>
        <div className="flex flex-row items-center">
          <input
            type="text"
            value={search}
            suppressHydrationWarning
            onChange={handleChange}
            className="flex-grow rounded-[8px] border border-gray-400 py-3 px-4 outline-none"
            placeholder="Search to start..."
          />
          <button
            onClick={() => handleBtnPress()}
            className="cursor-pointer bg-gray-900 rounded-[8px] w-fit border mx-2 py-3 px-4">
            <span className="text-white">Sync DB</span>
          </button>
        </div>
        {isLoading ?
          <p className="mt-4">Fetching data...</p> :
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {movieData?.map((movie: MovieType) => {
              return (
                <div
                  key={movie.imdbID}
                  className="bg-white rounded-xl overflow-hidden">
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    width={320}
                    height={320}
                    className="w-full h-80 object-contain"
                  />
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold">{movie.title}</h3>
                    <p className="text-sm text-gray-600">{movie.director}</p>
                  </div>
                </div>
              )
            })}
          </div>
        }
      </div>
    </main>
  )
}

export default Home;
