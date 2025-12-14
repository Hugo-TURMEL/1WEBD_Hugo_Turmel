const API_KEY = '4f914d881bdc09c47a4587b5a0a2c6c7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let isLoading = false;

async function getTrendingMovies(page) {
    const url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}&language=fr-FR`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function createMovieCard(movie) {
    const posterUrl = movie.poster_path ? `${IMAGE_URL}${movie.poster_path}` : null;
    const overview = movie.overview || 'Aucun résumé disponible.';
    
    // Coupe le résumé si c'est trop long
    let shortOverview = overview;
    if (overview.length > 150) {
        shortOverview = overview.substring(0, 150) + '...';
    }
    
    return `
        <article class="movie-card">
            <div class="movie-poster-box">
                ${posterUrl 
                    ? `<img src="${posterUrl}" alt="${movie.title}" class="movie-poster">`
                    : `<div class="no-poster"><img src="assets/film_indispo.jpg"></div>`
                }
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-overview">${shortOverview}</p>
                <a href="movie.html?id=${movie.id}" class="movie-link">En savoir plus</a>
            </div>
        </article>
    `;
}

function displayMovies(movies) {
    const grid = document.getElementById('movies-grid');

    const moviesHTML = movies.map(movie => createMovieCard(movie)).join('');

    grid.insertAdjacentHTML('beforeend', moviesHTML);
}

async function loadMovies(page) {
    if (isLoading) return;

    isLoading = true;
    
    const loading = document.getElementById('loading');
    const btn = document.getElementById('load-more-btn');
    
    loading.classList.add('show');
    btn.disabled = true;
    
    try {
        const data = await getTrendingMovies(page);

        displayMovies(data.results);
        
        if (page >= data.total_pages) {
            btn.style.display = 'none';
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des films');
    } finally {
        isLoading = false;
        loading.classList.remove('show');
        btn.disabled = false;
    }
}

document.getElementById('load-more-btn').addEventListener('click', () => {
    currentPage++;
    loadMovies(currentPage);
});

loadMovies(currentPage);