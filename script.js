// --- Utility Functions ---
function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

// --- Dropdown Logic ---
function toggleDropdown(id) {
    const content = qs(`#${id}`);
    const button = qs(`button[aria-controls="${id}"]`);
    const expanded = button.getAttribute('aria-expanded') === 'true';
    if (button.classList.contains('main-category')) {
        qsa('.main-category').forEach(btn => {
            btn.setAttribute('aria-expanded', 'false');
            btn.classList.remove('dropdown-open');
        });
        qsa('.category > .dropdown-content').forEach(div => div.style.display = 'none');
        if (!expanded) {
            button.setAttribute('aria-expanded', 'true');
            content.style.display = 'block';
            button.classList.add('dropdown-open');
        }
        setTimeout(() => {
            if (!qsa('.main-category').some(btn => btn.getAttribute('aria-expanded') === 'true')) {
                const panel = qs('#description-panel');
                panel.innerHTML = '';
                panel.classList.remove('active');
            }
        }, 0);
    } else {
        const parent = button.parentElement;
        qsa('.dropdown-toggle', parent).forEach(btn => {
            if (btn !== button) {
                btn.setAttribute('aria-expanded', 'false');
                btn.classList.remove('dropdown-open');
            }
        });
        qsa('.dropdown-content', parent).forEach(div => {
            if (div !== content) div.style.display = 'none';
        });
        if (!expanded) {
            button.setAttribute('aria-expanded', 'true');
            content.style.display = 'block';
            button.classList.add('dropdown-open');
        } else {
            button.setAttribute('aria-expanded', 'false');
            content.style.display = 'none';
            button.classList.remove('dropdown-open');
        }
    }
}

function handleKeyDown(event, id) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleDropdown(id);
    }
}

// --- Data Loading ---
let descriptions = {};
let allCommunities = [];
let categoryHeadings = {};

function loadCommunities() {
    fetch('communities.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            allCommunities = data;
            renderCommunitiesPage(currentCommunityPage);
        })
        .catch(error => console.error('Error loading communities:', error));
}

function loadCategoryHeadings() {
    fetch('categoryHeadings.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => { categoryHeadings = data; })
        .catch(error => console.error('Error loading category headings:', error));
}

// --- Description Panel Logic ---
function showDescription(button) {
    qsa('.criteria-btn.active-desc').forEach(btn => btn.classList.remove('active-desc'));
    qsa('.info-icon').forEach(icon => icon.remove());
    button.classList.add('active-desc');
    let icon = button.querySelector('.info-icon');
    if (!icon) {
        icon = document.createElement('span');
        icon.className = 'info-icon';
        icon.innerHTML = '&#9432;';
        button.appendChild(icon);
    }
    icon.style.display = '';
    const key = button.getAttribute('data-key');
    const panel = qs('#description-panel');
    const anyExpanded = qsa('.main-category').some(btn => btn.getAttribute('aria-expanded') === 'true');
    if (anyExpanded) {
        panel.innerHTML = `<span class="info-icon">&#9432;</span><div>Loading description...</div>`;
        panel.classList.add('active');
    } else {
        panel.innerHTML = '';
        panel.classList.remove('active');
        button.classList.remove('active-desc');
        if (icon) icon.remove();
        showDefaultDescription();
        return;
    }
    // Only load fallbackDescriptions.json
    fetch('fallbackDescriptions.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(fallbackDescriptions => {
            let desc = fallbackDescriptions[key] || 'No description available.';
            panel.innerHTML = `<span class="info-icon">&#9432;</span><div>${desc}</div>`;
        })
        .catch(error => {
            console.error('Error loading fallback descriptions:', error);
            panel.innerHTML = `<span class="info-icon">&#9432;</span><div>Failed to load description.</div>`;
        });
}

function showDefaultDescription() {
    const panel = qs('#description-panel');
    panel.innerHTML = `
        <span class="info-icon">&#9432;</span>
        <div>
            Select a main category to see its sub-categories.<br>
            Click on sub-categories to view their descriptions and add them to your matching criteria using the checkbox.<br>
            <br>
        </div>
    `;
    panel.classList.add('active');
}

