// ======================== DEFAULT SERVERS (with fake player/ping) ========================
let servers = [
    { id: "1", name: "BDCraft PvP", ip: "play.bdcraft.com", category: "PvP", description: "Competitive PvP arena", logo: "https://files.catbox.moe/4lrwsy.jpeg", votes: 124, createdAt: Date.now(), ownerId: "system" },
    { id: "2", name: "Bangla Skyblock", ip: "sky.bd.mc", category: "Skyblock", description: "Island skyblock fun", logo: "", votes: 89, createdAt: Date.now() - 86400000, ownerId: "system" },
    { id: "3", name: "Lifesteal Legacy", ip: "ls.bd.mc", category: "Lifesteal", description: "Steal hearts", logo: "", votes: 210, createdAt: Date.now() - 172800000, ownerId: "system" },
    { id: "4", name: "Peaceful Valley", ip: "peace.bd.mc", category: "Peaceful", description: "No PvP, just building", logo: "", votes: 45, createdAt: Date.now() - 259200000, ownerId: "system" },
    { id: "5", name: "Headsteal Hunger", ip: "head.bd.mc", category: "Headsteal", description: "Collect heads to upgrade", logo: "", votes: 67, createdAt: Date.now() - 345600000, ownerId: "system" },
    { id: "6", name: "Anarchy Bangladesh", ip: "anarchy.bd.mc", category: "Anarchy", description: "No rules, pure chaos", logo: "", votes: 198, createdAt: Date.now() - 432000000, ownerId: "system" },
];

let pendingPromotions = []; // user submitted servers pending approval? But for profile we store directly to servers with ownerId
let currentFilter = "all";
let searchQuery = "";
let currentPage = "home";
let currentUserId = localStorage.getItem("bmc_userId");
if (!currentUserId) { currentUserId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6); localStorage.setItem("bmc_userId", currentUserId); }

// Helper functions
function generateId() { return Date.now() + "-" + Math.random().toString(36).substr(2, 8); }
function loadData() {
    const saved = localStorage.getItem("bmc_servers");
    if (saved) servers = JSON.parse(saved);
    const savedPending = localStorage.getItem("bmc_pending");
    if (savedPending) pendingPromotions = JSON.parse(savedPending);
    servers.forEach(s => { if (!s.votes) s.votes = 0; if (!s.createdAt) s.createdAt = Date.now(); if (!s.ownerId) s.ownerId = "system"; });
    saveAll();
}
function saveAll() { localStorage.setItem("bmc_servers", JSON.stringify(servers)); localStorage.setItem("bmc_pending", JSON.stringify(pendingPromotions)); }

// Fake stats: random player count (1-50) and ping (1-50ms)
function getFakeStats(ipSeed) {
    let hash = 0;
    for (let i = 0; i < ipSeed.length; i++) hash = ((hash << 5) - hash) + ipSeed.charCodeAt(i);
    let seed = Math.abs(hash) % 1000;
    let players = Math.floor(Math.random() * 50) + 1;  // 1-50
    let ping = Math.floor(Math.random() * 50) + 1;    // 1-50ms
    return { online: true, players, ping, motd: "Minecraft Server" };
}

// Render Home, Explore, Leaderboard
async function renderAll() {
    let filtered = [...servers];
    if (searchQuery) filtered = filtered.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.ip.includes(searchQuery));
    if (currentFilter === "trending") filtered.sort((a,b) => b.votes - a.votes);
    else if (currentFilter === "newest") filtered.sort((a,b) => b.createdAt - a.createdAt);
    else filtered.sort((a,b) => b.votes - a.votes);
    
    document.getElementById("totalServersCount").innerText = servers.length;
    document.getElementById("totalVotesCount").innerText = servers.reduce((s,v)=>s+v.votes,0);
    
    const container = document.getElementById("serversContainer");
    if (container) {
        let cards = '';
        for (let s of filtered) {
            const stats = getFakeStats(s.ip);
            const logo = s.logo && s.logo.trim() !== "" ? s.logo : "https://via.placeholder.com/96?text=MC";
            cards += `
                <div class="server-card p-5">
                    <div class="flex flex-col items-center text-center">
                        <div class="logo-border mb-3"><img src="${logo}" class="server-logo-large" onerror="this.src='https://via.placeholder.com/96'"></div>
                        <h3 class="text-xl font-bold mt-2">${escapeHtml(s.name)}</h3>
                        <p class="text-gray-400 text-sm">${escapeHtml(s.ip)}</p>
                        <span class="inline-block bg-gray-700 rounded-full px-3 py-1 text-xs my-2">${s.category}</span>
                        <p class="text-gray-300 text-sm">${escapeHtml(s.description || "No description")}</p>
                        <div class="mt-3 flex gap-4 text-sm">
                            <span class="online-badge"><i class="fas fa-users"></i> ${stats.players} online</span>
                            <span class="ping-badge"><i class="fas fa-tachometer-alt"></i> ${stats.ping}ms</span>
                        </div>
                        <div class="mt-4 flex justify-between items-center w-full border-t border-gray-700 pt-3">
                            <div><i class="fas fa-thumbs-up text-yellow-400"></i> ${s.votes} votes</div>
                            <button class="vote-btn bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-black px-3 py-1 rounded-full text-sm" data-id="${s.id}"><i class="fas fa-vote-yea"></i> Vote</button>
                        </div>
                    </div>
                </div>
            `;
        }
        container.innerHTML = cards || '<div class="col-span-full text-center">No servers</div>';
        attachVoteEvents();
    }
    // Explore container (same cards)
    const exploreDiv = document.getElementById("exploreContainer");
    if (exploreDiv && currentPage === "explore") {
        let expHtml = '';
        for (let s of servers) {
            const stats = getFakeStats(s.ip);
            const logo = s.logo || "https://via.placeholder.com/96";
            expHtml += `<div class="server-card p-4 flex gap-4 items-center"><img src="${logo}" class="w-20 h-20 rounded-xl object-cover"><div><h4 class="font-bold">${escapeHtml(s.name)}</h4><p class="text-xs">${s.ip}</p><span class="text-xs ${stats.online ? 'text-green-400' : 'text-orange-400'}">${stats.players} online</span></div><div class="ml-auto"><button class="vote-btn-sm bg-yellow-500/20 px-2 py-1 rounded" data-id="${s.id}">Vote</button></div></div>`;
        }
        exploreDiv.innerHTML = expHtml;
        attachVoteEvents();
    }
    // Leaderboard
    const lbBody = document.getElementById("leaderboardBody");
    if (lbBody) {
        let sorted = [...servers].sort((a,b)=>b.votes - a.votes).slice(0,10);
        let rows = '';
        sorted.forEach((s,i) => { rows += `<tr class="border-b border-gray-700"><td class="py-3 px-4">#${i+1}</td><td class="py-3 px-4 font-bold">${escapeHtml(s.name)}</td><td class="py-3 px-4">${s.category}</td><td class="py-3 px-4">${s.votes}</td></tr>`; });
        lbBody.innerHTML = rows;
    }
    // Profile page
    if (currentPage === "profile") renderProfile();
}

