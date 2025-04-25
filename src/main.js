
// Elementos del DOM
const searchInput = document.getElementById('search-input');
const characterList = document.getElementById('character-list');
const messageElement = document.getElementById('message');
const clearSearchButton = document.getElementById('clear-search');
const modal = document.getElementById('modal');
const closeModalButton = document.getElementById('close-modal');
document.addEventListener('DOMContentLoaded', () => {
  fetchCharacters(); // Cargar personajes al iniciar
});

let currentPage = 1; // Página actual
let totalPages = 1; // Total de páginas
let characters = []; // Almacena todos los personajes cargados
const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// URL de la API
const API_URL = 'https://rickandmortyapi.com/api/character/';

// Función para cargar personajes con paginación
async function fetchCharacters(page = 1) {
  try {
    showLoadingSpinner();
    const response = await fetch(`${API_URL}?page=${page}`);
    if (!response.ok) throw new Error('Error al cargar los personajes');
    const data = await response.json();

    characters = data.results;
    displayCharacters(characters);

    currentPage = page;
    totalPages = data.info.pages || 1;

    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
    document.getElementById('page-info').textContent = `Página ${currentPage} de ${totalPages}`;
  } catch (error) {
    console.error(error);
    messageElement.textContent = 'ERROR AL CARGAR LOS PERSONAJES. POR FAVOR, INTENTA NUEVAMENTE.';
    messageElement.style.display = 'block';
  } finally {
    hideLoadingSpinner();
  }
}
// Eventos para los botones de paginación
document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) {
    fetchCharacters(currentPage - 1);
  }
});

document.getElementById('next-page').addEventListener('click', () => {
  if (currentPage < totalPages) {
    fetchCharacters(currentPage + 1);
  }
});

// Función para mostrar personajes
function displayCharacters(characters) {
  characterList.innerHTML = '';
  if (characters.length === 0) {
    messageElement.textContent = 'No se encontraron personajes.';
    messageElement.style.display = 'block';
    return;
  }
  messageElement.style.display = 'none';

  characters.forEach(character => {
    const card = document.createElement('div');
    card.classList.add('character-card');
    card.innerHTML = `
      <img src="${character.image}" alt="${character.name}">
      <h3>${character.name}</h3>
      <p>Especie: ${character.species}</p>
      <button class="favorite-btn">${favorites.includes(character.name) ? '❤️' : '🤍'}</button>
    `;
    characterList.appendChild(card);
  });
}

// Función para filtrar personajes por múltiples criterios
function filterCharactersByCriteria(query, species, status, gender) {
  let filtered = characters;

  if (query.trim() !== '') {
    filtered = filtered.filter(character =>
      character.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  if (species) {
    filtered = filtered.filter(character => character.species === species);
  }

  if (status) {
    filtered = filtered.filter(character => character.status === status);
  }

  if (gender) {
    filtered = filtered.filter(character => character.gender === gender);
  }

  displayCharacters(filtered);
}

// Evento de búsqueda en tiempo real
searchInput.addEventListener('input', (event) => {
  const query = event.target.value;
  filterCharactersByCriteria(
    query,
    document.getElementById('species-filter').value,
    document.getElementById('status-filter').value,
    document.getElementById('gender-filter').value
  );
});

// Eventos para los filtros
document.getElementById('species-filter').addEventListener('change', (event) => {
  filterCharactersByCriteria(
    searchInput.value,
    event.target.value,
    document.getElementById('status-filter').value,
    document.getElementById('gender-filter').value
  );
});

document.getElementById('status-filter').addEventListener('change', (event) => {
  filterCharactersByCriteria(
    searchInput.value,
    document.getElementById('species-filter').value,
    event.target.value,
    document.getElementById('gender-filter').value
  );
});

document.getElementById('gender-filter').addEventListener('change', (event) => {
  filterCharactersByCriteria(
    searchInput.value,
    document.getElementById('species-filter').value,
    document.getElementById('status-filter').value,
    event.target.value
  );
});

// Función para limpiar la búsqueda
function clearSearch() {
  searchInput.value = '';
  document.getElementById('species-filter').value = '';
  document.getElementById('status-filter').value = '';
  document.getElementById('gender-filter').value = '';
  fetchCharacters(); // Volver a cargar todos los personajes
}

// Evento para el botón "Limpiar Búsqueda"
clearSearchButton.addEventListener('click', clearSearch);

// Mostrar detalles del personaje en el modal
function showCharacterDetails(character) {
  const modal = document.getElementById('modal');
  modal.style.display = 'flex';

  
  document.getElementById('modal-name').textContent = character.name;
  document.getElementById('modal-image').src = character.image;
  document.getElementById('modal-species').textContent = character.species;
  document.getElementById('modal-status').textContent = character.status;
  document.getElementById('modal-gender').textContent = character.gender;
  document.getElementById('modal-location').textContent = character.location.name;
}

// Evento para cerrar el modal
document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('modal').style.display = 'none';
});

