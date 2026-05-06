// ------------------- DEFAULT SERVERS (mock) -------------------
let allServers = [
    { id: "1", name: "BDCraft PvP", ip: "play.bdcraft.com", category: "PvP", desc: "Competitive PvP arena", logo: "https://files.catbox.moe/4lrwsy.jpeg", votes: 245, createdAt: Date.now() - 86400000, type: "main" },
    { id: "2", name: "Skyblock Legends", ip: "sky.bd.mc", category: "Skyblock", desc: "Island skyblock with custom missions", logo: "", votes: 189, createdAt: Date.now() - 172800000, type: "main" },
    { id: "3", name: "Lifesteal Legacy", ip: "ls.bd.mc", category: "Lifesteal", desc: "Steal hearts, craft OP items", logo: "", votes: 312, createdAt: Date.now() - 259200000, type: "main" },
    { id: "4", name: "Peaceful Valley", ip: "peace.bd.mc", category: "Peaceful", desc: "No PvP, only building", logo: "", votes: 78, createdAt: Date.now() - 345600000, type: "main" },
    { id: "5", name: "Headsteal Hunger", ip: "head.bd.mc", category: "Headsteal", desc: "Collect heads to upgrade", logo: "", votes: 156, createdAt: Date.now() - 432000000, type: "main" },
    { id: "6", name: "Survival BD", ip: "survival.bd.mc", category: "Survival", desc: "Hardcore survival", logo: "", votes: 201, createdAt: Date.now() - 518400000, type: "main" },
    { id: "7", name: "Bedwar Rush", ip: "bedwar.bd.mc", category: "Bedwar", desc: "Fast paced bedwars", logo: "", votes: 98, createdAt: Date.now() - 604800000, type: "main" }
];
let userAddedServers = [];  // from promote (approved)
let pendingPromotions = [];  // submitted by users
let currentPage = "home", currentCategory = "all", searchQuery = "", offset = 0, limit = 6;
let adminUnlocked = false;
let currentUserId = localStorage.getItem("bmc_userId");
if (!currentUserId) { currentUserId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 8); localStorage.setItem("bmc_userId", currentUserId); }

// Load data from localStorage
function loadData() {
    const storedServers = localStorage.getItem("bmc_userServers");
    if (storedServers) userAddedServers = JSON.parse(storedServers);
    const storedPending = localStorage.getItem("bmc_pending");
    if (storedPending) pendingPromotions = JSON.parse(storedPending);
    const storedUnlock = localStorage.getItem("bmc_admin_unlocked");
    if (storedUnlock === "true") adminUnlocked = true;
    // merge all servers (main + user added)
    refreshCombinedServers();
}
function saveUserServers() { localStorage.setItem("bmc_userServers", JSON.stringify(userAddedServers)); }
function savePending() { localStorage.setItem("bmc_pending", JSON.stringify(pendingPromotions)); }
function refreshCombinedServers() {
    combinedServers = [...allServers, ...userAddedServers];
    // sort by votes descending
    combinedServers.sort((a,b) => b.votes - a.votes);
}
let combinedServers = [];

// Voting system (global votes stored in localStorage)
let voteMap = JSON.parse(localStorage.getItem("bmc_votes")) || {}; // { serverId: votes }
function initializeVotes() {
    for (let s of [...allServers, ...userAddedServers]) {
        if (voteMap[s.id] === undefined) voteMap[s.id] = s.votes || 0;
    }
    // sync back to objects
    for (let s of allServers) s.votes = voteMap[s.id] || 0;
    for (let s of userAddedServers) s.votes = voteMap[s.id] || 0;
    refreshCombinedServers();
}
function voteForServer(serverId) {
    if (!voteMap[serverId]) voteMap[serverId] = 0;
    voteMap[serverId] += 1;
    localStorage.setItem("bmc_votes", JSON.stringify(voteMap));
    // update in objects
    let server = allServers.find(s => s.id === serverId) || userAddedServers.find(s => s.id === serverId);
    if (server) server.votes = voteMap[serverId];
    refreshCombinedServers();
    renderAll();
}

