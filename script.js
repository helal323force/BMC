// ---------- Initial Servers with fake player/ping (fixed per server) ----------
let servers = [
    { id: "1", name: "BDCraft PvP", ip: "play.bdcraft.com", category: "PvP", description: "Best PvP arena in BD", logo: "https://files.catbox.moe/4lrwsy.jpeg", ratings: {1:0,2:0,3:0,4:0,5:0}, totalRatings: 124, avgRating: 4.2, createdAt: Date.now(), ownerId: "system", fakePlayers: 32, fakePing: 23 },
    { id: "2", name: "Bangla Skyblock", ip: "sky.bd.mc", category: "Skyblock", description: "Island skyblock fun", logo: "", ratings: {1:0,2:0,3:0,4:0,5:0}, totalRatings: 89, avgRating: 3.8, createdAt: Date.now() - 86400000, ownerId: "system", fakePlayers: 18, fakePing: 41 },
    { id: "3", name: "Lifesteal Legacy", ip: "ls.bd.mc", category: "Lifesteal", description: "Steal hearts and dominate", logo: "", ratings: {1:0,2:0,3:0,4:0,5:0}, totalRatings: 210, avgRating: 4.7, createdAt: Date.now() - 172800000, ownerId: "system", fakePlayers: 47, fakePing: 12 },
    { id: "4", name: "Peaceful Valley", ip: "peace.bd.mc", category: "Peaceful", description: "No PvP, just building", logo: "", ratings: {1:0,2:0,3:0,4:0,5:0}, totalRatings: 45, avgRating: 4.0, createdAt: Date.now() - 259200000, ownerId: "system", fakePlayers: 9, fakePing: 28 },
    { id: "5", name: "Headsteal Hunger", ip: "head.bd.mc", category: "Headsteal", description: "Collect heads to upgrade", logo: "", ratings: {1:0,2:0,3:0,4:0,5:0}, totalRatings: 67, avgRating: 4.1, createdAt: Date.now() - 345600000, ownerId: "system", fakePlayers: 22, fakePing: 17 },
    { id: "6", name: "Anarchy Bangladesh", ip: "anarchy.bd.mc", category: "Anarchy", description: "No rules, pure chaos", logo: "", ratings: {1:0,2:0,3:0,4:0,5:0}, totalRatings: 198, avgRating: 4.3, createdAt: Date.now() - 432000000, ownerId: "system", fakePlayers: 44, fakePing: 35 },
    { id: "7", name: "Oneblock Odyssey", ip: "oneblock.bd.mc", category: "Oneblock", description: "Expand your block", logo: "", ratings: {1:0,2:0,3:0,4:0,5:0}, totalRatings: 56, avgRating: 4.5, createdAt: Date.now() - 518400000, ownerId: "system", fakePlayers: 27, fakePing: 19 },
    { id: "8", name: "Parkour Paradise", ip: "parkour.bd.mc", category: "Parkour", description: "300+ parkour levels", logo: "", ratings: {1:0,2:0,3:0,4:0,5:0}, totalRatings: 112, avgRating: 4.9, createdAt: Date.now() - 604800000, ownerId: "system", fakePlayers: 38, fakePing: 8 },
    { id: "9", name: "Practice PvP Hub", ip: "practice.bd.mc", category: "Practice", description: "Improve your skills", logo: "", ratings: {1:0,2:0,3:0,4:0,5:0}, totalRatings: 203, avgRating: 4.6, createdAt: Date.now() - 691200000, ownerId: "system", fakePlayers: 51, fakePing: 15 },
    { id: "10", name: "Survival BD", ip: "survival.bd.mc", category: "Survival", description: "Hardcore survival", logo: "", ratings: {1:0,2:0,3:0,4:0,5:0}, totalRatings: 82, avgRating: 3.9, createdAt: Date.now() - 777600000, ownerId: "system", fakePlayers: 14, fakePing: 45 }
];

let currentUserId = localStorage.getItem("bmc_userId");
if (!currentUserId) { currentUserId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6); localStorage.setItem("bmc_userId", currentUserId); }

let currentCategory = "all";
let currentSort = "popular"; // 'popular' or 'newest'
let searchQuery = "";
let currentPage = "home";

