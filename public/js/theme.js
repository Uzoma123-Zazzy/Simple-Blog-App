(() => {
  const { toggleTheme } = window.BlogDom;

  const applyTheme = (theme) => {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    toggleTheme.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    toggleTheme.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    localStorage.setItem("blogTheme", theme);
  };

  const setupThemeEvents = () => {
    toggleTheme.addEventListener("click", () => {
      applyTheme(document.body.classList.contains("dark-mode") ? "light" : "dark");
    });
  };

  window.BlogTheme = {
    applyTheme,
    setupThemeEvents,
  };
})();
