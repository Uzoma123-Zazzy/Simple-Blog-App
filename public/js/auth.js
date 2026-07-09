(() => {
  const config = window.BlogConfig;
  const dom = window.BlogDom;
  const state = window.BlogState;
  const { request } = window.BlogApi;

  const setAuthMode = (mode) => {
    state.authMode = mode;
    const isRegister = mode === "register";
    dom.authTitle.textContent = isRegister ? "Register" : "Sign in";
    dom.authSubmit.textContent = isRegister ? "Create account" : "Sign in";
    dom.usernameLabel.classList.toggle("hidden", !isRegister);
    dom.usernameInput.classList.toggle("hidden", !isRegister);
    dom.usernameInput.required = isRegister;
    dom.authSwitchText.firstChild.textContent = isRegister ? "Already have an account? " : "Do not have an account? ";
    dom.authSwitchButton.textContent = isRegister ? "signin" : "register";
    dom.authMessage.textContent = "";
  };

  const showAuthGate = (message = "") => {
    state.isAuthenticated = false;
    state.currentUser = null;
    dom.openProfile.classList.add("hidden");
    setAuthMode("register");
    document.body.classList.add("auth-locked");
    dom.authMessage.textContent = message;
    dom.authMessage.style.color = message ? "#b42318" : "";

    if (!dom.authDialog.open) {
      dom.authDialog.showModal();
    }
  };

  const unlockBlog = async (user) => {
    state.isAuthenticated = true;
    state.currentUser = user;
    document.body.classList.remove("auth-locked");
    window.BlogProfile.syncHeaderProfile();

    if (dom.openAuth.isConnected) {
      dom.openAuth.remove();
    }

    if (dom.authDialog.open) {
      dom.authDialog.close();
    }

    await window.BlogPosts.loadPosts();
  };

  const checkSession = async () => {
    try {
      const data = await request(config.API.me);

      if (!data.result.profileCompleted) {
        window.BlogProfile.showProfileSetup(data.result);
        return;
      }

      await unlockBlog(data.result);
    } catch (error) {
      showAuthGate("");
    }
  };

  const setupAuthEvents = () => {
    dom.openAuth.addEventListener("click", () => {
      dom.authDialog.showModal();
    });

    dom.closeAuth.addEventListener("click", () => {
      if (!state.isAuthenticated) return;
      dom.authDialog.close();
    });

    dom.authDialog.addEventListener("cancel", (event) => {
      if (!state.isAuthenticated) {
        event.preventDefault();
      }
    });

    dom.authSwitchButton.addEventListener("click", () => {
      setAuthMode(state.authMode === "register" ? "signin" : "register");
    });

    dom.authSubmit.addEventListener("click", async () => {
      const payload = {
        email: dom.emailInput.value.trim(),
        password: dom.passwordInput.value,
      };

      if (state.authMode === "register") {
        payload.username = dom.usernameInput.value.trim();
      }

      try {
        dom.authMessage.textContent = "Working...";
        const data = await request(state.authMode === "register" ? config.API.register : config.API.signin, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        dom.authMessage.textContent = "Signed in.";

        if (state.authMode === "register" || !data.result.profileCompleted) {
          window.BlogProfile.showProfileSetup(data.result);
          return;
        }

        await unlockBlog(data.result);
      } catch (error) {
        dom.authMessage.textContent = error.message;
        dom.authMessage.style.color = "#b42318";
      }
    });

    dom.openLogoutConfirm.addEventListener("click", () => {
      dom.logoutDialog.showModal();
    });

    const closeLogoutDialog = () => dom.logoutDialog.close();
    dom.cancelLogout.addEventListener("click", closeLogoutDialog);
    dom.stayLoggedIn.addEventListener("click", closeLogoutDialog);
    dom.confirmLogout.addEventListener("click", async () => {
      try {
        await request(config.API.logout, { method: "POST" });
      } catch (error) {
        // Still clear local UI state if the server cookie is already gone.
      }

      dom.logoutDialog.close();
      dom.postsGrid.innerHTML = "";
      dom.postCount.textContent = "";
      dom.searchInput.value = "";
      showAuthGate("You have been logged out.");
    });
  };

  window.BlogAuth = {
    checkSession,
    setAuthMode,
    setupAuthEvents,
    showAuthGate,
    unlockBlog,
  };
})();
