const API_KEY = '4f914d881bdc09c47a4587b5a0a2c6c7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

function getMovieId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function getMovieDetails(movieId) {
    const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=fr-FR&append_to_response=credits,release_dates`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function formatDate(dateString) {
    if (!dateString) return 'Date inconnue';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function createMovieHTML(movie) {
    let backdropUrl = null;
    if (movie.backdrop_path) {
        backdropUrl = IMAGE_URL + movie.backdrop_path;
    }
    let posterUrl = null;
    if (movie.poster_path) {
        posterUrl = IMAGE_URL + movie.poster_path;
    }
    let rating = 'Pas noté';
    if (movie.vote_average) {
        rating = movie.vote_average.toFixed(1);
    }
    const releaseDate = formatDate(movie.release_date);
    
    let genresHTML = '';
    if (movie.genres && movie.genres.length > 0) {
        genresHTML = movie.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('');
    } else {
        genresHTML = '<span class="genre-tag">Non spécifié</span>';
    }
    
    let castHTML = '';

    let cast = [];
    if (movie.credits && movie.credits.cast) {
        cast = movie.credits.cast.slice(0, 8);
    }

    if (cast.length > 0) {
        castHTML = cast.map(actor => {
            let photoUrl = null;
            if (actor.profile_path) {
                photoUrl = IMAGE_URL + actor.profile_path;
            }

            let photoHTML = '';
            if (photoUrl) {
                photoHTML = `<img src="${photoUrl}" alt="${actor.name}" class="cast-photo">`;
            } else {
                photoHTML = `
                    <div class="no-poster">
                        <img src="assets/acteur_indispo.jpg">
                    </div>
                `;
            }

            return `
                <div class="cast-member">
                    <div class="cast-photo-box">
                        ${photoHTML}
                    </div>
                    <p class="cast-name">${actor.name}</p>
                    <p class="cast-character">${actor.character}</p>
                </div>
            `;
        }).join('');
    } else {
        castHTML = '<p>Aucune information sur le casting disponible.</p>';
    }

    let backdropHTML = '';
    if (backdropUrl) {
        backdropHTML = `
            <img src="${backdropUrl}" alt="${movie.title}" class="movie-backdrop">
        `;
    }

    let runtimeHTML = '';
    if (movie.runtime) {
        runtimeHTML = `
            <div class="meta-item">
                <span class="meta-label">Durée:</span>
                <span>${movie.runtime} min</span>
            </div>
        `;
    }

    let posterHTML = '';
    if (posterUrl) {
        posterHTML = `<img src="${posterUrl}" alt="${movie.title}">`;
    } else {
        posterHTML = `
            <div class="no-poster" style="
                width: 300px;
                height: 450px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--color-dark);
                border-radius: 8px;
            "><img src="assets/film_indispo.jpg"></div>
        `;
    }

    let overviewText = 'Aucun synopsis disponible.';
    if (movie.overview) {
        overviewText = movie.overview;
    }

    return `
        <div class="movie-details">
            <div class="movie-backdrop-box">
                ${backdropHTML}
            </div>

            <div class="movie-content">
                <h1 class="movie-detail-title">${movie.title}</h1>

                <div class="movie-meta">
                    <div class="meta-item">
                        <span class="meta-label">Note:</span>
                        <span class="rating">${rating}/10</span>
                    </div>

                    <div class="meta-item">
                        <span class="meta-label">Sortie cinéma:</span>
                        <span>${releaseDate}</span>
                    </div>

                    ${runtimeHTML}
                </div>

                <div class="movie-info-layout">
                    <div class="movie-poster-section">
                        ${posterHTML}
                    </div>

                    <div class="movie-text-section">
                        <h2 class="section-title">Synopsis</h2>
                        <p class="movie-description">
                            ${overviewText}
                        </p>

                        <h2 class="section-title">Genres</h2>
                        <div class="genres-list">
                            ${genresHTML}
                        </div>
                    </div>
                </div>

                <h2 class="section-title">Casting</h2>
                <div class="cast-grid">
                    ${castHTML}
                </div>

                <div style="text-align: center; margin-top: 2rem;">
                    <a href="index.html" class="btn">← Retour à l'accueil</a>
                </div>
            </div>
        </div>
    `;
}


async function loadMovieDetails() {
    const movieId = getMovieId();

    if (!movieId) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        return;
    }
    
    try {
        const movie = await getMovieDetails(movieId);

        document.getElementById('movie-details').innerHTML = createMovieHTML(movie);
        document.getElementById('loading').classList.remove('show');

        document.title = `${movie.title} - CinéPalace`;
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
    }
}

loadMovieDetails();