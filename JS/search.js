const API_KEY = '4f914d881bdc09c47a4587b5a0a2c6c7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentQuery = '';
let isLoading = false;

async function searchMovies(query, page) {
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=fr-FR`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function createResultCard(movie) {
    let posterUrl = null;
    if (movie.poster_path) {
        posterUrl = IMAGE_URL + movie.poster_path;
    }

    let posterHTML = '';
    if (posterUrl) {
        posterHTML = `<img src="${posterUrl}" alt="${movie.title}" class="movie-poster">`;
    } else {
        posterHTML = `
            <div class="no-poster">
                <img src="assets/film_indispo.jpg">
            </div>
        `;
    }

    return `
        <article class="movie-card">
            <div class="movie-poster-box">
                ${posterHTML}
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <a href="movie.html?id=${movie.id}" class="movie-link">En savoir plus</a>
            </div>
        </article>
    `;
}


function displayResults(movies, append) {
    const grid = document.getElementById('results-grid');
    const moviesHTML = movies.map(movie => createResultCard(movie)).join('');
    
    if (append) {
        grid.insertAdjacentHTML('beforeend', moviesHTML);
    } else {
        grid.innerHTML = moviesHTML;
    }
}

async function performSearch(query, page, append) {
    if (isLoading) return;
    
    if (!query.trim()) {
        document.getElementById('results-grid').innerHTML = '';
        document.getElementById('no-results').classList.remove('show');
        document.getElementById('load-more-container').style.display = 'none';
        return;
    }
    
    isLoading = true;
    
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');
    const loadMoreContainer = document.getElementById('load-more-container');
    const btn = document.getElementById('load-more-btn');
    
    loading.classList.add('show');
    noResults.classList.remove('show');
    btn.disabled = true;
    
    try {
        const data = await searchMovies(query, page);
        
        if (data.results.length === 0 && page === 1) {
            document.getElementById('results-grid').innerHTML = '';
            noResults.classList.add('show');
            loadMoreContainer.style.display = 'none';
        } else {
            displayResults(data.results, append);
            
            if (page < data.total_pages && data.results.length > 0) {
                loadMoreContainer.style.display = 'block';
            } else {
                loadMoreContainer.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la recherche');
    } finally {
        isLoading = false;
        loading.classList.remove('show');
        btn.disabled = false;
    }
}

document.getElementById('search-input').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    currentPage = 1;
    currentQuery = query;
    
    performSearch(query, 1, false);
});

document.getElementById('load-more-btn').addEventListener('click', () => {
    currentPage++;
    performSearch(currentQuery, currentPage, true);
});