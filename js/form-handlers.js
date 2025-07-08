document.addEventListener('DOMContentLoaded', function() {
  const rpFocused = document.getElementById('submit-rp-focused');
  if (rpFocused) {
    rpFocused.addEventListener('change', updateSubmitRPCategoriesVisibility);
    updateSubmitRPCategoriesVisibility();
  }
});

function submitCommunityForm() {
  const msg = document.getElementById('submit-community-message');
  msg.textContent = "Thank you for your submission! Your community will be reviewed.";
  msg.style.color = "#6be672";
  setTimeout(function() {
    document.getElementById('submit-community-form').reset();
    updateSubmitRPCategoriesVisibility();
  }, 1000);
  return true;
}

function updateSubmitRPCategoriesVisibility() {
  const rpFocused = document.getElementById('submit-rp-focused');
  const enabled = rpFocused?.checked;
  const rpInputs = document.querySelectorAll('#submit-categories-list .rp-dependent');
  const rpGroups = [
    document.getElementById('submit-rp-style-group'),
    document.getElementById('submit-session-type-group').parentElement,
    document.getElementById('submit-lore-requirement-group')
  ];
  rpInputs.forEach(function(input) {
    input.disabled = !enabled;
    if (!enabled) input.checked = false;
  });
  rpGroups.forEach(function(group) {
    if (group) {
      if (!enabled) {
        group.classList.add('rp-disabled');
      } else {
        group.classList.remove('rp-disabled');
      }
    }
  });
}