// Helper functions
function generateId() { return Date.now() + "-" + Math.random().toString(36).substr(2, 8); }
function loadData() {
    const saved = localStorage.getItem("bmc_servers");
    if (saved) servers = JSON.parse(saved);
    servers.forEach(s => {
        if (!s.ratings) s.ratings = {1:0,2:0,3:0,4:0,5:0};
        if (s.totalRatings === undefined) s.totalRatings = 0;
        if (s.avgRating === undefined) s.avgRating = 0;
        if (s.fakePlayers === undefined) s.fakePlayers = Math.floor(Math.random() * 50) + 1;
        if (s.fakePing === undefined) s.fakePing = Math.floor(Math.random() * 50) + 1;
        if (!s.createdAt) s.createdAt = Date.now();
        if (!s.ownerId) s.ownerId = "system";
    });
    saveAll();
}
function saveAll() { localStorage.setItem("bmc_servers", JSON.stringify(servers)); }

function updateRating(serverId, stars) {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;
    if (!server.ratings[stars]) server.ratings[stars] = 0;
    server.ratings[stars] += 1;
    server.totalRatings += 1;
    let totalSum = 0;
    for (let i=1; i<=5; i++) totalSum += server.ratings[i] * i;
    server.avgRating = totalSum / server.totalRatings;
    saveAll();
    renderAll();
}

function renderAll() {
    let filtered = servers.filter(s => currentCategory === "all" ? true : s.category === currentCategory);
    if (searchQuery) filtered = filtered.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.ip.includes(searchQuery));
    if (currentSort === "popular") filtered.sort((a,b) => b.avgRating - a.avgRating);
    else if (currentSort === "newest") filtered.sort((a,b) => b.createdAt - a.createdAt);
    
    document.getElementById("totalServersCount").innerText = servers.length;
    const totalRatings = servers.reduce((sum,s) => sum + (s.totalRatings || 0), 0);
    document.getElementById("totalRatingsCount").innerText = totalRatings;
    
    const container = document.getElementById("serversContainer");
    if (container) {
        if (filtered.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-10">No servers found</div>';
        } else {
            let html = '';
            for (let s of filtered) {
                const logo = s.logo && s.logo.trim() !== "" ? s.logo : "https://via.placeholder.com/96?text=MC";
                const fullStars = Math.floor(s.avgRating);
                const remainder = s.avgRating - fullStars;
                let starsHtml = '';
                for (let i=1; i<=5; i++) {
                    let starClass = 'far fa-star';
                    if (i <= fullStars) starClass = 'fas fa-star';
                    else if (i === fullStars+1 && remainder >= 0.5) starClass = 'fas fa-star-half-alt';
                    starsHtml += `<i class="${starClass} text-yellow-400 text-sm"></i>`;
                }
                html += `
                    <div class="server-card p-5">
                        <div class="flex flex-col items-center text-center">
                            <div class="logo-border mb-3"><img src="${logo}" class="server-logo-large" onerror="this.src='https://via.placeholder.com/96'"></div>
                            <h3 class="text-xl font-bold mt-2">${escapeHtml(s.name)}</h3>
                            <p class="text-gray-400 text-sm">${escapeHtml(s.ip)}</p>
                            <span class="inline-block bg-gray-700 rounded-full px-3 py-1 text-xs my-2">${s.category}</span>
                            <p class="text-gray-300 text-sm">${escapeHtml(s.description || "No description")}</p>
                            <div class="mt-3 flex gap-4 text-sm">
                                <span class="text-green-400"><i class="fas fa-users"></i> ${s.fakePlayers} online</span>
                                <span class="ping-badge"><i class="fas fa-tachometer-alt"></i> ${s.fakePing}ms</span>
                            </div>
                            <div class="star-rating mt-3" data-id="${s.id}">
                                ${[1,2,3,4,5].map(star => `<i class="star far fa-star" data-star="${star}"></i>`).join('')}
                            </div>
                            <div class="mt-2 text-sm">${starsHtml} (${s.totalRatings} ratings)</div>
                            <div class="mt-3 w-full border-t border-gray-700 pt-3 text-center">
                                <span class="text-yellow-400">⭐ ${s.avgRating.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
            container.innerHTML = html;
            attachStarEvents();
        }
    }
    // Explore container (same as home but no filter/search)
    const exploreDiv = document.getElementById("exploreContainer");
    if (exploreDiv && currentPage === "explore") {
        let expHtml = '';
        for (let s of servers) {
            const logo = s.logo || "https://via.placeholder.com/96";
            expHtml += `<div class="server-card p-4 flex gap-4 items-center"><img src="${logo}" class="w-20 h-20 rounded-xl object-cover"><div><h4 class="font-bold">${escapeHtml(s.name)}</h4><p>${s.ip}</p><div class="flex gap-2 mt-1"><span class="text-green-400 text-xs">${s.fakePlayers} online</span><span class="ping-badge text-xs">${s.fakePing}ms</span></div></div><div class="ml-auto text-right"><div class="star-rating-sm" data-id="${s.id}">${[1,2,3,4,5].map(star => `<i class="star far fa-star" data-star="${star}"></i>`).join('')}</div><div class="text-xs mt-1">${s.avgRating.toFixed(1)} (${s.totalRatings})</div></div></div>`;
        }
        exploreDiv.innerHTML = expHtml;
        attachStarEvents();
    }
    // Leaderboard
    const lbBody = document.getElementById("leaderboardBody");
    if (lbBody) {
        let sorted = [...servers].sort((a,b)=>b.avgRating - a.avgRating).slice(0,10);
        let rows = '';
        sorted.forEach((s,i) => {
            rows += `<tr class="border-b border-gray-700"><td class="py-3 px-4">#${i+1}</td><td class="py-3 px-4 font-bold">${escapeHtml(s.name)}</td><td>${s.category}</td><td>⭐ ${s.avgRating.toFixed(1)}</td><td>${s.totalRatings}</td></tr>`;
        });
        lbBody.innerHTML = rows;
    }
    if (currentPage === "profile") renderProfile();
}