// Abrir el modal al hacer clic en una tarjeta
characterList.addEventListener('click', (event) => {
  const card = event.target.closest('.character-card');
  if (card) {
    const name = card.querySelector('h3').textContent;
    const character = characters.find(c => c.name === name);
    showCharacterDetails(character);
  }
});

// Función para agregar/quitar favoritos
function toggleFavorite(name) {
  if (favorites.includes(name)) {
    favorites.splice(favorites.indexOf(name), 1);
  } else {
    favorites.push(name);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  displayCharacters(characters); 
}

// Evento para manejar favoritos
characterList.addEventListener('click', (event) => {
  if (event.target.classList.contains('favorite-btn')) {
    const name = event.target.closest('.character-card').querySelector('h3').textContent;
    toggleFavorite(name);
  }
});

// Ordenar personajes
document.getElementById('sort-by').addEventListener('change', (event) => {
  const sortBy = event.target.value;
  let sortedCharacters = [...characters];

  if (sortBy === 'name-asc') {
    sortedCharacters.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'name-desc') {
    sortedCharacters.sort((a, b) => b.name.localeCompare(a.name));
  }

  displayCharacters(sortedCharacters);
});

// Búsqueda por episodios
document.getElementById('episode-search').addEventListener('change', async (event) => {
  const episodeId = event.target.value;
  if (!episodeId) return;

  try {
    // Limpiar mensajes previos
    messageElement.textContent = '';
    messageElement.style.display = 'none';

    // Realizar la solicitud a la API
    const response = await fetch(`https://rickandmortyapi.com/api/episode/${episodeId}`);
    if (!response.ok) throw new Error('Episodio no encontrado');

    const episode = await response.json();
    const charactersData = await Promise.all(
      episode.characters.map(url => fetch(url).then(res => res.json()))
    );

    // Actualizar la variable global `characters`
    characters = charactersData;

    // Mostrar los personajes del episodio
    displayCharacters(characters);
  } catch (error) {
    console.error(error);

    // Mostrar mensaje de error solo si hay un problema
    messageElement.textContent = 'Error al buscar personajes por episodio.';
    messageElement.style.display = 'block';
  }
});

//Evento para cargar episodios
async function loadEpisodes() {
  try {
    const response = await fetch('https://rickandmortyapi.com/api/episode');
    if (!response.ok) throw new Error('Error al cargar los episodios');
    const data = await response.json();

    const episodeSelect = document.getElementById('episode-search');
    data.results.forEach(episode => {
      const option = document.createElement('option');
      option.value = episode.id; // ID del episodio
      option.textContent = `${episode.episode} - ${episode.name}`; 
      episodeSelect.appendChild(option);
    });
    episodeSelect.value = '';
  } catch (error) {
    console.error(error);
    messageElement.textContent = 'Error al cargar los episodios.';
    messageElement.style.display = 'block';
  }
}

// Cargar episodios al iniciar
loadEpisodes();


// Animación de carga
function showLoadingSpinner() {
  characterList.innerHTML = '<div class="loading-spinner"></div>';
}

function hideLoadingSpinner() {
  const spinner = document.querySelector('.loading-spinner');
  if (spinner) spinner.remove(); 
}

// Cargar personajes al iniciar
fetchCharacters();