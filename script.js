function toggleDropdown(id) {
    const content = document.getElementById(id);
    const button = document.querySelector(`button[aria-controls="${id}"]`);
    const expanded = button.getAttribute('aria-expanded') === 'true';

    // If this is a main category dropdown
    if (button.classList.contains('main-category')) {
        // Close all main category dropdowns
        document.querySelectorAll('.main-category').forEach(btn => {
            btn.setAttribute('aria-expanded', 'false');
        });
        document.querySelectorAll('.category > .dropdown-content').forEach(div => {
            div.style.display = 'none';
        });
        // Open if not already expanded
        if (!expanded) {
            button.setAttribute('aria-expanded', 'true');
            content.style.display = 'block';
        }
        // Hide description panel if all main categories are collapsed
        setTimeout(() => {
            const anyExpanded = Array.from(document.querySelectorAll('.main-category')).some(btn => btn.getAttribute('aria-expanded') === 'true');
            if (!anyExpanded) {
                const panel = document.getElementById('description-panel');
                panel.innerHTML = '';
                panel.classList.remove('active');
            }
        }, 0);
    } else {
        // Sub-category dropdowns: only close siblings, not all
        const parent = button.parentElement;
        parent.querySelectorAll('.dropdown-toggle').forEach(btn => {
            if (btn !== button) btn.setAttribute('aria-expanded', 'false');
        });
        parent.querySelectorAll('.dropdown-content').forEach(div => {
            if (div !== content) div.style.display = 'none';
        });
        if (!expanded) {
            button.setAttribute('aria-expanded', 'true');
            content.style.display = 'block';
        } else {
            button.setAttribute('aria-expanded', 'false');
            content.style.display = 'none';
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
    // Remove active-sub from all sub-category buttons
    document.querySelectorAll('.subcategory-btn.active-sub, button[data-key].active-sub').forEach(btn => {
        btn.classList.remove('active-sub');
    });
    // Add active-sub to the current button
    button.classList.add('active-sub');
    // Use fallbackDescriptions for all categories
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
        "english-speaking": "Communities primarily using English for role-play and general interaction.",
        "non-english-speaking": "Communities that use languages other than English for all RP and discussions. Such as: french, spanish, german, etc.",
        "multilingual": "Communities open to multiple languages, fostering an international environment.",
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
        "high-lore": "Communities expecting in-depth Stellaris lore knowledge and consistent canon.",
        "moderate-lore": "Communities that value lore familiarity but allow flexible interpretations.",
        "low-lore": "Communities where lore is not enforced, focusing instead on creative fun.",
        // Moderation Style
        "strict-moderation": "Communities with clear rules and active oversight to maintain civility and order.",
        "relaxed-moderation": "Communities with light administrative involvement, relying on trust and self-control.",
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
    // Only show if any main category is expanded
    const anyExpanded = Array.from(document.querySelectorAll('.main-category')).some(btn => btn.getAttribute('aria-expanded') === 'true');
    if (desc && anyExpanded) {
        panel.innerHTML = desc;
        panel.classList.add('active');
    } else {
        panel.innerHTML = '';
        panel.classList.remove('active');
    }
}

// Optionally, hide the description panel and emoji when closing a sub-category
document.querySelectorAll('.dropdown-toggle:not(.main-category)').forEach(btn => {
    btn.addEventListener('click', function() {
        if (btn.getAttribute('aria-expanded') === 'false') {
            const panel = document.getElementById('description-panel');
            panel.innerHTML = '';
            panel.classList.remove('active');
            btn.classList.remove('active-sub');
        }
    });
});

// On page load, close all dropdowns
document.addEventListener('DOMContentLoaded', () => {
    loadDescriptions();
    document.querySelectorAll('.dropdown-content').forEach(div => {
        div.style.display = 'none';
    });
    document.querySelectorAll('.dropdown-toggle').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
    });
});

// --- Point & Ranking System ---

// Example community data (replace with real data as needed)
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

// Track selected sub-categories
let selectedCriteria = new Set();

