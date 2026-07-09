let allRecipes = [];
let selectedCategory = "all";
const recipesContainer = document.getElementById("recipes");
const searchInput = document.getElementById("search");
const categoryChipsContainer = document.getElementById("categoryChips");

const activeClasses = ["bg-brand-600", "border-brand-600", "text-white", "shadow-md", "shadow-brand-500/20", "active"];
const inactiveClasses = ["bg-slate-50", "border-slate-200", "text-slate-600", "hover:bg-slate-100", "hover:text-slate-800"];

async function getRecipes() {
    try {
        const response = await fetch("/recipes");
        if (!response.ok) throw new Error("Gagal mengambil data dari server");
        
        const data = await response.json();
        allRecipes = data.recipes || [];
        filterRecipes();
    } catch (error) {
        console.error("Error fetching recipes:", error);
        if (recipesContainer) {
            recipesContainer.innerHTML = `
                <div class="col-span-full text-center py-16 px-4 bg-rose-50 rounded-3xl border border-rose-100 max-w-lg mx-auto mt-6">
                    <div class="inline-flex p-3 bg-rose-100 text-rose-600 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800 mb-2">Gagal Mengambil Data Resep</h3>
                    <p class="text-slate-500 text-sm mb-5 leading-relaxed">No Connection</p>
                    <button class="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition shadow-md shadow-brand-500/25 active:scale-95" onclick="getRecipes()">Coba Lagi</button>
                </div>
            `;
        }
    }
}

if (categoryChipsContainer) {
    categoryChipsContainer.addEventListener("click", (e) => {
        const chip = e.target.closest("button");
        if (!chip) return; 
        
        const activeChip = categoryChipsContainer.querySelector("button.active");
        if (activeChip) {
            activeChip.classList.remove(...activeClasses);
            activeChip.classList.add(...inactiveClasses);
        }
        
        chip.classList.remove(...inactiveClasses);
        chip.classList.add(...activeClasses);
        
        selectedCategory = chip.getAttribute("data-category") || "all";
        filterRecipes();
    });
}

if (searchInput) {
    searchInput.addEventListener("input", filterRecipes);
}

function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem("recipeFavorites")) || [];
    } catch (e) {
        console.error("Gagal membaca data favorit:", e);
        return [];
    }
}

window.toggleFavorite = function(event, id) {
    if (event) {
        event.stopPropagation(); 
    }
    
    let favorites = getFavorites();
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem("recipeFavorites", JSON.stringify(favorites));

    filterRecipes();
};

window.toggleFavoriteFromModal = function(id) {
    let favorites = getFavorites();
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem("recipeFavorites", JSON.stringify(favorites));

    showDetail(id);
    filterRecipes();
};

function filterRecipes() {
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const kategori = selectedCategory;
    const favorites = getFavorites();

    const hasil = allRecipes.filter(recipe => {
        if (!recipe) return false;
        
        const recipeName = recipe.name || "";
        const recipeIngredients = recipe.ingredients || [];

        const cocokNama = recipeName.toLowerCase().includes(keyword) || 
                        recipeIngredients.some(ing => ing.toLowerCase().includes(keyword));

        let cocokKategori = false;
        if (kategori === "favorites") {
            cocokKategori = favorites.includes(recipe.id);
        } else {
            let meal = "";
            if (recipe.mealType) {
                meal = Array.isArray(recipe.mealType) ? recipe.mealType[0] : recipe.mealType;
            }
            cocokKategori = kategori === "all" || meal === kategori;
        }

        return cocokNama && cocokKategori;
    });

    tampilkanResep(hasil, kategori === "favorites" && favorites.length === 0);
}