// --- Event Listeners ---
function setupCriteriaBtnListeners() {
    qsa('button[data-key]:not(.main-category)').forEach(btn => {
        btn.classList.replace('subcategory-btn', 'criteria-btn');
        btn.addEventListener('click', function () { showDescription(btn); });
    });
    qsa('.dropdown-toggle:not(.main-category)').forEach(btn => {
        btn.addEventListener('click', function() {
            if (btn.getAttribute('aria-expanded') === 'false') {
                const panel = qs('#description-panel');
                panel.innerHTML = '';
                panel.classList.remove('active');
                showDefaultDescription();
            }
        });
    });
}

// --- Criteria Selection Logic ---
let selectedCriteria = new Set();

function updateRankingPanel() {
    const selectedList = qs('#selected-criteria');
    selectedList.innerHTML = '';
    const selectedArr = Array.from(selectedCriteria);
    const maxVisible = 5;
    selectedArr.slice(0, maxVisible).forEach(id => {
        const btn = qs(`button[data-key="${id}"]`);
        if (btn) {
            const icon = btn.querySelector('.info-icon');
            if (icon) icon.remove();
        }
        const text = btn ? btn.textContent.trim() : id;
        const head = categoryHeadings[id] ? categoryHeadings[id] + " > " : "";
        const li = document.createElement('li');
        li.textContent = head + text;
        li.style.cursor = 'pointer';
        li.title = 'Click to unselect';
        li.addEventListener('click', function(e) {
            e.stopPropagation();
            selectedCriteria.delete(id);
            if (btn) btn.classList.remove('active-sub');
            const cb = qs(`.criteria-checkbox[data-criteria="${id}"]`);
            if (cb) {
                const oldHandler = cb.onchange;
                cb.onchange = null;
                cb.checked = false;
                cb.onchange = oldHandler;
            }
            updateRankingPanel();
        });
        selectedList.appendChild(li);
    });
    if (selectedArr.length > maxVisible) {
        const li = document.createElement('li');
        li.textContent = `[+${selectedArr.length - maxVisible} more...]`;
        li.style.cursor = 'default';
        li.style.background = 'transparent';
        li.style.color = '#ffd580';
        li.style.fontWeight = 'normal';
        li.style.border = 'none';
        li.style.marginTop = '0.3em';
        selectedList.appendChild(li);
    }
    qsa('.criteria-checkbox').forEach(cb => {
        const id = cb.getAttribute('data-criteria');
        cb.checked = selectedCriteria.has(id);
        const btn = qs(`button[data-key="${id}"]`);
        if (btn) {
            if (cb.checked) {
                btn.classList.add('active-sub');
                const icon = btn.querySelector('.info-icon');
                if (icon) icon.remove();
            } else {
                btn.classList.remove('active-sub');
            }
        }
    });
    const descBtn = qs('.criteria-btn.active-desc');
    if (descBtn && selectedCriteria.has(descBtn.getAttribute('data-key'))) {
        let icon = descBtn.querySelector('.info-icon');
        if (!icon) {
            icon = document.createElement('span');
            icon.className = 'info-icon';
            icon.innerHTML = '&#9432;';
            descBtn.appendChild(icon);
        }
        icon.style.display = '';
    }
    
    // Create mapping from criteria IDs to community category names
    const criteriaToCategory = {
        "rp-focused": "RP-Focused",
        "competitive-multiplayer": "Competitive Multiplayer",
        "casual-multiplayer": "Casual Multiplayer",
        "railroad": "Railroad",
        "freeform": "Freeform", 
        "sandbox": "Sandbox",
        "narrative-driven": "Narrative-Driven",
        "simulationist": "Simulationist",
        "tactical": "Tactical",
        "voice-rp": "Voice RP",
        "text-based-rp": "Text-Based RP",
        "mixed-rp": "Mixed RP",
        "high-lore": "High Lore Demand",
        "moderate-lore": "Moderate Lore Demand",
        "low-lore": "Low Lore Demand",
        "large-communities": "Large Communities",
        "medium-communities": "Medium Communities",
        "small-communities": "Small Communities",
        "exclusive-communities": "Exclusive Communities",
        "beginner-friendly": "Beginner-Friendly",
        "intermediate": "Intermediate",
        "advanced-expert": "Advanced/Expert",
        "mixed-skill": "Mixed Skill Level",
        "vanilla": "Vanilla",
        "lightly-modded": "Lightly Modded",
        "heavily-modded": "Heavily Modded",
        "english-speaking": "English-Speaking",
        "non-english-speaking": "Non-English Speaking",
        "multilingual": "Multilingual",
        "regional-groups": "Regional Groups",
        "global-groups": "Global Groups",
        "single-campaign": "Single Campaign",
        "multiple-campaigns": "Multiple Campaigns",
        "strict-moderation": "Strict Moderation",
        "relaxed-moderation": "Relaxed Moderation",
        "community-guided": "Community-Guided",
        "multiple-a-week": "Multiple a Week",
        "weekly": "Weekly",
        "bi-monthly": "Bi-Monthly",
        "monthly": "Monthly",
        "other-session-frequency": "Other"
    };

    let results = '';
    if (selectedCriteria.size > 0) {
        // Convert selected criteria IDs to category names for matching
        const selectedCategories = Array.from(selectedCriteria).map(id => criteriaToCategory[id]).filter(Boolean);
        
        let ranked = allCommunities.map(comm => {
            let score = comm.categories.filter(c => selectedCategories.includes(c)).length;
            return { name: comm.name, score, total: comm.categories.length };
        });
        ranked.sort((a, b) => b.score - a.score);
        results = '<strong>Best Matches:</strong><ul>';
        // Show only top 3 matches
        ranked.slice(0, 3).forEach(r => {
            results += `<li>${r.name}: <b>${r.score}</b> / ${r.total} match${r.score === 1 ? '' : 'es'}</li>`;
        });
        results += '</ul>';
    } else {
        results = '<em>Select sub-categories to see your best matches.</em>';
    }
    document.getElementById('ranking-results').innerHTML = results;
}