function updateRankingPanel() {
    const selectedList = document.getElementById('selected-criteria');
    selectedList.innerHTML = '';
    const selectedArr = Array.from(selectedCriteria);
    const maxVisible = 5;

    selectedArr.slice(0, maxVisible).forEach(id => {
        const btn = document.querySelector(`button[data-key="${id}"]`);
        const text = btn ? btn.textContent.trim() : id;
        const li = document.createElement('li');
        li.textContent = text;
        li.style.cursor = 'pointer';
        li.title = 'Click to unselect';
        li.addEventListener('click', function() {
            selectedCriteria.delete(id);
            if (btn) btn.classList.remove('active-sub');
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

    // Remove green border from all buttons not in selectedCriteria
    document.querySelectorAll('button[data-key]:not(.main-category)').forEach(btn => {
        const id = btn.getAttribute('data-key');
        if (!selectedCriteria.has(id)) {
            btn.classList.remove('active-sub');
        }
    });

    // Calculate ranking for each community
    let results = '';
    if (selectedCriteria.size > 0) {
        let ranked = communities.map(comm => {
            // Score: number of matching criteria
            let score = comm.criteria.filter(c => selectedCriteria.has(c)).length;
            return { name: comm.name, score, total: comm.criteria.length };
        });
        // Sort by score descending
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

// Add or remove criteria on checkbox change
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

// --- Ranking Panel Toggle I ---
document.addEventListener('DOMContentLoaded', () => {
    // Ranking panel toggle logic
    const rankingPanel = document.getElementById('ranking-panel');
    const rankingBtn = document.getElementById('ranking-toggle-btn');
    let rankingVisible = false;
    function updateRankingBtn() {
        rankingBtn.textContent = rankingVisible ? "Matches" : "Matches";
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
    // Hide panel by default
    rankingPanel.classList.add('hide');
    updateRankingBtn();
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button[data-key]:not(.main-category)').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const id = btn.getAttribute('data-key');
            if (selectedCriteria.has(id)) {
                selectedCriteria.delete(id);
                btn.classList.remove('active-sub');
            } else {
                selectedCriteria.add(id);
                btn.classList.add('active-sub');
            }
            updateRankingPanel();
            showDescription(btn);
        });
    });
    updateRankingPanel();
});

// --- Communities Table Data ---
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

// --- Tab Switch Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const tabCategories = document.getElementById('tab-categories');
    const tabCommunities = document.getElementById('tab-communities');
    const contentCategories = document.getElementById('tab-content-categories');
    const contentCommunities = document.getElementById('tab-content-communities');
    const rankingPanel = document.getElementById('ranking-panel');
    const rankingBtn = document.getElementById('ranking-toggle-btn');
    const descriptionPanel = document.getElementById('description-panel');

    tabCategories.addEventListener('click', () => {
        tabCategories.classList.add('active');
        tabCommunities.classList.remove('active');
        contentCategories.style.display = '';
        contentCommunities.style.display = 'none';
        // Show matching button and description panel
        if (rankingBtn) rankingBtn.style.display = '';
        if (rankingPanel) rankingPanel.style.display = '';
        if (descriptionPanel) descriptionPanel.style.display = '';
    });
    tabCommunities.addEventListener('click', () => {
        tabCategories.classList.remove('active');
        tabCommunities.classList.add('active');
        contentCategories.style.display = 'none';
        contentCommunities.style.display = '';
        // Hide matching button and description panel
        if (rankingBtn) rankingBtn.style.display = 'none';
        if (rankingPanel) rankingPanel.style.display = 'none';
        if (descriptionPanel) descriptionPanel.style.display = 'none';
    });

    // Populate communities table
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

// Also hide the description panel if all main categories are collapsed (e.g. user clicks outside)
document.addEventListener('click', function (e) {
    // If click is outside any .main-category or .dropdown-content
    const isInside = e.target.closest('.main-category, .dropdown-content, .subcategory-btn, button[data-key]');
    if (!isInside) {
        // Collapse all main categories
        document.querySelectorAll('.main-category').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
        document.querySelectorAll('.category > .dropdown-content').forEach(div => div.style.display = 'none');
        // Hide description panel
        const panel = document.getElementById('description-panel');
        panel.innerHTML = '';
        panel.classList.remove('active');
    }
});