// Helper: render cards
function renderServerCards(serversArray, containerId, showVoteBtn = true) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (serversArray.length === 0) { container.innerHTML = "<div class='col-span-full text-center'>No servers found</div>"; return; }
    let html = "";
    for (let s of serversArray) {
        const logo = s.logo && s.logo.trim() ? s.logo : "https://via.placeholder.com/80?text=MC";
        html += `
            <div class="server-card p-5">
                <div class="flex flex-col items-center text-center">
                    <img src="${logo}" class="logo-img-large mb-2" onerror="this.src='https://via.placeholder.com/80'">
                    <h3 class="text-xl font-bold">${escapeHtml(s.name)}</h3>
                    <p class="text-gray-400 text-sm">${escapeHtml(s.ip)}</p>
                    <span class="inline-block bg-gray-700 rounded-full px-3 py-1 text-xs my-2">${s.category}</span>
                    <p class="text-sm text-gray-300">${escapeHtml(s.desc || "No description")}</p>
                    <div class="flex gap-3 mt-2 text-xs">
                        <span><i class="fas fa-users"></i> ${Math.floor(Math.random() * 50) + 1} online</span>
                        <span class="ping-badge"><i class="fas fa-tachometer-alt"></i> ${Math.floor(Math.random() * 50) + 1}ms</span>
                    </div>
                    ${showVoteBtn ? `<button class="vote-btn mt-3 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-black px-4 py-1 rounded-full text-sm" data-id="${s.id}">👍 Vote (${s.votes})</button>` : `<div class="mt-3 text-yellow-400">⭐ ${s.votes} votes</div>`}
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
    if (showVoteBtn) {
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                voteForServer(id);
            });
        });
    }
}

// Rendering home page
function renderHome() {
    let filtered = combinedServers.filter(s => currentCategory === "all" ? true : s.category === currentCategory);
    if (searchQuery) filtered = filtered.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.ip.includes(searchQuery));
    const top3 = filtered.slice(0,3);
    const others = filtered.slice(offset, offset + limit);
    // render premium top 3
    const premiumContainer = document.getElementById("premiumContainer");
    if (top3.length) {
        const ranks = ['gold', 'silver', 'iron'];
        const labels = ['🥇 GOLDEN', '🥈 SILVER', '🥉 IRON'];
        premiumContainer.innerHTML = top3.map((s, idx) => `
            <div class="server-card p-4 text-center premium-${ranks[idx]}">
                <div class="font-bold text-lg">${labels[idx]}</div>
                <img src="${s.logo || 'https://via.placeholder.com/80'}" class="w-20 h-20 mx-auto rounded-full my-2">
                <h3 class="text-xl font-bold">${escapeHtml(s.name)}</h3>
                <p>${s.category} • ⭐ ${s.votes} votes</p>
            </div>
        `).join('');
    } else premiumContainer.innerHTML = '';
    renderServerCards(others, "serversList", true);
}
function renderExplore() {
    renderServerCards(combinedServers, "exploreList", true);
}
function renderLeaderboard() {
    const sorted = [...combinedServers].sort((a,b) => b.votes - a.votes).slice(0,20);
    const tbody = document.getElementById("leaderboardBody");
    tbody.innerHTML = sorted.map((s, i) => `<tr><td class="py-2 px-4">#${i+1}</td><td class="py-2 px-4">${escapeHtml(s.name)}</td><td class="py-2 px-4">${s.category}</td><td class="py-2 px-4">${s.votes}</td></tr>`).join('');
}
function renderProfile() {
    // user profile data from localStorage
    const profile = JSON.parse(localStorage.getItem("bmc_profile")) || { name: "", pic: "" };
    document.getElementById("profileName").value = profile.name;
    const picImg = document.getElementById("profilePicPreview");
    if (profile.pic) { picImg.src = profile.pic; picImg.classList.remove("hidden"); } else picImg.classList.add("hidden");
    // user's own servers
    const myServers = userAddedServers.filter(s => s.ownerId === currentUserId);
    const container = document.getElementById("userServersList");
    if (!myServers.length) { container.innerHTML = "<div class='col-span-full text-center'>No servers added yet</div>"; return; }
    let html = "";
    for (let s of myServers) {
        html += `<div class="server-card p-4 flex gap-4 items-center"><img src="${s.logo || 'https://via.placeholder.com/50'}" class="w-16 h-16 rounded-xl"><div><h4 class="font-bold">${escapeHtml(s.name)}</h4><p>${s.ip}</p><p class="text-xs">${s.category}</p></div><div class="ml-auto"><button class="delete-server-btn bg-red-600 px-2 py-1 rounded text-sm" data-id="${s.id}">Delete</button></div></div>`;
    }
    container.innerHTML = html;
    document.querySelectorAll('.delete-server-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            userAddedServers = userAddedServers.filter(s => s.id !== id);
            saveUserServers(); refreshCombinedServers(); renderAll(); renderProfile();
        });
    });
}
function renderAll() {
    if (currentPage === "home") renderHome();
    else if (currentPage === "explore") renderExplore();
    else if (currentPage === "leaderboard") renderLeaderboard();
    else if (currentPage === "profile") renderProfile();
}

