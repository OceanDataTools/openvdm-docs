/*
 * Collapsible sidebar navigation.
 *
 * Each section heading in the sidebar (.nav__sub-title) toggles the list of
 * pages under it.  Sections start collapsed, except the one containing the
 * current page.  The open/closed state is remembered for the browser session.
 */
document.addEventListener('DOMContentLoaded', function () {
  var STORAGE_KEY = 'navSectionState';

  var savedState = {};
  try {
    savedState = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    savedState = {};
  }

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    } catch (e) {
      // Storage unavailable (e.g. private browsing): state just isn't kept
    }
  }

  document.querySelectorAll('.nav__sub-title').forEach(function (title) {
    var submenu = title.nextElementSibling;
    if (!submenu || submenu.tagName !== 'UL' || title.querySelector('.nav-toggle')) {
      return;
    }

    var key = title.textContent.trim();

    var toggle = document.createElement('span');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-hidden', 'true');
    title.appendChild(toggle);

    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');

    function setExpanded(expanded) {
      submenu.style.display = expanded ? '' : 'none';
      toggle.textContent = expanded ? '−' : '+';
      title.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      savedState[key] = expanded;
    }

    // The section with the current page is always open
    var hasActivePage = submenu.querySelector('a.active') !== null;
    setExpanded(hasActivePage || savedState[key] === true);

    function onToggle(event) {
      event.preventDefault();
      setExpanded(submenu.style.display === 'none');
      saveState();
    }

    title.addEventListener('click', onToggle);
    title.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        onToggle(event);
      }
    });
  });

  saveState();
});
