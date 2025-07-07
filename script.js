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

function loadDescriptions() {
    fetch('descriptions.json')
        .then(res => res.json())
        .then(data => { descriptions = data; });
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
    const fallbackDescriptions = {
        // Play Style
        "rp-focused": "Communities focused on role-play and collaborative storytelling.",
        "competitive-multiplayer": "Communities centered on competitive multiplayer gameplay.",
        "casual-multiplayer": "Communities for relaxed, casual multiplayer experiences.",
        // Community Size
        "large-communities": "Communities with more than 100 active members.",
        "medium-communities": "Communities with between 50-100 active members.",
        "small-communities": "Communities with fewer than 50 active members.",
        "exclusive-communities": "Communities with limited or invite-only membership.",
        // Experience Level
        "beginner-friendly": "Communities open to new players, offering basic guidance and a friendly learning environment.",
        "intermediate": "Communities for players with some experience looking to improve their storytelling and skills.",
        "advanced-expert": "Communities for veterans who prefer complex lore, deep narratives, and advanced role-play.",
        "mixed-skill": "Communities accepting all experience levels, ensuring balanced opportunities for everyone.",
        // Mod Usage
        "vanilla": "Communities using only base Stellaris, with no required mods.",
        "lightly-modded": "Communities that employ a few minor or cosmetic mods for a smoother experience.",
        "heavily-modded": "Communities featuring extensive mod lists that add mechanics, lore, or new content.",
        // Language
        "english-speaking": "Communities primarily using English for their communication.",
        "non-english-speaking": "Communities that use languages other than English for all interactions. Such as: french, spanish, german, etc.",
        "multilingual": "Communities open to multiple languages.",
        // Geographic Region
        "regional-groups": "Communities organized by region or country, aligning time zones.",
        "global-groups": "Communities uniting players worldwide.",
        // RP Style
        "railroad": "Communities driven by preset story arcs, guided by a game master with limited player freedom.",
        "freeform": "Communities with minimal constraints, offering broad creative freedom for players.",
        "sandbox": "Communities where open-ended exploration leads to emergent storytelling.",
        "narrative-driven": "Communities emphasizing collaborative storytelling, character arcs, and plot depth.",
        "simulationist": "Communities that focus on realism, in-universe consistency, and logical world-building.",
        "tactical": "Communities centered on strategy, competitive elements, and in-game tactics.",
        // Session Type
        "voice-rp": "Communities conducting real-time sessions via voice chat for immersive interactions.",
        "text-based-rp": "Communities using text for role-play, either in chats or forums, often asynchronously.",
        "mixed-rp": "Communities allowing both voice and text RP, granting players flexible engagement.",
        // Concurrent Campaigns
        "single-campaign": "Communities with a single main campaign hosted by one organizer.",
        "multiple-campaigns": "Communities where multiple campaigns run concurrently, often managed by different hosts.",
        // Writing Activity and Volume
        "high-activity": "Communities that progress quickly, ideal for those wanting frequent engagement.",
        "moderate-activity": "Communities with steady pacing, balancing regular posts and thoughtful participation.",
        "low-activity": "Communities where posts are infrequent, allowing a relaxed, long-term approach to RP.",
        // Lore Requirement
        "high-lore": "Communities expecting in-depth lore documents and consistent canon.",
        "moderate-lore": "Communities that value lore lore documents but allow flexible writing and expansion.",
        "low-lore": "Communities where a lore-demand is not enforced, focusing on spontanious lore expansion instead.",
        // Moderation Style
        "strict-moderation": "Communities where the hosts control all aspects of the Community themselves. This includes rules, mods, etc.",
        "relaxed-moderation": "Communities with light administrative involvement, the community is being involved on major decicions.",
        "community-guided": "Communities shaped by group input, jointly managing rules and direction.",
        // Session Frequency
        "multiple-a-week": "Communities meeting multiple times a week for frequent engagement.",
        "weekly": "Communities running sessions every week, keeping a predictable schedule.",
        "bi-monthly": "Communities meeting every two weeks, striking a balance between regularity and flexibility.",
        "monthly": "Communities scheduling one session a month, suitable for busier participants.",
        "other-session-frequency": "Communities with alternative or irregular scheduling, such as event-based sessions."
    };
    let desc = fallbackDescriptions[key] || '';
    const panel = document.getElementById('description-panel');
    const anyExpanded = Array.from(document.querySelectorAll('.main-category')).some(btn => btn.getAttribute('aria-expanded') === 'true');
    if (desc && anyExpanded) {
        // Info icon absolutely positioned in panel
        panel.innerHTML = `<span class="info-icon">&#9432;</span><div style="position:relative;">${desc}</div>`;
        panel.classList.add('active');
    } else {
        panel.innerHTML = '';
        panel.classList.remove('active');
        button.classList.remove('active-desc');
        if (icon) icon.remove();
    }
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
    document.querySelectorAll('.dropdown-content').forEach(div => {
        div.style.display = 'none';
    });
    document.querySelectorAll('.dropdown-toggle').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
    });
});