// Category filters
function buildCategoryFilters() {
    const cats = ["all", "PvP", "Skyblock", "Lifesteal", "Headsteal", "Bedwar", "Peaceful", "Survival"];
    const container = document.getElementById("categoryFilters");
    container.innerHTML = cats.map(cat => `<button data-cat="${cat}" class="cat-filter ${cat === currentCategory ? 'active-cat bg-yellow-500 text-black' : 'bg-gray-800'} px-3 py-1 rounded-full text-sm">${cat === 'all' ? 'All' : cat}</button>`).join('');
    document.querySelectorAll('.cat-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.getAttribute('data-cat');
            offset = 0;
            renderAll();
            buildCategoryFilters();
        });
    });
}

// Promote form & Catbox upload
async function uploadToCatbox(file) {
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("userhash", "");
    formData.append("fileToUpload", file);
    try {
        const res = await fetch("https://catbox.moe/user/api.php", { method: "POST", body: formData });
        const url = await res.text();
        if (url.startsWith("http")) return url.trim();
        else throw new Error();
    } catch(e) { return null; }
}
function setupPromoteForm() {
    const form = document.getElementById("promoteForm");
    const catSelect = document.getElementById("promoCat");
    if (catSelect) catSelect.innerHTML = ["PvP","Skyblock","Lifesteal","Headsteal","Bedwar","Peaceful","Survival"].map(c => `<option>${c}</option>`).join('');
    document.getElementById("uploadCatboxBtn")?.addEventListener('click', async () => {
        const file = document.getElementById("promoImageUpload").files[0];
        if (!file) { alert("Select an image"); return; }
        const statusSpan = document.getElementById("uploadStatus");
        statusSpan.innerText = "Uploading...";
        const url = await uploadToCatbox(file);
        if (url) {
            document.getElementById("promoLogo").value = url;
            statusSpan.innerText = "✅ Uploaded!";
        } else statusSpan.innerText = "Failed";
    });
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("promoName").value.trim();
        const ip = document.getElementById("promoIp").value.trim();
        const category = document.getElementById("promoCat").value;
        const desc = document.getElementById("promoDesc").value.trim();
        const logo = document.getElementById("promoLogo").value.trim();
        if (!name || !ip) { alert("Name and IP required"); return; }
        pendingPromotions.push({ name, ip, category, desc, logo, userId: currentUserId, status: "pending" });
        savePending();
        alert("Promotion request sent. Admin will review (you can become admin with code 323323).");
        form.reset();
        showPage("home");
    });
}

