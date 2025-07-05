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
    // Try both data-description and fallback to data-key for Play Style/Community Size
    let desc = button.getAttribute('data-description');
    if (!desc) {
        // Try to get a description from the key (for Play Style/Community Size)
        const key = button.getAttribute('data-key');
        const fallbackDescriptions = {
            "rp-focused": "Communities focused on role-play and collaborative storytelling.",
            "competitive-multiplayer": "Communities centered on competitive multiplayer gameplay.",
            "casual-multiplayer": "Communities for relaxed, casual multiplayer experiences.",
            "large-communities": "Communities with more than 100 active members.",
            "medium-communities": "Communities with between 50-100 active members.",
            "small-communities": "Communities with fewer than 50 active members.",
            "exclusive-communities": "Communities with limited or invite-only membership."
        };
        desc = fallbackDescriptions[key] || '';
    }
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
    selectedCriteria.forEach(id => {
        // Find the button to get the text
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