const communities = [
    {
        name: "Test Community 1",
        criteria: [
            "rp-focused", "large-communities", "beginner-friendly", "vanilla", "english-speaking",
            "global-groups", "freeform", "text-based-rp", "multiple-campaigns",
            "moderate-activity", "moderate-lore", "relaxed-moderation", "weekly"
        ]
    },
    {
        name: "Test Community 2",
        criteria: [
            "competitive-multiplayer", "medium-communities", "advanced-expert", "lightly-modded", "english-speaking",
            "regional-groups", "tactical", "voice-rp", "single-campaign",
            "high-activity", "high-lore", "strict-moderation", "multiple-a-week"
        ]
    },
    {
        name: "Test Community 3",
        criteria: [
            "casual-multiplayer", "small-communities", "mixed-skill", "vanilla", "multilingual",
            "global-groups", "sandbox", "text-based-rp", "multiple-campaigns",
            "low-activity", "low-lore", "community-guided", "monthly"
        ]
    }
];

const categoryHeadings = {
    "rp-focused": "Play Style",
    "competitive-multiplayer": "Play Style",
    "casual-multiplayer": "Play Style",
    "large-communities": "Community Size",
    "medium-communities": "Community Size",
    "small-communities": "Community Size",
    "exclusive-communities": "Community Size",
    "beginner-friendly": "Required Player Experience Level",
    "intermediate": "Required Player Experience Level",
    "advanced-expert": "Required Player Experience Level",
    "mixed-skill": "Required Player Experience Level",
    "vanilla": "Mod Usage",
    "lightly-modded": "Mod Usage",
    "heavily-modded": "Mod Usage",
    "english-speaking": "Language",
    "non-english-speaking": "Language",
    "multilingual": "Language",
    "regional-groups": "Geographic Region",
    "global-groups": "Geographic Region",
    "railroad": "RP Style",
    "freeform": "RP Style",
    "sandbox": "RP Style",
    "narrative-driven": "RP Style",
    "simulationist": "RP Style",
    "tactical": "RP Style",
    "voice-rp": "Session Type",
    "text-based-rp": "Session Type",
    "mixed-rp": "Session Type",
    "single-campaign": "Concurrent Campaigns",
    "multiple-campaigns": "Concurrent Campaigns",
    "high-activity": "Writing Activity and Volume",
    "moderate-activity": "Writing Activity and Volume",
    "low-activity": "Writing Activity and Volume",
    "high-lore": "Lore Requirement",
    "moderate-lore": "Lore Requirement",
    "low-lore": "Lore Requirement",
    "strict-moderation": "Moderation Style",
    "relaxed-moderation": "Moderation Style",
    "community-guided": "Moderation Style",
    "multiple-a-week": "Session Frequency",
    "weekly": "Session Frequency",
    "bi-monthly": "Session Frequency",
    "monthly": "Session Frequency",
    "other-session-frequency": "Session Frequency"
};

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
        let ranked = communities.map(comm => {
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

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button[data-key]:not(.main-category)').forEach(btn => {
        btn.addEventListener('click', function () {
            showDescription(btn);
        });
    });
    updateRankingPanel();
});

document.addEventListener('DOMContentLoaded', () => {
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
});

document.addEventListener('DOMContentLoaded', () => {
    const rankingPanel = document.getElementById('ranking-panel');
    const rankingBtn = document.getElementById('ranking-toggle-btn');
    let rankingVisible = true; // Start opened

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
        if (rankingVisible) {
            rankingPanel.classList.remove('hide');
        } else {
            rankingPanel.classList.add('hide');
        }
        updateRankingBtn();
    });

    // Show panel by default
    rankingPanel.classList.remove('hide');
    updateRankingBtn();
});

