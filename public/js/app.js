window.BlogTheme.applyTheme(localStorage.getItem("blogTheme") || "light");
window.BlogTheme.setupThemeEvents();
window.BlogPosts.setupPostEvents();
window.BlogProfile.setupProfileEvents();
window.BlogAuth.setupAuthEvents();
window.BlogDashboard.setupDashboardEvents();
window.BlogAuth.setAuthMode("register");
window.BlogAuth.checkSession();
