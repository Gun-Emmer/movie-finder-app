// Ganti dengan API Key yang kamu dapatkan dari OMDb API
const API_KEY = '64d656d6'; 

// Elemen DOM
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const movieGrid = document.getElementById('movie-grid');
const statusContainer = document.getElementById('status-container');
const movieModal = document.getElementById('movie-modal');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.getElementById('close-modal');

// Event Listener saat form dicari
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query !== '') {
    searchMovies(query);
  }
});

// Fungsi untuk Mencari Daftar Film dari API
async function searchMovies(query) {
  // Tampilkan Indikator Loading
  statusContainer.innerHTML = `
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent mb-2"></div>
    <p class="text-slate-400 text-sm">Mencari film "${query}"...</p>
  `;
  movieGrid.innerHTML = '';

  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.Response === "True") {
      statusContainer.innerHTML = `<p class="text-slate-400 text-sm">Menampilkan hasil untuk: <span class="text-white font-semibold">"${query}"</span></p>`;
      displayMovieList(data.Search);
    } else {
      statusContainer.innerHTML = `
        <div class="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl max-w-md mx-auto text-sm">
          ❌ ${data.Error || 'Film tidak ditemukan. Coba kata kunci lain dalam Bahasa Inggris.'}
        </div>
      `;
    }
  } catch (error) {
    statusContainer.innerHTML = `
      <div class="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl max-w-md mx-auto text-sm">
        ⚠️ Terjadi kesalahan koneksi. Silakan periksa jaringan internet kamu.
      </div>
    `;
  }
}

// Fungsi Menampilkan Grid Kartu Film
function displayMovieList(movies) {
  movieGrid.innerHTML = movies.map(movie => {
    // Penanganan jika gambar poster tidak tersedia
    const poster = (movie.Poster !== "N/A") 
      ? movie.Poster 
      : 'https://via.placeholder.com/300x450/0f172a/94a3b8?text=Poster+Tidak+Ada';

    return `
      <div class="movie-card bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group shadow-lg" onclick="getMovieDetails('${movie.imdbID}')">
        <div class="relative overflow-hidden aspect-[2/3]">
          <img 
            src="${poster}" 
            alt="${movie.Title}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
          <span class="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/50 text-rose-400 text-xs font-bold px-2.5 py-1 rounded-lg">
            ${movie.Type.toUpperCase()}
          </span>
        </div>
        <div class="p-4 flex-1 flex flex-col justify-between">
          <h3 class="font-bold text-white text-base line-clamp-1 group-hover:text-rose-400 transition">
            ${movie.Title}
          </h3>
          <div class="flex justify-between items-center mt-2 text-xs text-slate-400">
            <span>📅 ${movie.Year}</span>
            <span class="text-indigo-400 font-semibold group-hover:underline">Detail &rarr;</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Fungsi Mengambil Detail Lengkap Satu Film untuk Modal (Pop-up)
async function getMovieDetails(imdbID) {
  modalContent.innerHTML = `
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-rose-500 border-t-transparent"></div>
      <p class="text-slate-400 text-sm mt-3">Memuat detail film...</p>
    </div>
  `;
  openModal();

  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`);
    const movie = await response.json();

    const poster = (movie.Poster !== "N/A") 
      ? movie.Poster 
      : 'https://via.placeholder.com/300x450/0f172a/94a3b8?text=Poster+Tidak+Ada';

    modalContent.innerHTML = `
      <div class="flex flex-col md:flex-row gap-6 items-start">
        <img src="${poster}" alt="${movie.Title}" class="w-full md:w-1/3 rounded-2xl shadow-xl object-cover border border-slate-800" />
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
              ⭐ ${movie.imdbRating} / 10
            </span>
            <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">
              ${movie.Rated}
            </span>
            <span class="text-slate-400 text-xs">${movie.Runtime}</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">${movie.Title}</h2>
          <p class="text-xs text-rose-400 font-semibold mb-4">${movie.Genre} • ${movie.Released}</p>

          <div class="mb-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Ringkasan cerita</h4>
            <p class="text-slate-300 text-sm leading-relaxed">${movie.Plot}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div><span class="text-slate-400">Sutradara:</span> <p class="text-white font-medium">${movie.Director}</p></div>
            <div><span class="text-slate-400">Penulis:</span> <p class="text-white font-medium">${movie.Writer}</p></div>
            <div class="col-span-1 sm:col-span-2"><span class="text-slate-400">Aktor Utama:</span> <p class="text-white font-medium">${movie.Actors}</p></div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    modalContent.innerHTML = `<p class="text-rose-400 text-center">Gagal memuat detail film.</p>`;
  }
}

// Fungsi Buka & Tutup Modal
function openModal() {
  movieModal.classList.remove('hidden');
  setTimeout(() => movieModal.classList.remove('opacity-0'), 10);
}

function closeModal() {
  movieModal.classList.add('opacity-0');
  setTimeout(() => movieModal.classList.add('hidden'), 300);
}

closeModalBtn.addEventListener('click', closeModal);
movieModal.addEventListener('click', (e) => {
  if (e.target === movieModal) closeModal();
});