function tampilkanResep(recipes, isEmptyFavorites = false) {
    if (!recipesContainer) return;
    recipesContainer.innerHTML = "";


    if (isEmptyFavorites) {
        recipesContainer.innerHTML = `
            <div class="col-span-full text-center py-16 px-4 bg-slate-50 rounded-3xl border border-slate-100 max-w-lg mx-auto">
                <div class="inline-flex p-4 bg-rose-50 text-rose-500 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">Belum Ada Resep Favorit</h3>
            </div>
        `;
        return;
    }

    if (recipes.length === 0) {
        recipesContainer.innerHTML = `
            <div class="col-span-full text-center py-16 px-4 bg-slate-50 rounded-3xl border border-slate-100 max-w-lg mx-auto">
                <div class="inline-flex p-4 bg-slate-100 text-slate-400 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">Resep Tidak Ditemukan</h3>
                <p class="text-slate-500 text-sm leading-relaxed">Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p>
            </div>
        `;
        return;
    }

    const favorites = getFavorites();

    recipes.forEach(recipe => {
        if (!recipe) return;

        let meal = "";
        if (recipe.mealType) {
            meal = Array.isArray(recipe.mealType) ? recipe.mealType[0] : recipe.mealType;
        }

        const difficulty = recipe.difficulty || "Easy";
        const rating = recipe.rating || "0.0";
        const calories = recipe.caloriesPerServing || 0;
        const cookTime = recipe.cookTimeMinutes || 0;
        const servings = recipe.servings || 0;
        const recipeId = recipe.id || 0;
        const recipeName = recipe.name || "Resep Tanpa Nama";
        const recipeImage = recipe.image || "";

        const isFav = favorites.includes(recipeId);

        const diffColorMap = {
            easy: "bg-emerald-50 text-emerald-700 border-emerald-100",
            medium: "bg-amber-50 text-amber-700 border-amber-100",
            hard: "bg-rose-50 text-rose-700 border-rose-100"
        };
        const diffColorClass = diffColorMap[difficulty.toLowerCase()] || "bg-slate-50 text-slate-700 border-slate-100";

        recipesContainer.innerHTML += `
        <div class="w-full">
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full relative">
                <!-- Foto Resep -->
                <div class="relative h-56 w-full overflow-hidden">
                    <img src="${recipeImage}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="${recipeName}" loading="lazy">
                    <span class="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">${meal}</span>
                    
                    // Tombol Favorit
                    <button class="absolute top-4 right-4 bg-white/95 hover:bg-white text-slate-700 p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 z-10 flex items-center justify-content-center border border-slate-100" onclick="toggleFavorite(event, ${recipeId})" aria-label="Tandai Favorit">
                        <svg class="transition-colors duration-200" width="18" height="18" fill="${isFav ? '#ef4444' : 'none'}" stroke="${isFav ? '#ef4444' : 'currentColor'}" stroke-width="2.5" viewBox="0 0 24 24">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                        </svg>
                    </button>
                </div>
                
                <!-- Body Informasi Kartu -->
                <div class="p-5 md:p-6 flex flex-col flex-grow">
                    <h4 class="text-lg font-bold text-slate-800 mb-2.5 line-clamp-2 hover:text-brand-600 transition-colors leading-snug h-12">${recipeName}</h4>
                    
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="bg-amber-50 text-amber-700 text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-100">
                            <svg width="12" height="12" fill="currentColor" class="text-amber-500" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            ${rating}
                        </span>
                        <span class="bg-rose-50 text-rose-700 text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-100">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                            ${calories} kcal
                        </span>
                        <span class="text-xs font-bold inline-flex items-center px-2.5 py-1.5 rounded-xl border text-capitalize ${diffColorClass}">
                            ${difficulty}
                        </span>
                    </div>

                    <!-- Footer Info (Waktu Masak & Porsi) -->
                    <div class="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto text-slate-500 text-xs font-semibold">
                        <span class="flex items-center gap-1.5">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            ${cookTime} mnt
                        </span>
                        <span class="flex items-center gap-1.5">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            ${servings} porsi
                        </span>
                    </div>

                    <!-- Tombol detail -->
                    <button class="w-full mt-4 py-3 bg-brand-50 hover:bg-brand-600 hover:text-white text-brand-700 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 group/btn shadow-sm active:scale-98" onclick="showDetail(${recipeId})">
                        Lihat Detail Resep
                        <svg class="transform group-hover/btn:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                </div>
            </div>
        </div>
        `;
    });
}

