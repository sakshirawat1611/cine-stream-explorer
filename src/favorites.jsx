function Favorites({ favorites }) {
  if (favorites.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
        <p style={{ fontSize: '18px' }}>No favorites yet</p>
        <p style={{ fontSize: '14px' }}>Tap the heart icon on any movie to save it here.</p>
      </div>
    );
  }
  return (
    <div className="movie-grid">
      {favorites.map((movie) => {
        const posterUrl = movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'https://placehold.co/500x750?text=No+Poster';
        const year = movie.release_date.slice(0, 4);
        return (
          <div key={movie.id} className="movie-card">
            <img src={posterUrl} alt={movie.title} loading="lazy" />
            <h3>{movie.title}</h3>
            <p>{year}</p>
            <p>{movie.vote_average.toFixed(1)}</p>
          </div>
        );
      })}
    </div>
  );
}

export default Favorites;