import { useEffect, useState } from "react";
import StarRating from "./StarRating";
const KEY = "a1a363d";
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectMovie(id) {
    setSelectedId(id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(watchedMovie) {
    setWatched((watched) => [...watched, watchedMovie]);
    setSelectedId(null);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
          );
          if (!res.ok) throw new Error("Something Went Wrong!");
          const data = await res.json();
          if (data.Response === "False")
            throw new Error("We Coludn't Found The Movie");
          setMovies(data.Search);
        } catch (err) {
          console.error(err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
        if (query.length < 3) {
          setMovies([]);
          setError("");
        }
      }
      handleCloseMovie();
      fetchMovies();
    },
    [query]
  );

  useEffect(function(){
    function callback(e){
      if(e.code === 'Escape'){
        handleCloseMovie();
      }

      document.addEventListener('keydown' , callback)

      return function(){
        document.removeEventListener('keydown')
      }
    }
  }, [])

  return (
    <div>
      <Header />
      <SearchInput query={query} setQuery={setQuery} />
      <div className="main-containers">
        <SearchResults
          movies={movies}
          isLoading={isLoading}
          error={error}
          onSelectMovie={handleSelectMovie}
        />
        <div className="right-pane">
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              onCloseMovie={handleCloseMovie}
              onAddToWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <Stats watched={watched}/>
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="loader">
      <div className="cell d-0"></div>
      <div className="cell d-1"></div>
      <div className="cell d-2"></div>
      <div className="cell d-1"></div>
      <div className="cell d-2"></div>
      <div className="cell d-2"></div>
      <div className="cell d-3"></div>
      <div className="cell d-3"></div>
      <div className="cell d-4"></div>
    </div>
  );
}

function Error({ message }) {
  return <p>{message}</p>;
}

function Header() {
  return (
    <div className="header">
      <h1>Cinema Scoop</h1>
      <p>Your personal movie companion</p>
    </div>
  );
}

function SearchInput({ query, setQuery }) {
  return (
    <form>
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..."
        />
        <button className="s-btn">Search</button>
      </div>
    </form>
  );
}

function SearchResults({ movies, isLoading, error, onSelectMovie }) {
  return (
    <div className="search-results-container">
      <h2>Search Results</h2>
      {isLoading && <Loader />}
      {!isLoading && !error && movies?.length > 0 ? (
        <ul className="movies-list custom-scrollbar">
          {movies.map((movie) => (
            <Movie
              movie={movie}
              key={movie.imdbID}
              onSelectMovie={onSelectMovie}
            />
          ))}
        </ul>
      ) : (
        <p>Start Searching For Movies To See Results</p>
      )}
      {error && <Error message={error} />}
    </div>
  );
}

function Stats({watched}) {
  const imdbRating = watched.map(movie => movie.imdbRating).reduce((acc , cur) => acc + cur , 0).toFixed(2) / watched.length || 0
  const userRating = watched.map(movie => movie.userRating).reduce((acc , cur) => acc + cur , 0).toFixed(2) / watched.length || 0
  const minutes = watched.map(movie => Number(movie.runtime)).reduce((acc , cur) => acc + cur , 0) || 0
  return (
    <div className="stats-container">
      <h2>Your Stats</h2>
      <div className="stats-small-containers">
        {/* First */}
        <div className="stat-container">
          <img src="movie.svg" alt="movie" />
          <span>{watched.length}</span>
          <p>Movies</p>
        </div>
        {/* Second */}
        <div className="stat-container">
          <img src="imdbstar.svg" alt="imdbStar" />
          <span>{imdbRating}</span>
          <p>Imdb Rating</p>
        </div>
        {/* Third */}
        <div className="stat-container">
          <img src="userstar.svg" alt="userStar" />
          <span>{userRating}</span>
          <p>Your Rating</p>
        </div>
        {/* Fourth */}
        <div className="stat-container">
          <img src="minutes.svg" alt="Minutes" />
          <span>{minutes}</span>
          <p>Minutes</p>
        </div>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <div className="watched-movies-container">
      <h2>Your Watched Movies</h2>
      {watched.length === 0 ? (
        <p>Your Watched List Is Empty. Start Adding Movies!</p>
      ) : (
        <ul>
          {watched.map((movie) => (
            <WatchedMovie
              movie={movie}
              key={movie.imdbID}
              onDeleteWatched={onDeleteWatched}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li className="watched-movie-container">
      <img src={movie.poster} alt={movie.title} />
      <div className="watched-movie-info">
        <h2>{movie.title}</h2>
        <p>{movie.year}</p>
        <div className="runtime-info">
          <span>⭐ {movie.imdbRating}</span>
          <span>🌟 {movie.userRating}</span>
          <span>⏱️ {movie.runtime} Min</span>
        </div>
      </div>
      <button
        className="btn-delete"
        onClick={() => onDeleteWatched(movie.imdbID)}
      >
        X
      </button>
    </li>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li className="movie-card" onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={movie.Title} />
      <div className="movie-info">
        <h3>{movie.Title}</h3>
        <span>{movie.Year}</span>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddToWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      imdbRating: Number(movie.imdbRating),
      runtime: Number(movie.Runtime.split(" ")[0]), 
      userRating,
    };
    onAddToWatched(newWatchedMovie);
  }

  function handleRating(rating) {
    setUserRating(rating);
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        console.log(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(function(){
    if(!movie.Title) return;
    document.title = `Movie | ${movie.Title}`
    return function(){
      document.title = "Cinema Scoop"
    }
  }, [movie.Title])

  const watchedMovie = watched.find((movie) => movie.imdbID === selectedId);
  const watchedUserRating = watchedMovie?.userRating;

  return isLoading ? (
    <Loader />
  ) : (
    <div
      className="movie-details-container"
      style={{ position: "relative", paddingBottom: "50px" }}
    >
      <button className="close-btn" onClick={onCloseMovie}>
        ×
      </button>
      <img src={movie.Poster} alt={movie.Title} />
      <div className="movie-details">
        <h2>{movie.Title}</h2>
        <div className="date-info">
          <span>{movie.Released}</span>
          <span>{movie.Runtime}</span>
        </div>
        <p className="category">{movie.Genre}</p>
        <div className="rating">
          <span className="rate">⭐ {movie.imdbRating}</span>
          <a
            href={`https://www.imdb.com/title/${selectedId}/?ref_=nv_sr_srsg_0_tt_6_nm_2_in_0_q_gam`}
            target="_blank"
            rel="noopener noreferrer"
          >
            IMDB
          </a>
        </div>
        <p className="summary">{movie.Plot}</p>
        <p>Starring: {movie.Actors} </p>
        <p>Directed By: {movie.Director} </p>
      </div>
      <div className="star-rating-container">
        {isWatched ? (
          <p>You Rated This Movie {watchedUserRating}⭐</p>
        ) : (
          <>
            <StarRating maxRating={10} onSetRating={handleRating} />
            {userRating > 0 && (
              <button className="addWatched-btn" onClick={handleAdd}>
                + Add to Watched
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