function showDetail(id) {
    const recipe = allRecipes.find(item => item.id === id);
    if (!recipe) return;

    let meal = "";
    if (recipe.mealType) {
        meal = Array.isArray(recipe.mealType) ? recipe.mealType[0] : recipe.mealType;
    }

    const difficulty = recipe.difficulty || "Easy";
    const rating = recipe.rating || "0.0";
    const calories = recipe.caloriesPerServing || 0;
    const cookTime = recipe.cookTimeMinutes || 0;
    const servings = recipe.servings || 0;
    const recipeName = recipe.name || "Resep Tanpa Nama";
    const recipeImage = recipe.image || "";
    const ingredients = recipe.ingredients || [];
    const instructions = recipe.instructions || [];

    const favorites = getFavorites();
    const isFav = favorites.includes(id);

    const diffColorMap = {
        easy: "bg-emerald-50 text-emerald-700 border-emerald-100",
        medium: "bg-amber-50 text-amber-700 border-amber-100",
        hard: "bg-rose-50 text-rose-700 border-rose-100"
    };
    const diffColorClass = diffColorMap[difficulty.toLowerCase()] || "bg-slate-50 text-slate-700 border-slate-100";

    const detailContent = document.getElementById("detailContent");
    if (!detailContent) return;

    detailContent.innerHTML = `
        <div class="flex flex-col gap-6">
            <!-- Foto Besar Resep -->
            <div>
                <div class="rounded-2xl overflow-hidden mb-5 shadow-md relative h-64 md:h-72 w-full">
                    <img src="${recipeImage}" alt="${recipeName}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
                </div>
                
                <div class="flex items-center justify-between mb-3.5">
                    <span class="bg-brand-50 text-brand-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-brand-100">${meal}</span>
                    <div class="flex items-center gap-1.5">
                        <svg class="text-amber-500 fill-amber-500" width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <span class="font-extrabold text-slate-800 text-base">${rating}</span>
                        <span class="text-slate-400 text-xs font-medium">/ 5.0 Rating</span>
                    </div>
                </div>
                
                <h3 class="text-2xl md:text-3xl font-extrabold text-slate-800 leading-snug mb-5">${recipeName}</h3>
                
                <!-- Grid Metrik -->
                <div class="grid grid-cols-4 gap-3 mb-5">
                    <div class="bg-slate-55 bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center flex flex-col justify-center shadow-sm">
                        <span class="block text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-1">Waktu</span>
                        <span class="font-extrabold text-slate-800 text-xs md:text-sm">${cookTime} mnt</span>
                    </div>
                    <div class="bg-slate-55 bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center flex flex-col justify-center shadow-sm">
                        <span class="block text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-1">Porsi</span>
                        <span class="font-extrabold text-slate-800 text-xs md:text-sm">${servings} Porsi</span>
                    </div>
                    <div class="bg-slate-55 bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center flex flex-col justify-center shadow-sm">
                        <span class="block text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-1">Kalori</span>
                        <span class="font-extrabold text-slate-800 text-xs md:text-sm">${calories} kcal</span>
                    </div>
                    <div class="bg-slate-55 bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center flex flex-col justify-center shadow-sm">
                        <span class="block text-slate-400 text-[10px] font-bold tracking-wider uppercase mb-1">Kesulitan</span>
                        <span class="inline-block font-extrabold text-[10px] md:text-xs text-capitalize rounded-xl ${diffColorClass}">${difficulty}</span>
                    </div>
                </div>

                <!-- Tombol Favorit modal -->
                <button class="w-full py-3.5 border font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition duration-300 active:scale-98 shadow-sm ${
                    isFav 
                    ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600' 
                    : 'bg-brand-50 hover:bg-brand-100 border-brand-200 text-brand-700'
                }" onclick="toggleFavoriteFromModal(${id})">
                    <svg width="18" height="18" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                    <span>${isFav ? 'Hapus dari Resep Favorit' : 'Tambahkan ke Resep Favorit'}</span>
                </button>
            </div>

            <!-- List Bahan dan Langkah Langkah -->
            <div class="flex flex-col gap-6">
                <!-- Bahan-bahan -->
                <div>
                    <h5 class="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
                        <span>Bahan-bahan (Ingredients)</span>
                        <span class="text-slate-400 text-xs font-normal">Klik bahan yang siap</span>
                    </h5>
                    <ul class="space-y-2 ingredients-list">
                        ${ingredients
                            .map(item => `
                                <li class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition duration-150" onclick="toggleIngredient(this)">
                                    <span class="checkbox-mock flex-shrink-0 w-5 h-5 rounded-md border-2 border-slate-300 flex items-center justify-center bg-white transition-all relative"></span>
                                    <span class="ingredient-text text-sm font-semibold text-slate-600">${item}</span>
                                </li>
                            `)
                            .join("")}
                    </ul>
                </div>

                <!-- Langkah Masak -->
                <div>
                    <h5 class="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Langkah Pembuatan</h5>
                    <ol class="space-y-4">
                        ${instructions
                            .map((item, index) => `
                                <li class="flex gap-4 items-start">
                                    <div class="w-7 h-7 rounded-full bg-brand-50 border border-brand-100 text-brand-600 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                        ${index + 1}
                                    </div>
                                    <div class="text-sm text-slate-600 leading-relaxed font-semibold pt-0.5">
                                        ${item}
                                    </div>
                                </li>
                            `)
                            .join("")}
                    </ol>
                </div>
            </div>
        </div>
    `;

    openModal();
}

function openModal() {
    const modal = document.getElementById("recipeModal");
    if (!modal) return;
    
    const panel = modal.querySelector(".relative");
    
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    
    void modal.offsetWidth;
    
    modal.classList.remove("opacity-0");
    modal.classList.add("opacity-100");
    
    if (panel) {
        panel.classList.remove("scale-95");
        panel.classList.add("scale-100");
    }
    
    document.body.style.overflow = "hidden"; 
}

function closeModal() {
    const modal = document.getElementById("recipeModal");
    if (!modal) return;
    
    const panel = modal.querySelector(".relative");
    
    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0");
    
    if (panel) {
        panel.classList.remove("scale-100");
        panel.classList.add("scale-95");
    }
    
    document.body.style.overflow = ""; 
    
    setTimeout(() => {
        modal.classList.remove("flex");
        modal.classList.add("hidden");
    }, 300);
}

window.toggleIngredient = function(element) {
    if (element) {
        element.classList.toggle("checked");
    }
};

window.showDetail = showDetail;
window.getRecipes = getRecipes;
window.closeModal = closeModal;

const closeModalBtn = document.getElementById("closeModalBtn");
const recipeModal = document.getElementById("recipeModal");

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
}

if (recipeModal) {
    recipeModal.addEventListener("click", (e) => {
        if (e.target === recipeModal) {
            closeModal();
        }
    });
}

getRecipes();