function attachVoteEvents() {
    document.querySelectorAll('.vote-btn, .vote-btn-sm').forEach(btn => {
        btn.removeEventListener('click', handleVote);
        btn.addEventListener('click', handleVote);
    });
}
function handleVote(e) {
    const id = e.currentTarget.getAttribute('data-id');
    const server = servers.find(s => s.id === id);
    if (server) { server.votes += 1; saveAll(); renderAll(); }
}
function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }

// Navigation
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

function renderProfile() {
    const userServers = servers.filter(s => s.ownerId === currentUserId);
    const container = document.getElementById("userServersList");
    if (!container) return;
    if (userServers.length === 0) { container.innerHTML = '<div class="col-span-full text-center text-gray-400">You haven\'t added any servers yet. Go to Add Server page.</div>'; return; }
    let html = '';
    userServers.forEach(s => {
        const logo = s.logo || "https://via.placeholder.com/96";
        html += `<div class="server-card p-4 flex gap-4 items-center"><img src="${logo}" class="w-20 h-20 rounded-xl object-cover"><div><h4 class="font-bold">${escapeHtml(s.name)}</h4><p>${s.ip}</p><span class="text-xs bg-gray-700 px-2 py-0.5 rounded">${s.category}</span><p class="text-sm mt-1">${escapeHtml(s.description||'')}</p></div><div class="ml-auto text-right"><div>🗳️ ${s.votes} votes</div><button class="delete-server-btn bg-red-600 px-2 py-1 rounded text-xs mt-2" data-id="${s.id}">Delete</button></div></div>`;
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

// Catbox upload
async function uploadToCatbox(file) {
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("userhash", "");
    formData.append("fileToUpload", file);
    try {
        const response = await fetch("https://catbox.moe/user/api.php", { method: "POST", body: formData });
        const url = await response.text();
        if (url.startsWith("http")) return url.trim();
        else throw new Error("Upload failed");
    } catch(e) { console.error(e); return null; }
}

// Add server (user)
document.getElementById("addServerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("serverName").value.trim();
    const ip = document.getElementById("serverIp").value.trim();
    const category = document.getElementById("serverCategory").value;
    const desc = document.getElementById("serverDesc").value.trim();
    let logo = document.getElementById("serverLogo").value.trim();
    if (!name || !ip) { alert("Name and IP required"); return; }
    const newServer = { id: generateId(), name, ip, category, description: desc, logo: logo || "", votes: 0, createdAt: Date.now(), ownerId: currentUserId };
    servers.push(newServer);
    saveAll();
    alert("Server added successfully! It will appear in listings.");
    document.getElementById("addServerForm").reset();
    showPage("home");
});

// Catbox upload button
document.getElementById("uploadToCatbox")?.addEventListener("click", async () => {
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

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    loadData();
    document.querySelectorAll('.nav-link, .nav-link-mobile').forEach(link => {
        link.addEventListener('click', (e) => { e.preventDefault(); showPage(link.getAttribute('data-page')); });
    });
    document.getElementById("mobileMenuBtn").onclick = () => document.getElementById("mobileMenu").classList.toggle("hidden");
    document.getElementById("listServerBtn").onclick = () => showPage("addserver");
    document.getElementById("searchInput").addEventListener("input", (e) => { searchQuery = e.target.value; renderAll(); });
    document.getElementById("filterAll").onclick = () => { currentFilter="all"; document.querySelectorAll(".filter-chip").forEach(c=>c.classList.remove("active","bg-yellow-500","text-black")); document.getElementById("filterAll").classList.add("active","bg-yellow-500","text-black"); renderAll(); };
    document.getElementById("filterTrending").onclick = () => { currentFilter="trending"; updateFilterActive("filterTrending"); renderAll(); };
    document.getElementById("filterNewest").onclick = () => { currentFilter="newest"; updateFilterActive("filterNewest"); renderAll(); };
    function updateFilterActive(activeId) { document.querySelectorAll(".filter-chip").forEach(c=>c.classList.remove("active","bg-yellow-500","text-black")); document.getElementById(activeId).classList.add("active","bg-yellow-500","text-black"); }
    showPage("home");
});