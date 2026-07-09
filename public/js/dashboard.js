(() => {
  const dom = window.BlogDom;
  const state = window.BlogState;

  const setupDashboardEvents = () => {
    dom.refreshPosts.addEventListener("click", () => {
      if (!state.isAuthenticated) return;
      dom.searchInput.value = "";
      window.BlogPosts.loadPosts("", { fresh: true, shuffle: true }).then(() => {
        dom.postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    dom.showPosts.addEventListener("click", () => {
      if (!state.isAuthenticated) return;
      dom.postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    dom.toggleDashboard.addEventListener("click", () => {
      const isCollapsed = dom.dashboard.classList.toggle("is-collapsed");
      document.body.classList.toggle("dashboard-collapsed", isCollapsed);
      dom.toggleDashboard.setAttribute("aria-expanded", String(!isCollapsed));
      dom.toggleDashboard.setAttribute("aria-label", isCollapsed ? "Expand dashboard" : "Minimize dashboard");
    });

    dom.openCreatePost.addEventListener("click", () => {
      if (!state.isAuthenticated) {
        window.BlogAuth.showAuthGate("Sign in before creating a post.");
        return;
      }
      dom.createPostDialog.showModal();
    });
  };

  window.BlogDashboard = {
    setupDashboardEvents,
  };
})();