// --- RP Categories Visibility ---
function updateRPCategoriesVisibility() {
    const rpFocused = qs('#cb-rp-focused');
    const rpRelated = [
        { id: 'rp-style-main', section: 'category-rp-style' },
        { id: 'session-type-main', section: 'category-session-type' },
        { id: 'lore-requirement-main', section: 'category-lore-requirement' }
    ];
    const mustSelect = !rpFocused?.checked;
    if (mustSelect) {
        const rpCriteria = [
            "railroad", "freeform", "sandbox", "narrative-driven", "simulationist", "tactical",
            "voice-rp", "text-based-rp", "mixed-rp",
            "high-lore", "moderate-lore", "low-lore"
        ];
        rpCriteria.forEach(key => {
            if (selectedCriteria.has(key)) selectedCriteria.delete(key);
            const cb = qs(`.criteria-checkbox[data-criteria="${key}"]`);
            if (cb) cb.checked = false;
            const btn = qs(`button[data-key="${key}"]`);
            if (btn) btn.classList.remove('active-sub');
        });
        updateRankingPanel();
    }
    rpRelated.forEach(({ id, section }) => {
        let catSection = section ? qs(`#${section}`) : null;
        if (!catSection) {
            const mainDiv = qs(`#${id}`);
            catSection = mainDiv ? mainDiv.parentElement : null;
        }
        const btn = catSection?.querySelector('button.main-category');
        const disabledMsg = btn?.querySelector('.category-disabled-message');
        if (catSection) {
            if (mustSelect) {
                catSection.classList.add('rp-disabled');
                if (disabledMsg) {
                    disabledMsg.textContent = 'Select "RP-Focused" in Play Style to unlock this category.';
                    disabledMsg.style.display = 'inline-block';
                }
                catSection.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.disabled = true; });
            } else {
                catSection.classList.remove('rp-disabled');
                if (disabledMsg) {
                    disabledMsg.textContent = '';
                    disabledMsg.style.display = 'none';
                }
                catSection.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.disabled = false; });
            }
        }
    });
}

// --- Main Content Loading and Tab Logic ---
async function loadHTMLContent() {
    try {
        const [categoriesHTML, communitiesHTML, submitHTML, aboutHTML] = await Promise.all([
            fetch('html/categories.html').then(res => res.text()),
            fetch('html/communities.html').then( res => res.text()),
            fetch('html/submit.html').then(res => res.text()),
            fetch('html/about.html').then(res => res.text())
        ]);
        qs('#tab-content-categories').innerHTML = categoriesHTML;
        qs('#tab-content-communities').innerHTML = communitiesHTML;
        qs('#tab-content-submit').innerHTML = submitHTML;
        qs('#tab-content-about').innerHTML = aboutHTML;
        initializeFormHandlers();
    } catch (error) {
        console.error('Error loading HTML content:', error);
    }
}

function initializeFormHandlers() {
    if (typeof window.initializeSubmitCategories === 'function') {
        window.initializeSubmitCategories();
    }
}

// --- Communities Rendering (unchanged) ---

// --- Event Setup ---
document.addEventListener('DOMContentLoaded', () => {
    loadHTMLContent().then(() => {
        // Removed: loadDescriptions();
        loadCommunities();
        loadCategoryHeadings();
        qsa('.dropdown-content').forEach(div => { div.style.display = 'none'; });
        qsa('.dropdown-toggle').forEach(btn => { btn.setAttribute('aria-expanded', 'false'); });
        setupCriteriaBtnListeners();
        qsa('.criteria-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const id = checkbox.getAttribute('data-criteria');
                if (checkbox.checked) selectedCriteria.add(id);
                else selectedCriteria.delete(id);
                updateRankingPanel();
            });
        });
        updateRankingPanel();
        // Communities list and tab logic
        let commList = document.getElementById('communities-list');
        if (commList) commList.remove();
        commList = document.createElement('div');
        commList.id = 'communities-list';
        const contentCommunities = document.getElementById('tab-content-communities');
        contentCommunities.appendChild(commList);

        // Tab switching logic - updated for new HTML structure
        const tabCategories = document.getElementById('tab-categories');
        const tabCommunities = document.getElementById('tab-communities');
        const tabSubmit = document.getElementById('tab-submit');
        const tabAbout = document.getElementById('tab-about');
        const contentCategories = document.getElementById('tab-content-categories');
        const contentSubmit = document.getElementById('tab-content-submit');
        const contentAbout = document.getElementById('tab-content-about');

        function showTab(tab) {
            // Update navigation buttons
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
            
            // Update app container class for layout changes
            const appContainer = document.getElementById('app-container');
            appContainer.classList.remove('communities-active', 'submit-active', 'about-active');
            
            // Show selected tab
            switch(tab) {
                case 'categories':
                    tabCategories.classList.add('active');
                    contentCategories.classList.add('active');
                    contentCategories.style.display = 'block';
                    break;
                case 'communities':
                    tabCommunities.classList.add('active');
                    contentCommunities.classList.add('active');
                    contentCommunities.style.display = 'block';
                    appContainer.classList.add('communities-active');
                    // Pre-render communities to avoid animation issues
                    currentCommunityPage = 1;
                    renderCommunitiesPage(currentCommunityPage);
                    break;
                case 'submit':
                    tabSubmit.classList.add('active');
                    contentSubmit.classList.add('active');
                    contentSubmit.style.display = 'block';
                    appContainer.classList.add('submit-active');
                    break;
                case 'about':
                    tabAbout.classList.add('active');
                    contentAbout.classList.add('active');
                    contentAbout.style.display = 'block';
                    appContainer.classList.add('about-active');
                    break;
            }
            
            // Hide other tabs
            document.querySelectorAll('.tab-panel:not(.active)').forEach(panel => {
                panel.style.display = 'none';
            });
            
            // Show/hide sidebar based on tab
            const sidebar = document.getElementById('sidebar');
            if (tab === 'categories') {
                sidebar.style.display = 'flex';
            } else {
                sidebar.style.display = 'none';
            }

            // Always scroll to top of main content on tab switch
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Show default description if on categories tab and no description is visible
            if (tab === 'categories') {
                const panel = document.getElementById('description-panel');
                if (!panel.classList.contains('active') || !panel.innerHTML.trim()) {
                    showDefaultDescription();
                }
            }
        }

        tabCategories.addEventListener('click', () => showTab('categories'));
        tabCommunities.addEventListener('click', () => showTab('communities'));
        tabSubmit.addEventListener('click', () => showTab('submit'));
        tabAbout.addEventListener('click', () => showTab('about'));

        // Initialize with categories tab active
        showTab('categories');

        // RP categories visibility - moved after HTML is loaded
        const rpFocused = document.getElementById('cb-rp-focused');
        if (rpFocused) rpFocused.addEventListener('change', updateRPCategoriesVisibility);
        updateRPCategoriesVisibility();

        // Play Style unlock logic - moved after HTML is loaded
        document.querySelectorAll('#play-style-main .criteria-checkbox').forEach(cb => {
            cb.addEventListener('change', updateCategoryVisibilityBySelection);
        });
        updateCategoryVisibilityBySelection();
    });
});

// --- Click Outside to Collapse ---
document.addEventListener('click', function (e) {
    const isInMainContent = e.target.closest('#main-content');
    const isInSidebar = e.target.closest('#sidebar');
    const isInteractiveElement = e.target.closest('.main-category, .dropdown-content, .criteria-btn, button[data-key], input, label, .nav-btn');
    if (isInMainContent && !isInSidebar && !isInteractiveElement) {
        qsa('.main-category').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
        qsa('.category > .dropdown-content').forEach(div => div.style.display = 'none');
        const panel = qs('#description-panel');
        panel.innerHTML = '';
        panel.classList.remove('active');
        showDefaultDescription();
    }
});

// --- PERFORMANCE ---
const COMMUNITIES_PER_PAGE = 8;
let currentCommunityPage = 1;

function renderCommunitiesPage(page = 1) {
    const commList = document.getElementById('communities-list');
    if (!commList) return;
    
    // Only clear on first page, append on subsequent pages
    if (page === 1) {
        commList.innerHTML = '';
    }
    
    const start = (page - 1) * COMMUNITIES_PER_PAGE;
    const end = start + COMMUNITIES_PER_PAGE;
    const pageCommunities = allCommunities.slice(start, end);
    const frag = document.createDocumentFragment();
    pageCommunities.forEach(comm => {
        const card = document.createElement('div');
        card.className = 'community-card';
        
        // Banner
        const banner = document.createElement('img');
        banner.src = comm.banner || 'https://via.placeholder.com/140x70?text=No+Banner';
        banner.alt = comm.name + " Banner";
        banner.loading = "lazy";
        card.appendChild(banner);
        // Info
        const info = document.createElement('div');
        info.className = 'community-card-info';
        const name = document.createElement('div');
        name.className = 'community-card-title';
        name.textContent = comm.name;
        info.appendChild(name);
        const desc = document.createElement('div');
        desc.className = 'community-card-desc';
        desc.textContent = comm.description;
        info.appendChild(desc);
        // Play Style badges
        const playStyles = ["RP-Focused", "Competitive Multiplayer", "Casual Multiplayer"];
        const playStyleBadges = comm.categories.filter(cat => playStyles.includes(cat));
        if (playStyleBadges.length > 0) {
            const playStyleDiv = document.createElement('div');
            playStyleDiv.className = 'community-card-playstyles';
            playStyleBadges.forEach(ps => {
                const badge = document.createElement('span');
                badge.className = 'community-card-playstyle-badge';
                badge.textContent = ps;
                playStyleDiv.appendChild(badge);
            });
            info.insertBefore(playStyleDiv, info.firstChild.nextSibling);
        }
        // Other tags
        const categoryGroups = [
            { label: "Size", cats: ["Large Communities", "Medium Communities", "Small Communities", "Exclusive Communities"] },
            { label: "Experience", cats: ["Beginner-Friendly", "Intermediate", "Advanced/Expert", "Mixed Skill Level"] },
            { label: "Mods", cats: ["Vanilla", "Lightly Modded", "Heavily Modded"] },
            { label: "Language", cats: ["English-Speaking", "Non-English Speaking", "Multilingual"] },
            { label: "Region", cats: ["Regional Groups", "Global Groups"] },
            { label: "RP Style", cats: ["Railroad", "Freeform", "Sandbox", "Narrative-Driven", "Simulationist", "Tactical"] },
            { label: "Session Type", cats: ["Voice RP", "Text-Based RP", "Mixed"] },
            { label: "Campaigns", cats: ["Single Campaign", "Multiple Campaigns"] },
            { label: "Moderation", cats: ["Strict Moderation", "Relaxed Moderation", "Community-Guided"] },
            { label: "Session Frequency", cats: ["Multiple a Week", "Weekly", "Bi-Monthly", "Monthly", "Other"] },
            { label: "Lore", cats: ["High Lore Demand", "Moderate Lore Demand", "Low Lore Demand"] }
        ];
        let allTags = [];
        categoryGroups.forEach(group => {
            const found = comm.categories.filter(cat => group.cats.includes(cat));
            allTags = allTags.concat(found);
        });
        allTags = allTags.filter(cat => !playStyles.includes(cat));
        if (allTags.length > 0) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'community-card-categories-group';
            allTags.forEach(cat => {
                const span = document.createElement('span');
                span.className = 'community-card-cat';
                span.textContent = cat;
                groupDiv.appendChild(span);
            });
            info.appendChild(groupDiv);
        }
        card.appendChild(info);
        // Actions (Discord button)
        const actions = document.createElement('div');
        actions.className = 'community-card-actions';
        const discordBtn = document.createElement('a');
        discordBtn.href = comm.discord || "#";
        discordBtn.target = "_blank";
        discordBtn.rel = "noopener noreferrer";
        discordBtn.textContent = "Join Discord";
        discordBtn.className = "discord-btn";
        actions.appendChild(discordBtn);
        card.appendChild(actions);
        frag.appendChild(card);
    });
    commList.appendChild(frag);
    
    // Pagination controls
    let pagination = document.getElementById('communities-pagination');
    if (pagination) pagination.remove();
    if (allCommunities.length > end) {
        pagination = document.createElement('div');
        pagination.id = 'communities-pagination';
        pagination.style.textAlign = 'center';
        pagination.style.margin = '2em 0 0 0';
        const btn = document.createElement('button');
        btn.textContent = "Show More";
        btn.style.padding = "0.7em 2em";
        btn.style.fontSize = "1.1em";
        btn.style.borderRadius = "8px";
        btn.style.background = "#ffd700";
        btn.style.color = "#23272b";
        btn.style.fontWeight = "bold";
        btn.style.border = "none";
        btn.style.boxShadow = "0 2px 8px #0002";
        btn.style.cursor = "pointer";
        btn.onclick = function () {
            currentCommunityPage++;
            renderCommunitiesPage(currentCommunityPage);
        };
        pagination.appendChild(btn);
        commList.parentElement.appendChild(pagination);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const rpFocused = document.getElementById('cb-rp-focused');
    if (rpFocused) rpFocused.addEventListener('change', updateRPCategoriesVisibility);
    updateRPCategoriesVisibility();
    function updateCategoryVisibilityBySelection() {
        const tabContent = document.getElementById('tab-content-categories');
        const main = document.querySelector('main');
        const playStyleCheckboxes = document.querySelectorAll('#play-style-main .criteria-checkbox');
        const anyChecked = Array.from(playStyleCheckboxes).some(cb => cb.checked);
        tabContent.classList.toggle('categories-unlocked', anyChecked);
        if (main) main.classList.toggle('only-play-style', !anyChecked);
    }
    document.querySelectorAll('#play-style-main .criteria-checkbox').forEach(cb => {
        cb.addEventListener('change', updateCategoryVisibilityBySelection);
    });
    updateCategoryVisibilityBySelection();
});

// This "double down" function is to ensure the category visibility is updated correctly
function updateCategoryVisibilityBySelection() {
    const tabContent = document.getElementById('tab-content-categories');
    const main = document.querySelector('main');
    const playStyleCheckboxes = document.querySelectorAll('#play-style-main .criteria-checkbox');
    const anyChecked = Array.from(playStyleCheckboxes).some(cb => cb.checked);
    tabContent.classList.toggle('categories-unlocked', anyChecked);
    if (main) main.classList.toggle('only-play-style', !anyChecked);
}

// --- SUBMIT FORM ---
function submitCommunityForm() {
    const msg = document.getElementById('submit-community-message');
    msg.textContent = "Thank you for your submission! Your community will be reviewed.";
    msg.style.color = "#6be672";
    setTimeout(function() {
        document.getElementById('submit-community-form').reset();
        updateSubmitRPCategoriesVisibility();
    }, 10);
    return true;
}