function attachStarEvents() {
    document.querySelectorAll('.star-rating, .star-rating-sm').forEach(container => {
        const serverId = container.getAttribute('data-id');
        const stars = container.querySelectorAll('.star');
        stars.forEach(star => {
            star.removeEventListener('click', handleStarClick);
            star.addEventListener('click', handleStarClick);
            star.removeEventListener('mouseenter', handleStarHover);
            star.addEventListener('mouseenter', handleStarHover);
            star.removeEventListener('mouseleave', handleStarLeave);
            star.addEventListener('mouseleave', handleStarLeave);
        });
        function handleStarClick(e) {
            const starVal = parseInt(e.currentTarget.getAttribute('data-star'));
            updateRating(serverId, starVal);
        }
        function handleStarHover(e) {
            const hoverVal = parseInt(e.currentTarget.getAttribute('data-star'));
            stars.forEach((st, idx) => {
                if (idx < hoverVal) st.classList.remove('far'); st.classList.add('fas');
                else st.classList.remove('fas'); st.classList.add('far');
            });
        }
        function handleStarLeave() {
            const server = servers.find(s => s.id === serverId);
            const avg = server.avgRating;
            const full = Math.floor(avg);
            stars.forEach((st, idx) => {
                if (idx < full) { st.classList.remove('far'); st.classList.add('fas'); }
                else if (idx === full && avg - full >= 0.5) { st.classList.remove('far'); st.classList.add('fas'); }
                else { st.classList.remove('fas'); st.classList.add('far'); }
            });
        }
    });
}

function renderProfile() {
    const userServers = servers.filter(s => s.ownerId === currentUserId);
    const container = document.getElementById("userServersList");
    if (!container) return;
    if (userServers.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400">You haven\'t added any servers yet.</div>';
        return;
    }
    let html = '';
    userServers.forEach(s => {
        const logo = s.logo || "https://via.placeholder.com/96";
        html += `<div class="server-card p-4 flex gap-4 items-center"><img src="${logo}" class="w-20 h-20 rounded-xl object-cover"><div><h4 class="font-bold">${escapeHtml(s.name)}</h4><p>${s.ip}</p><span class="text-xs bg-gray-700 px-2 py-0.5 rounded">${s.category}</span><p class="text-sm mt-1">${escapeHtml(s.description||'')}</p></div><div class="ml-auto text-right"><div>⭐ ${s.avgRating.toFixed(1)} (${s.totalRatings})</div><button class="delete-server-btn bg-red-600 px-2 py-1 rounded text-xs mt-2" data-id="${s.id}">Delete</button></div></div>`;
    });
    container.innerHTML = html;
    document.querySelectorAll('.delete-server-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            if (confirm("Delete your server?")) {
                servers = servers.filter(s => s.id !== id);
                saveAll();
                renderAll();
                renderProfile();
            }
        });
    });
}

