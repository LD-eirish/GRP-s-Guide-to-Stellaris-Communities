function toggleDropdown(id) {
    const content = document.getElementById(id);
    const button = document.querySelector(`button[aria-controls="${id}"]`);
    const expanded = button.getAttribute('aria-expanded') === 'true';
    if (button.classList.contains('main-category')) {
        document.querySelectorAll('.main-category').forEach(btn => {
            btn.setAttribute('aria-expanded', 'false');
            btn.classList.remove('dropdown-open');
        });
        document.querySelectorAll('.category > .dropdown-content').forEach(div => {
            div.style.display = 'none';
        });
        if (!expanded) {
            button.setAttribute('aria-expanded', 'true');
            content.style.display = 'block';
            button.classList.add('dropdown-open');
        }
        setTimeout(() => {
            const anyExpanded = Array.from(document.querySelectorAll('.main-category')).some(btn => btn.getAttribute('aria-expanded') === 'true');
            if (!anyExpanded) {
                const panel = document.getElementById('description-panel');
                panel.innerHTML = '';
                panel.classList.remove('active');
            }
        }, 0);
    } else {
        const parent = button.parentElement;
        parent.querySelectorAll('.dropdown-toggle').forEach(btn => {
            if (btn !== button) {
                btn.setAttribute('aria-expanded', 'false');
                btn.classList.remove('dropdown-open');
            }
        });
        parent.querySelectorAll('.dropdown-content').forEach(div => {
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

let descriptions = {};
let allCommunities = [];
let categoryHeadings = {};

function loadDescriptions() {
    fetch('descriptions.json')
        .then(res => res.json())
        .then(data => {
            descriptions = data;
        })
        .catch(error => {
            console.error('Error loading descriptions:', error);
        });
}

function loadCommunities() {
    fetch('communities.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allCommunities = data;
            renderCommunitiesPage(currentCommunityPage);
        })
        .catch(error => {
            console.error('Error loading communities:', error);
        });
}

function loadCategoryHeadings() {
    fetch('categoryHeadings.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            categoryHeadings = data;
        })
        .catch(error => {
            console.error('Error loading category headings:', error);
        });
}

function showDescription(button) {
    document.querySelectorAll('.subcategory-btn.active-desc').forEach(btn => {
        btn.classList.remove('active-desc');
    });
    document.querySelectorAll('.info-icon').forEach(icon => icon.remove());
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
    const panel = document.getElementById('description-panel');
    const anyExpanded = Array.from(document.querySelectorAll('.main-category')).some(btn => btn.getAttribute('aria-expanded') === 'true');
    if (anyExpanded) {
        panel.innerHTML = `<span class="info-icon">&#9432;</span><div style="position:relative;">Loading description...</div>`;
        panel.classList.add('active');
    } else {
        panel.innerHTML = '';
        panel.classList.remove('active');
        button.classList.remove('active-desc');
        if (icon) icon.remove();
        return;
    }

    fetch('fallbackDescriptions.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(fallbackDescriptions => {
            let desc = fallbackDescriptions[key] || 'No description available.';
            panel.innerHTML = `<span class="info-icon">&#9432;</span><div style="position:relative;">${desc}</div>`;
        })
        .catch(error => {
            console.error('Error loading fallback descriptions:', error);
            panel.innerHTML = `<span class="info-icon">&#9432;</span><div style="position:relative;">Failed to load description.</div>`;
        });
}

document.querySelectorAll('.dropdown-toggle:not(.main-category)').forEach(btn => {
    btn.addEventListener('click', function() {
        if (btn.getAttribute('aria-expanded') === 'false') {
            const panel = document.getElementById('description-panel');
            panel.innerHTML = '';
            panel.classList.remove('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    loadDescriptions();
    loadCommunities();
    loadCategoryHeadings();

    document.querySelectorAll('.dropdown-content').forEach(div => {
        div.style.display = 'none';
    });
    document.querySelectorAll('.dropdown-toggle').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('button[data-key]:not(.main-category)').forEach(btn => {
        btn.addEventListener('click', function () {
            showDescription(btn);
        });
    });
    document.querySelectorAll('.criteria-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const id = checkbox.getAttribute('data-criteria');
            if (checkbox.checked) {
                selectedCriteria.add(id);
            } else {
                selectedCriteria.delete(id);
            }
            updateRankingPanel();
        });
    });
    updateRankingPanel();

    // Ranking panel toggle
    const rankingPanel = document.getElementById('ranking-panel');
    const rankingBtn = document.getElementById('ranking-toggle-btn');
    let rankingVisible = true;

    function updateRankingBtn() {
        if (rankingVisible) {
            rankingBtn.textContent = "Hide Matches";
            rankingBtn.classList.add('active');
        } else {
            rankingBtn.textContent = "Show Matches";
            rankingBtn.classList.remove('active');
        }
        rankingBtn.setAttribute('aria-expanded', rankingVisible ? 'true' : 'false');
    }

    rankingBtn.addEventListener('click', () => {
        rankingVisible = !rankingVisible;
        rankingPanel.classList.toggle('hide', !rankingVisible);
        updateRankingBtn();
    });

    rankingPanel.classList.remove('hide');
    updateRankingBtn();

    // Communities list and tab logic
    let commList = document.getElementById('communities-list');
    if (commList) commList.remove();
    commList = document.createElement('div');
    commList.id = 'communities-list';
    const contentCommunities = document.getElementById('tab-content-communities');
    contentCommunities.appendChild(commList);

    // Tab switching logic
    const tabCategories = document.getElementById('tab-categories');
    const tabCommunities = document.getElementById('tab-communities');
    const tabSubmit = document.getElementById('tab-submit');
    const tabAbout = document.getElementById('tab-about');
    const contentCategories = document.getElementById('tab-content-categories');
    const contentSubmit = document.getElementById('tab-content-submit');
    const contentAbout = document.getElementById('tab-content-about');
    const descriptionPanel = document.getElementById('description-panel');

    function showTab(tab) {
        tabCategories.classList.toggle('active', tab === 'categories');
        tabCommunities.classList.toggle('active', tab === 'communities');
        tabSubmit.classList.toggle('active', tab === 'submit');
        tabAbout.classList.toggle('active', tab === 'about');
        contentCategories.style.display = tab === 'categories' ? '' : 'none';
        contentCommunities.style.display = tab === 'communities' ? '' : 'none';
        contentSubmit.style.display = tab === 'submit' ? '' : 'none';
        contentAbout.style.display = tab === 'about' ? '' : 'none';
        if (rankingBtn) rankingBtn.style.display = tab === 'categories' ? '' : 'none';
        if (rankingPanel) rankingPanel.style.display = tab === 'categories' ? '' : 'none';
        if (descriptionPanel) descriptionPanel.style.display = tab === 'categories' ? '' : 'none';
        document.body.classList.toggle('communities-expanded', tab === 'communities');
        if (tab === 'communities') {
            currentCommunityPage = 1;
            renderCommunitiesPage(currentCommunityPage);
        }
    }

    tabCategories.addEventListener('click', () => showTab('categories'));
    tabCommunities.addEventListener('click', () => showTab('communities'));
    tabSubmit.addEventListener('click', () => showTab('submit'));
    tabAbout.addEventListener('click', () => showTab('about'));

    // RP categories visibility
    const rpFocused = document.getElementById('cb-rp-focused');
    if (rpFocused) rpFocused.addEventListener('change', updateRPCategoriesVisibility);
    updateRPCategoriesVisibility();

    // Play Style unlock logic
    document.querySelectorAll('#play-style-main .criteria-checkbox').forEach(cb => {
        cb.addEventListener('change', updateCategoryVisibilityBySelection);
    });
    updateCategoryVisibilityBySelection();
});

let selectedCriteria = new Set();

function updateRankingPanel() {
    const selectedList = document.getElementById('selected-criteria');
    selectedList.innerHTML = '';
    const selectedArr = Array.from(selectedCriteria);
    const maxVisible = 5;
    selectedArr.slice(0, maxVisible).forEach(id => {
        const btn = document.querySelector(`button[data-key="${id}"]`);
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
            const cb = document.querySelector(`.criteria-checkbox[data-criteria="${id}"]`);
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
    document.querySelectorAll('.criteria-checkbox').forEach(cb => {
        const id = cb.getAttribute('data-criteria');
        cb.checked = selectedCriteria.has(id);
        const btn = document.querySelector(`button[data-key="${id}"]`);
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
    const descBtn = document.querySelector('.subcategory-btn.active-desc');
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
    let results = '';
    if (selectedCriteria.size > 0) {
        let ranked = allCommunities.map(comm => {
            let score = comm.criteria.filter(c => selectedCriteria.has(c)).length;
            return { name: comm.name, score, total: comm.criteria.length };
        });
        ranked.sort((a, b) => b.score - a.score);
        results = '<strong>Best Matches:</strong><ul>';
        ranked.forEach(r => {
            results += `<li>${r.name}: <b>${r.score}</b> / ${r.total} match${r.score === 1 ? '' : 'es'}</li>`;
        });
        results += '</ul>';
    } else {
        results = '<em>Select sub-categories to see your best matches.</em>';
    }
    document.getElementById('ranking-results').innerHTML = results;
}

function updateRPCategoriesVisibility() {
    const rpFocused = document.getElementById('cb-rp-focused');
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
            if (selectedCriteria.has(key)) {
                selectedCriteria.delete(key);
            }
            const cb = document.querySelector(`.criteria-checkbox[data-criteria="${key}"]`);
            if (cb) cb.checked = false;
            const btn = document.querySelector(`button[data-key="${key}"]`);
            if (btn) btn.classList.remove('active-sub');
        });
        updateRankingPanel();
    }
    rpRelated.forEach(({ id, section }) => {
        let catSection = section ? document.getElementById(section) : null;
        if (!catSection) {
            const mainDiv = document.getElementById(id);
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
                catSection.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.disabled = true;
                });
            } else {
                catSection.classList.remove('rp-disabled');
                if (disabledMsg) {
                    disabledMsg.textContent = '';
                    disabledMsg.style.display = 'none';
                }
                catSection.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.disabled = false;
                });
            }
        }
    });
}

document.addEventListener('click', function (e) {
    const isInside = e.target.closest('.main-category, .dropdown-content, .subcategory-btn, button[data-key], #ranking-toggle-btn, #ranking-panel');
    if (!isInside) {
        document.querySelectorAll('.main-category').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
        document.querySelectorAll('.category > .dropdown-content').forEach(div => div.style.display = 'none');
        const panel = document.getElementById('description-panel');
        panel.innerHTML = '';
        panel.classList.remove('active');
    }
});

// --- PERFORMANCE ---
const COMMUNITIES_PER_PAGE = 8;
let currentCommunityPage = 1;

function renderCommunitiesPage(page = 1) {
    const commList = document.getElementById('communities-list');
    if (!commList) return;
    commList.innerHTML = '';
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