// Profile save
function setupProfile() {
    document.getElementById("saveProfileBtn")?.addEventListener('click', () => {
        const name = document.getElementById("profileName").value.trim();
        const pic = document.getElementById("profilePicPreview").src;
        localStorage.setItem("bmc_profile", JSON.stringify({ name, pic }));
        alert("Profile saved");
    });
    document.getElementById("uploadProfilePicBtn")?.addEventListener('click', () => {
        document.getElementById("profilePicInput").click();
    });
    document.getElementById("profilePicInput")?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = await uploadToCatbox(file);
        if (url) {
            const preview = document.getElementById("profilePicPreview");
            preview.src = url;
            preview.classList.remove("hidden");
        } else alert("Upload failed");
    });
}

// Admin unlock
function showAdminModal() { document.getElementById("adminModal").classList.remove("hidden"); document.getElementById("adminModal").style.display = "flex"; }
function closeAdminModal() { document.getElementById("adminModal").style.display = "none"; }
function setupAdmin() {
    document.getElementById("adminCodeBtn")?.addEventListener('click', showAdminModal);
    document.getElementById("submitAdminCode")?.addEventListener('click', () => {
        const code = document.getElementById("adminCodeInput").value;
        if (code === "323323") {
            adminUnlocked = true;
            localStorage.setItem("bmc_admin_unlocked", "true");
            alert("Admin unlocked! You can now manage pending promotions.");
            closeAdminModal();
            // show admin panel UI (simple alert to approve)
            if (pendingPromotions.length) {
                let msg = "Pending promotions:\n";
                pendingPromotions.forEach((p, idx) => { msg += `${idx+1}. ${p.name} (${p.ip})\n`; });
                msg += "\nType 'approve ID' or 'reject ID' in console. Example: approve 1";
                console.log(msg);
                alert(msg);
            } else alert("No pending promotions.");
        } else alert("Wrong code");
    });
    // simple approve via console, but we'll make a small UI? Could add but keep minimal.
}
window.approvePromotion = (idx) => {
    if (!adminUnlocked) return;
    const promo = pendingPromotions[idx];
    if (!promo) return;
    const newServer = {
        id: "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        name: promo.name, ip: promo.ip, category: promo.category, desc: promo.desc, logo: promo.logo,
        votes: 0, createdAt: Date.now(), type: "user", ownerId: promo.userId
    };
    userAddedServers.push(newServer);
    saveUserServers();
    pendingPromotions.splice(idx,1);
    savePending();
    refreshCombinedServers();
    renderAll();
};
window.rejectPromotion = (idx) => {
    if (!adminUnlocked) return;
    pendingPromotions.splice(idx,1);
    savePending();
    console.log("Rejected");
};

// Navigation & Search & Load More
function showPage(page) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    document.getElementById(page + 'Page').classList.remove('hidden');
    currentPage = page;
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active', 'text-yellow-400'));
    document.querySelectorAll(`.nav-link[data-page="${page}"]`).forEach(link => link.classList.add('active', 'text-yellow-400'));
    offset = 0;
    renderAll();
    if (page === "profile") renderProfile();
    if (page === "addserver") setupPromoteForm(); // reattach
}
document.addEventListener("DOMContentLoaded", () => {
    loadData();
    initializeVotes();
    buildCategoryFilters();
    setupPromoteForm();
    setupProfile();
    setupAdmin();
    // Navigation listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => { e.preventDefault(); showPage(link.getAttribute('data-page')); });
    });
    document.getElementById("mobileMenuBtn").onclick = () => document.getElementById("mobileMenu").classList.toggle("hidden");
    document.getElementById("searchInput").addEventListener('input', (e) => { searchQuery = e.target.value; offset = 0; renderHome(); });
    document.getElementById("loadMoreBtn").addEventListener('click', () => { offset += limit; renderHome(); });
    // Dark mode toggle
    document.getElementById("darkModeToggle").addEventListener('click', () => document.body.classList.toggle("light-mode"));
    showPage("home");
});
function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }