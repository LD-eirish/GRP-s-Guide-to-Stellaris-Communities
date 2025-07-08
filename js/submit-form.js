const SUBMIT_CATEGORIES = {
  'play-style': {
    title: 'Play Style',
    required: true,
    options: [
      { value: 'RP-Focused', label: 'RP-Focused', id: 'submit-rp-focused' },
      { value: 'Competitive Multiplayer', label: 'Competitive Multiplayer' },
      { value: 'Casual Multiplayer', label: 'Casual Multiplayer' }
    ]
  },
  'rp-style': {
    title: 'RP Style',
    dependsOn: 'submit-rp-focused',
    options: [
      { value: 'Railroad', label: 'Railroad' },
      { value: 'Freeform', label: 'Freeform' },
      { value: 'Sandbox', label: 'Sandbox' },
      { value: 'Narrative-Driven', label: 'Narrative-Driven' },
      { value: 'Simulationist', label: 'Simulationist' },
      { value: 'Tactical', label: 'Tactical' }
    ]
  },
  'session-type': {
    title: 'Session Type',
    dependsOn: 'submit-rp-focused',
    options: [
      { value: 'Voice RP', label: 'Voice RP' },
      { value: 'Text-Based RP', label: 'Text-Based RP' },
      { value: 'Mixed', label: 'Mixed' }
    ]
  },
  'lore-requirement': {
    title: 'Lore Requirement',
    dependsOn: 'submit-rp-focused',
    options: [
      { value: 'High Lore Demand', label: 'High Lore Demand' },
      { value: 'Moderate Lore Demand', label: 'Moderate Lore Demand' },
      { value: 'Low Lore Demand', label: 'Low Lore Demand' }
    ]
  },
  'community-size': {
    title: 'Community Size',
    options: [
      { value: 'Large Communities', label: 'Large Communities' },
      { value: 'Medium Communities', label: 'Medium Communities' },
      { value: 'Small Communities', label: 'Small Communities' },
      { value: 'Exclusive Communities', label: 'Exclusive Communities' }
    ]
  },
  'player-experience': {
    title: 'Player Experience',
    options: [
      { value: 'Beginner-Friendly', label: 'Beginner-Friendly' },
      { value: 'Intermediate', label: 'Intermediate' },
      { value: 'Advanced/Expert', label: 'Advanced/Expert' },
      { value: 'Mixed Skill Level', label: 'Mixed Skill Level' }
    ]
  },
  'mod-usage': {
    title: 'Mod Usage',
    options: [
      { value: 'Vanilla', label: 'Vanilla' },
      { value: 'Lightly Modded', label: 'Lightly Modded' },
      { value: 'Heavily Modded', label: 'Heavily Modded' }
    ]
  },
  'language': {
    title: 'Language',
    options: [
      { value: 'English-Speaking', label: 'English-Speaking' },
      { value: 'Non-English Speaking', label: 'Non-English Speaking' },
      { value: 'Multilingual', label: 'Multilingual' }
    ]
  },
  'region': {
    title: 'Region',
    options: [
      { value: 'Regional Groups', label: 'Regional Groups' },
      { value: 'Global Groups', label: 'Global Groups' }
    ]
  },
  'campaigns': {
    title: 'Campaigns',
    options: [
      { value: 'Single Campaign', label: 'Single Campaign' },
      { value: 'Multiple Campaigns', label: 'Multiple Campaigns' }
    ]
  },
  'moderation': {
    title: 'Moderation',
    options: [
      { value: 'Strict Moderation', label: 'Strict Moderation' },
      { value: 'Relaxed Moderation', label: 'Relaxed Moderation' },
      { value: 'Community-Guided', label: 'Community-Guided' }
    ]
  },
  'session-frequency': {
    title: 'Session Frequency',
    options: [
      { value: 'Multiple a Week', label: 'Multiple a Week' },
      { value: 'Weekly', label: 'Weekly' },
      { value: 'Bi-Monthly', label: 'Bi-Monthly' },
      { value: 'Monthly', label: 'Monthly' },
      { value: 'Other', label: 'Other' }
    ]
  }
};

