(() => {
  const config = window.BlogConfig;
  const dom = window.BlogDom;
  const state = window.BlogState;
  const { request } = window.BlogApi;
  const { getDetectedCountry, getSelectedImage } = window.BlogUtils;

  const getUserDisplayName = (user) => {
    const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    return fullName || user?.username || "User";
  };

  const syncHeaderProfile = () => {
    if (!state.currentUser) return;
    dom.headerAvatar.src = state.currentUser.profilePicture || config.DEFAULT_AVATAR;
    dom.openProfile.classList.remove("hidden");
  };

  const showProfileSetup = (user, options = {}) => {
    state.isEditingProfile = Boolean(options.edit);
    state.currentUser = user;
    dom.profileSetupTitle.textContent = state.isEditingProfile ? "Edit your profile" : "Complete your profile";
    dom.profileSubmitButton.textContent = state.isEditingProfile ? "Save changes" : "Save profile";
    dom.closeProfileSetup.classList.toggle("hidden", !state.isEditingProfile);
    dom.firstNameInput.value = user?.firstName || "";
    dom.lastNameInput.value = user?.lastName || "";
    dom.bioInput.value = user?.bio || "";
    dom.websiteInput.value = user?.personalWebsite || "";
    dom.twitterInput.value = user?.socialLinks?.twitter || "";
    dom.facebookInput.value = user?.socialLinks?.facebook || "";
    dom.instagramInput.value = user?.socialLinks?.instagram || "";
    dom.linkedinInput.value = user?.socialLinks?.linkedin || "";
    dom.countryInput.value = user?.country || getDetectedCountry();
    dom.profileCountryText.textContent = `Country: ${dom.countryInput.value}`;
    dom.profileSetupMessage.textContent = "";

    if (dom.authDialog.open) {
      dom.authDialog.close();
    }

    dom.profileSetupDialog.showModal();
  };

  const addProfileLink = (label, value) => {
    if (!value) return;
    const link = document.createElement("a");
    link.href = value;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = label;
    dom.profileViewLinks.appendChild(link);
  };

  const openProfileDialog = () => {
    if (!state.currentUser) return;
    dom.profileViewAvatar.src = state.currentUser.profilePicture || config.DEFAULT_AVATAR;
    dom.profileViewCountry.textContent = state.currentUser.country || "";
    dom.profileViewName.textContent = getUserDisplayName(state.currentUser);
    dom.profileViewBio.textContent = state.currentUser.bio || "No bio yet.";
    dom.profileViewLinks.innerHTML = "";
    addProfileLink("Website", state.currentUser.personalWebsite);
    addProfileLink("Twitter", state.currentUser.socialLinks?.twitter);
    addProfileLink("Facebook", state.currentUser.socialLinks?.facebook);
    addProfileLink("Instagram", state.currentUser.socialLinks?.instagram);
    addProfileLink("LinkedIn", state.currentUser.socialLinks?.linkedin);
    dom.profileViewDialog.showModal();
  };

  const setupProfileEvents = () => {
    dom.openProfile.addEventListener("click", openProfileDialog);
    dom.openProfileFromDashboard.addEventListener("click", openProfileDialog);
    dom.closeProfileView.addEventListener("click", () => dom.profileViewDialog.close());

    dom.editProfileButton.addEventListener("click", () => {
      if (!state.currentUser) return;
      dom.profileViewDialog.close();
      showProfileSetup(state.currentUser, { edit: true });
    });

    dom.profileSetupDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
    });

    dom.closeProfileSetup.addEventListener("click", () => {
      if (!state.isEditingProfile) return;
      state.isEditingProfile = false;
      dom.profileSetupDialog.close();
      openProfileDialog();
    });

    dom.profileSetupForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      try {
        dom.profileSetupMessage.textContent = "Saving profile...";
        dom.profileSetupMessage.style.color = "";
        const selectedAvatar = await getSelectedImage(dom.avatarInput);
        const payload = {
          firstName: dom.firstNameInput.value.trim(),
          lastName: dom.lastNameInput.value.trim(),
          bio: dom.bioInput.value.trim(),
          avatar: selectedAvatar || state.currentUser?.profilePicture || config.DEFAULT_AVATAR,
          personalWebsite: dom.websiteInput.value.trim(),
          socialLinks: {
            twitter: dom.twitterInput.value.trim(),
            facebook: dom.facebookInput.value.trim(),
            instagram: dom.instagramInput.value.trim(),
            linkedin: dom.linkedinInput.value.trim(),
          },
          country: dom.countryInput.value || getDetectedCountry(),
        };
        const data = await request(config.API.profile, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        dom.profileSetupForm.reset();
        dom.profileSetupDialog.close();

        if (state.isEditingProfile) {
          state.isEditingProfile = false;
          state.currentUser = data.result;
          syncHeaderProfile();
          openProfileDialog();
          return;
        }

        await window.BlogAuth.unlockBlog(data.result);
        dom.postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (error) {
        dom.profileSetupMessage.textContent = error.message;
        dom.profileSetupMessage.style.color = "#b42318";
      }
    });
  };

  window.BlogProfile = {
    openProfileDialog,
    setupProfileEvents,
    showProfileSetup,
    syncHeaderProfile,
  };
})();
