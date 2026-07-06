import { useState,useEffect ,useRef  } from 'react';
import './App.css';
import useDebounce from './useDebounce';
import { Heart, Star } from 'lucide-react';
import { Routes, Route, Link } from 'react-router-dom';
import Favorites from './Favorites';
import SkeletonCard from './SkeletonCard';

function App(){
  
const [movies, setMovies] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const [favorites, setFavorites] = useState(() => {
  const stored = localStorage.getItem('favorites');
  return stored ? JSON.parse(stored) : [];
});
const debouncedSearchTerm = useDebounce(searchTerm, 500);
const [moodInput, setMoodInput] = useState('');
const [page, setPage] = useState(1);
const observerRef = useRef(null);

useEffect(() => {
  
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`;
  fetch(url)
  .then((response) => response.json())
  .then((data) => {
    setMovies((prevMovies) => {
      const newMovies = data.results.filter(
        (movie) => !prevMovies.some((m) => m.id === movie.id)
      );
      return [...prevMovies, ...newMovies];
    });
    setIsLoading(false);
  });
}, [page]);

function searchMovies() {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchTerm}&language=en-US&page=1`;
  fetch(url)
  .then((response) => response.json())
  .then((data) => {
    setMovies(data.results);
    setIsLoading(false);

  });
}

useEffect(() => {
  if (debouncedSearchTerm) {
    searchMovies();
  }
}, [debouncedSearchTerm]);

useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setPage((prevPage) => prevPage + 1);
    }
  });

  if (observerRef.current) {
    observer.observe(observerRef.current);
  }

  return () => {
    if (observerRef.current) {
      observer.unobserve(observerRef.current);
    }
  };
}, [isLoading]);

useEffect(() => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}, [favorites]);

function toggleFavorite(movie) {
  setFavorites((prevFavorites) => {
    const alreadyFavorited = prevFavorites.some((m) => m.id === movie.id);
    if (alreadyFavorited) {
      return prevFavorites.filter((m) => m.id !== movie.id);
    } else {
      return [...prevFavorites, movie];
    }
  });
}

async function findMoodMovie() {
  setIsLoading(true);
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: `Based on this mood or context: "${moodInput}", suggest exactly ONE real movie title that fits. Respond with ONLY the movie title, nothing else — no explanation, no quotes, no punctuation.`,
        },
      ],
    }),
  });

  const data = await response.json();
  const movieTitle = data.choices[0].message.content.trim();
  const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;
  const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${movieTitle}&language=en-US&page=1`;
  const tmdbResponse = await fetch(tmdbUrl);
  const tmdbData = await tmdbResponse.json();
  setMovies(tmdbData.results);
  setIsLoading(false);
}



return (
  <div>
    <nav className="app-nav">
      <span className="logo">CineStream</span>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/favorites">Favorites ({favorites.length})</Link>
      </div>
    </nav>

    <Routes>
      <Route
        path="/"
        element={
          <>
          <div className="hero-header">
            <h1 className="main-title">CineStream</h1>
            <p className="tagline">Explore thousands of movies in seconds</p>
            <div className="search-input-row">
              <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Start typing to explore..."
              className="main-search"
              />
              <button onClick={searchMovies}>Search</button>
            </div>
          </div>
          <div className="mood-box">
            <h2>Movie Mood AI </h2>
            <p className="mood-subtitle">Find the perfect movie for your mood</p>
            <div className="mood-input-row">
              <input
              type="text"
              value={moodInput}
              onChange={(e) => setMoodInput(e.target.value)}
              placeholder="e.g. Romantic, Adventure, etc."
              />
              <button onClick={findMoodMovie}>Find My Movie</button>
            </div>
          </div>
          {movies.length > 0 && (
            <div className="hero"
            style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movies[0].backdrop_path})`,
            }}
            >
              <div className="hero-content">
                <h1>{movies[0].title}</h1>
                <p>{movies[0].overview}</p>
              </div>
            </div>
          )}
            {isLoading ? (
              <div className="movie-grid">
                {Array.from({ length: 10 }).map((_, index) => (
                  <SkeletonCard key={index} />
                  ))}
              </div>
            ) : (
              <div className="movie-grid">
                {movies.map((movie) => {
                  const posterUrl = movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : 'https://placehold.co/500x750?text=No+Poster';
                  const year = movie.release_date.slice(0, 4);
                  const isFavorited = favorites.some((m) => m.id === movie.id);
                  return (
                    <div key={movie.id} className="movie-card">
                      <img src={posterUrl} alt={movie.title} loading="lazy" />
                      <h3>{movie.title}</h3>
                      <p>{year}</p>
                      <p className="rating">
                        <Star size={14} fill="#f5c518" color="#f5c518" />
                        {movie.vote_average.toFixed(1)}
                      </p>
                      <button className="favorite-btn" onClick={() => toggleFavorite(movie)}>
                        <Heart size={20} fill={isFavorited ? 'red' : 'none'} color="red" />
                      </button>
                    </div>
                  );
                })}
                <div ref={observerRef} style={{ height: '20px' }}></div>
              </div>
            )}
          </>
        }
      />
      <Route path="/favorites" element={<Favorites favorites={favorites} />} />
    </Routes>
  </div>
);

}
export default App;