function createCategoryGroup(categoryKey, categoryData) {
  const group = document.createElement('div');
  group.className = 'submit-category-group';
  group.id = `submit-${categoryKey}-group`;
  group.style.cssText = `
    border: 2px solid #ffd700;
    border-radius: 8px;
    padding: 0.8em;
    background: #23272b;
    transition: opacity 0.3s ease, filter 0.3s ease;
  `;

  const title = document.createElement('div');
  title.className = 'submit-category-title';
  title.textContent = categoryData.title;
  title.style.cssText = `
    font-weight: bold;
    color: #ffd700;
    margin-bottom: 0.5em;
    font-size: 1.05em;
  `;
  group.appendChild(title);

  categoryData.options.forEach(option => {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-bottom: 0.3em;';

    const label = document.createElement('label');
    label.style.cssText = `
      display: flex;
      align-items: center;
      color: #e0e0e0;
      cursor: pointer;
      user-select: none;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = option.value;
    checkbox.style.cssText = 'margin-right: 0.5em;';
    
    if (option.id) {
      checkbox.id = option.id;
    }
    
    if (categoryData.dependsOn) {
      checkbox.classList.add('rp-dependent');
      checkbox.disabled = true;
    }

    // Add event listeners
    checkbox.addEventListener('change', handleCategoryChange);
    checkbox.addEventListener('keydown', handleCategoryKeydown);

    const labelText = document.createElement('span');
    labelText.textContent = option.label;

    label.appendChild(checkbox);
    label.appendChild(labelText);
    wrapper.appendChild(label);
    group.appendChild(wrapper);
  });

  return group;
}

function handleCategoryChange(event) {
  const checkbox = event.target;
  
  // Handle RP-focused dependency
  if (checkbox.id === 'submit-rp-focused') {
    updateRPDependentCategories();
  }
}

function handleCategoryKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.target.click();
  }
}

function updateRPDependentCategories() {
  const rpFocused = document.getElementById('submit-rp-focused');
  const isEnabled = rpFocused?.checked;

  // Find all RP-dependent checkboxes and groups
  const rpDependentInputs = document.querySelectorAll('.rp-dependent');
  const rpDependentGroups = [];

  // Get unique groups
  rpDependentInputs.forEach(input => {
    const group = input.closest('.submit-category-group');
    if (group && !rpDependentGroups.includes(group)) {
      rpDependentGroups.push(group);
    }
  });

  // Update inputs
  rpDependentInputs.forEach(input => {
    input.disabled = !isEnabled;
    if (!isEnabled) {
      input.checked = false;
    }
  });

  // Update group visual state using CSS class
  rpDependentGroups.forEach(group => {
    if (!isEnabled) {
      group.classList.add('rp-disabled');
    } else {
      group.classList.remove('rp-disabled');
    }
  });
}

function initializeSubmitCategories() {
  const grid = document.getElementById('submit-categories-grid');
  if (!grid) return;

  // Clear existing content
  grid.innerHTML = '';

  // Create category groups
  Object.entries(SUBMIT_CATEGORIES).forEach(([key, data]) => {
    const group = createCategoryGroup(key, data);
    grid.appendChild(group);
  });

  // Initialize RP dependencies
  updateRPDependentCategories();
  
  // Add change listener to RP-focused checkbox
  const rpFocused = document.getElementById('submit-rp-focused');
  if (rpFocused) {
    rpFocused.addEventListener('change', updateRPDependentCategories);
  }
}

function getCommunityName() {
  // Get the Community Name field by its actual name attribute from the HTML
  const nameInput = document.querySelector('input[name="entry.1241345937"]');
  return nameInput && nameInput.value.trim() ? nameInput.value.trim() : '';
}

function prependNameToAllFields() {
  const communityName = getCommunityName();
  if (!communityName) return;

  // Prepend name to Description
  const descInput = document.querySelector('textarea[name="entry.1255750588"]');
  if (descInput && !descInput.value.startsWith(`[${communityName}] `)) {
    descInput.value = `[${communityName}] ` + descInput.value;
  }

  // Prepend name to Discord Link
  const discordInput = document.querySelector('input[name="entry.533451195"]');
  if (discordInput && discordInput.value && !discordInput.value.startsWith(`[${communityName}] `)) {
    discordInput.value = `[${communityName}] ` + discordInput.value;
  }

  // Prepend name to Community Banner
  const bannerInput = document.querySelector('input[name="entry.901362015"]');
  if (bannerInput && bannerInput.value && !bannerInput.value.startsWith(`[${communityName}] `)) {
    bannerInput.value = `[${communityName}] ` + bannerInput.value;
  }
}

function getSelectedCategoriesString() {
  // Get all checked checkboxes for categories
  const checked = Array.from(document.querySelectorAll('.submit-category-group input[type="checkbox"]:checked'));
  return checked.map(cb => cb.value).join(', ');
}

function submitCommunityForm() {
  // Prepend name to all other fields before submission
  prependNameToAllFields();

  // Prepend name to the categories string
  const communityName = getCommunityName();
  let bundledString = getSelectedCategoriesString();
  if (communityName) {
    bundledString = `[${communityName}] ` + bundledString;
  }

  // Before showing message, set the hidden input value
  let hiddenInput = document.querySelector('input[type="hidden"][name="entry.1210572624"]');
  if (!hiddenInput) {
    // If not present, create and append to the form
    const form = document.getElementById('submit-community-form');
    hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'entry.1210572624';
    form.appendChild(hiddenInput);
  }
  hiddenInput.value = bundledString;

  // Remove any stray category checkboxes with name="entry.1210572624" (cleanup for legacy)
  document.querySelectorAll('.submit-category-group input[type="checkbox"][name="entry.1210572624"]').forEach(cb => {
    cb.removeAttribute('name');
  });

  const msg = document.getElementById('submit-community-message');
  msg.textContent = "Thank you for your submission! Your community will be reviewed.";
  msg.style.color = "#6be672";
  
  setTimeout(() => {
    const form = document.getElementById('submit-community-form');
    if (form) {
      form.reset();
      updateRPDependentCategories();
    }
    // Scroll to top after submission
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 10);
  
  return true;
}

// Export functions for global access
window.initializeSubmitCategories = initializeSubmitCategories;
window.submitCommunityForm = submitCommunityForm;