function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }

// Catbox upload
async function uploadToCatbox(file) {
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("userhash", "");
    formData.append("fileToUpload", file);
    try {
        const res = await fetch("https://catbox.moe/user/api.php", { method: "POST", body: formData });
        const url = await res.text();
        if (url.startsWith("http")) return url.trim();
        else throw new Error("Upload failed");
    } catch(e) { return null; }
}

// Navigation & Event Listeners
function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId + 'Page').classList.remove('hidden');
    currentPage = pageId;
    document.querySelectorAll('.nav-link, .nav-link-mobile').forEach(link => {
        link.classList.remove('active', 'text-yellow-400');
        if (link.getAttribute('data-page') === pageId) link.classList.add('active', 'text-yellow-400');
    });
    if (pageId === 'explore' || pageId === 'leaderboard' || pageId === 'home') renderAll();
    if (pageId === 'profile') renderProfile();
}

document.addEventListener("DOMContentLoaded", () => {
    loadData();
    // Navigation
    document.querySelectorAll('.nav-link, .nav-link-mobile').forEach(link => {
        link.addEventListener('click', (e) => { e.preventDefault(); showPage(link.getAttribute('data-page')); });
    });
    document.getElementById("mobileMenuBtn")?.addEventListener('click', () => document.getElementById("mobileMenu").classList.toggle("hidden"));
    document.getElementById("listServerBtn")?.addEventListener('click', () => showPage("addserver"));
    document.getElementById("searchInput")?.addEventListener('input', (e) => { searchQuery = e.target.value; renderAll(); });
    // Category filters
    document.querySelectorAll('.cat-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-filter').forEach(b => b.classList.remove('active-cat', 'bg-yellow-500', 'text-black'));
            btn.classList.add('active-cat', 'bg-yellow-500', 'text-black');
            currentCategory = btn.getAttribute('data-cat');
            renderAll();
        });
    });
    // Sort buttons
    document.getElementById("sortPopular")?.addEventListener('click', () => { currentSort = "popular"; renderAll(); });
    document.getElementById("sortNewest")?.addEventListener('click', () => { currentSort = "newest"; renderAll(); });
    // Add server form
    document.getElementById("addServerForm")?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById("serverName").value.trim();
        const ip = document.getElementById("serverIp").value.trim();
        const category = document.getElementById("serverCategory").value;
        const desc = document.getElementById("serverDesc").value.trim();
        let logo = document.getElementById("serverLogo").value.trim();
        if (!name || !ip) { alert("Name and IP required"); return; }
        const newServer = {
            id: generateId(), name, ip, category, description: desc, logo: logo || "",
            ratings: {1:0,2:0,3:0,4:0,5:0}, totalRatings: 0, avgRating: 0,
            createdAt: Date.now(), ownerId: currentUserId,
            fakePlayers: Math.floor(Math.random() * 50) + 1,
            fakePing: Math.floor(Math.random() * 50) + 1
        };
        servers.push(newServer);
        saveAll();
        alert("Server added successfully!");
        document.getElementById("addServerForm").reset();
        showPage("home");
    });
    // Catbox upload
    document.getElementById("uploadToCatbox")?.addEventListener('click', async () => {
        const fileInput = document.getElementById("logoUpload");
        const file = fileInput.files[0];
        if (!file) { alert("Select an image first"); return; }
        const statusSpan = document.getElementById("uploadStatus");
        statusSpan.innerText = "Uploading...";
        const url = await uploadToCatbox(file);
        if (url) {
            document.getElementById("serverLogo").value = url;
            statusSpan.innerText = "✅ Uploaded!";
        } else { statusSpan.innerText = "❌ Failed"; }
    });
    showPage("home");
});