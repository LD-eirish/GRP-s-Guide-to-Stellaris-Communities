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
    document.querySelectorAll('.subcategory-btn.active-sub').forEach(btn => {
        btn.classList.remove('active-sub');
    });
    // Add active-sub to the current button
    button.classList.add('active-sub');
    const desc = button.getAttribute('data-description') || '';
    const panel = document.getElementById('description-panel');
    if (desc) {
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
        name: "Galactic Roleplayers",
        criteria: [
            "rp-focused", "large-communities", "beginner-friendly", "vanilla", "english-speaking",
            "global-groups", "freeform", "text-based-rp", "multiple-campaigns",
            "moderate-activity", "moderate-lore", "relaxed-moderation", "weekly"
        ]
    },
    {
        name: "Stellaris Tacticians",
        criteria: [
            "competitive-multiplayer", "medium-communities", "advanced-expert", "lightly-modded", "english-speaking",
            "regional-groups", "tactical", "voice-rp", "single-campaign",
            "high-activity", "high-lore", "strict-moderation", "multiple-a-week"
        ]
    },
    {
        name: "Casual Cosmos",
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
        const btn = document.querySelector(`button[aria-controls="${id}"], .subcategory-btn[data-id="${id}"]`);
        const label = btn ? btn.textContent.trim() : id;
        const li = document.createElement('li');
        li.textContent = label;
        li.style.cursor = 'pointer';
        li.title = 'Click to unselect';
        li.addEventListener('click', function() {
            selectedCriteria.delete(id);
            // Remove active state from button if present
            if (btn) btn.classList.remove('active-sub');
            updateRankingPanel();
        });
        selectedList.appendChild(li);
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

// Add or remove criteria on sub-category click
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.dropdown-toggle:not(.main-category)').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const id = btn.getAttribute('aria-controls');
            // Only toggle if opening (not closing)
            if (btn.getAttribute('aria-expanded') === 'false') {
                selectedCriteria.delete(id);
            } else {
                selectedCriteria.add(id);
            }
            updateRankingPanel();
        });
    });
    updateRankingPanel();
});

// --- Ranking Panel Toggle ---
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