const allCommunities = [
    {
        name: "Test Community 1",
        description: "test",
        categories: [
            "RP-Focused", "Large Communities", "Beginner-Friendly", "Vanilla", "English-Speaking",
            "Global Groups", "Freeform", "Text-Based RP", "Multiple Campaigns",
            "Moderate Activity", "Moderate Lore Demand", "Relaxed Moderation", "Weekly"
        ]
    },
    {
        name: "Test Community 2",
        description: "test",
        categories: [
            "Competitive Multiplayer", "Medium Communities", "Advanced/Expert", "Lightly Modded", "English-Speaking",
            "Regional Groups", "Tactical", "Voice RP", "Single Campaign",
            "High Activity", "High Lore Demand", "Strict Moderation", "Multiple a Week"
        ]
    },
    {
        name: "Test Community 3",
        description: "test",
        categories: [
            "Casual Multiplayer", "Small Communities", "Mixed Skill Level", "Vanilla", "Multilingual",
            "Global Groups", "Sandbox", "Text-Based RP", "Multiple Campaigns",
            "Low Activity", "Low Lore Demand", "Community-Guided", "Monthly"
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const tabCategories = document.getElementById('tab-categories');
    const tabCommunities = document.getElementById('tab-communities');
    const tabSubmit = document.getElementById('tab-submit');
    const tabAbout = document.getElementById('tab-about');
    const contentCategories = document.getElementById('tab-content-categories');
    const contentCommunities = document.getElementById('tab-content-communities');
    const contentSubmit = document.getElementById('tab-content-submit');
    const contentAbout = document.getElementById('tab-content-about');
    const rankingPanel = document.getElementById('ranking-panel');
    const rankingBtn = document.getElementById('ranking-toggle-btn');
    const descriptionPanel = document.getElementById('description-panel');

    tabCategories.addEventListener('click', () => {
        tabCategories.classList.add('active');
        tabCommunities.classList.remove('active');
        tabSubmit.classList.remove('active');
        tabAbout.classList.remove('active');
        contentCategories.style.display = '';
        contentCommunities.style.display = 'none';
        contentSubmit.style.display = 'none';
        contentAbout.style.display = 'none';
        if (rankingBtn) rankingBtn.style.display = '';
        if (rankingPanel) rankingPanel.style.display = '';
        if (descriptionPanel) descriptionPanel.style.display = '';
    });
    tabCommunities.addEventListener('click', () => {
        tabCategories.classList.remove('active');
        tabCommunities.classList.add('active');
        tabSubmit.classList.remove('active');
        tabAbout.classList.remove('active');
        contentCategories.style.display = 'none';
        contentCommunities.style.display = '';
        contentSubmit.style.display = 'none';
        contentAbout.style.display = 'none';
        if (rankingBtn) rankingBtn.style.display = 'none';
        if (rankingPanel) rankingPanel.style.display = 'none';
        if (descriptionPanel) descriptionPanel.style.display = 'none';
    });
    tabSubmit.addEventListener('click', () => {
        tabCategories.classList.remove('active');
        tabCommunities.classList.remove('active');
        tabSubmit.classList.add('active');
        tabAbout.classList.remove('active');
        contentCategories.style.display = 'none';
        contentCommunities.style.display = 'none';
        contentSubmit.style.display = '';
        contentAbout.style.display = 'none';
        if (rankingBtn) rankingBtn.style.display = 'none';
        if (rankingPanel) rankingPanel.style.display = 'none';
        if (descriptionPanel) descriptionPanel.style.display = 'none';
    });
    tabAbout.addEventListener('click', () => {
        tabCategories.classList.remove('active');
        tabCommunities.classList.remove('active');
        tabSubmit.classList.remove('active');
        tabAbout.classList.add('active');
        contentCategories.style.display = 'none';
        contentCommunities.style.display = 'none';
        contentSubmit.style.display = 'none';
        contentAbout.style.display = '';
        if (rankingBtn) rankingBtn.style.display = 'none';
        if (rankingPanel) rankingPanel.style.display = 'none';
        if (descriptionPanel) descriptionPanel.style.display = 'none';
    });

    const tbody = document.querySelector('#communities-table tbody');
    tbody.innerHTML = '';
    allCommunities.forEach(comm => {
        const tr = document.createElement('tr');
        const tdName = document.createElement('td');
        tdName.textContent = comm.name;
        const tdDesc = document.createElement('td');
        tdDesc.textContent = comm.description;
        const tdCats = document.createElement('td');
        tdCats.innerHTML = comm.categories.map(cat => `<span class="community-cat">${cat}</span>`).join(', ');
        tr.appendChild(tdName);
        tr.appendChild(tdDesc);
        tr.appendChild(tdCats);
        tbody.appendChild(tr);
    });
});

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

function updateRPCategoriesVisibility() {
    const rpFocused = document.getElementById('cb-rp-focused');
    const rpRelated = [
        { id: 'rp-style-main', section: 'category-rp-style' },
        { id: 'writing-activity-main', section: 'category-writing-activity' },
        { id: 'lore-requirement-main', section: 'category-lore-requirement' }
    ];
    const mustSelect = !rpFocused?.checked;

    if (mustSelect) {
        const rpCriteria = [
            "railroad", "freeform", "sandbox", "narrative-driven", "simulationist", "tactical",
            "high-activity", "moderate-activity", "low-activity",
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
        const catSection = document.getElementById(section);
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

document.addEventListener('DOMContentLoaded', () => {
    const rpFocused = document.getElementById('cb-rp-focused');
    if (rpFocused) rpFocused.addEventListener('change', updateRPCategoriesVisibility);
    updateRPCategoriesVisibility();

    function updateCategoryVisibilityBySelection() {
        const tabContent = document.getElementById('tab-content-categories');
        const main = document.querySelector('main');
        const playStyleCheckboxes = document.querySelectorAll('#play-style-main .criteria-checkbox');
        const anyChecked = Array.from(playStyleCheckboxes).some(cb => cb.checked);
        if (anyChecked) {
            tabContent.classList.add('categories-unlocked');
            if (main) main.classList.remove('only-play-style');
        } else {
            tabContent.classList.remove('categories-unlocked');
            if (main) main.classList.add('only-play-style');
        }
    }

    document.querySelectorAll('#play-style-main .criteria-checkbox').forEach(cb => {
        cb.addEventListener('change', updateCategoryVisibilityBySelection);
    });
    updateCategoryVisibilityBySelection();
});