const API = {
  me: "/api/auth/me",
  posts: "/api/post/getallposts",
  post: "/api/post/getpost",
  createPost: "/api/post/createpost",
  updatePost: "/api/post/update",
  deletePost: "/api/post/delete",
  profile: "/api/user/profile",
  signin: "/api/auth/signin-user",
  register: "/api/auth/register-user",
  logout: "/api/auth/logout",
};

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";
const DEFAULT_POST_IMAGE = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80";
const OLD_DEFAULT_POST_IMAGE = "img.freepik.com/premium-vector/illustration-vector-graphic-cartoon-character-blogging";

const postsGrid = document.querySelector("#postsGrid");
const statusMessage = document.querySelector("#statusMessage");
const postCount = document.querySelector("#postCount");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const postForm = document.querySelector("#postForm");
const refreshPosts = document.querySelector("#refreshPosts");
const showPosts = document.querySelector("#showPosts");
const postsSection = document.querySelector("#postsSection");
const openProfile = document.querySelector("#openProfile");
const headerAvatar = document.querySelector("#headerAvatar");
const dashboard = document.querySelector("#dashboard");
const toggleDashboard = document.querySelector("#toggleDashboard");
const openProfileFromDashboard = document.querySelector("#openProfileFromDashboard");
const toggleTheme = document.querySelector("#toggleTheme");
const openLogoutConfirm = document.querySelector("#openLogoutConfirm");
const openCreatePost = document.querySelector("#openCreatePost");
const createPostDialog = document.querySelector("#createPostDialog");
const closeCreatePost = document.querySelector("#closeCreatePost");
const editPostDialog = document.querySelector("#editPostDialog");
const closeEditPost = document.querySelector("#closeEditPost");
const editPostForm = document.querySelector("#editPostForm");
const editPostTitle = document.querySelector("#editPostTitle");
const editPostCategory = document.querySelector("#editPostCategory");
const editPostImage = document.querySelector("#editPostImage");
const editPostContent = document.querySelector("#editPostContent");
const readPostDialog = document.querySelector("#readPostDialog");
const closeReadPost = document.querySelector("#closeReadPost");
const readPostImage = document.querySelector("#readPostImage");
const readPostCategory = document.querySelector("#readPostCategory");
const readPostDate = document.querySelector("#readPostDate");
const readPostTitle = document.querySelector("#readPostTitle");
const readPostBody = document.querySelector("#readPostBody");
const authDialog = document.querySelector("#authDialog");
const openAuth = document.querySelector("#openAuth");
const closeAuth = document.querySelector("#closeAuth");
const authTitle = document.querySelector("#authTitle");
const authSubmit = document.querySelector("#authSubmit");
const authMessage = document.querySelector("#authMessage");
const usernameLabel = document.querySelector("#usernameLabel");
const usernameInput = document.querySelector("#usernameInput");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const authSwitchText = document.querySelector("#authSwitchText");
const authSwitchButton = document.querySelector("#authSwitchButton");
const logoutDialog = document.querySelector("#logoutDialog");
const cancelLogout = document.querySelector("#cancelLogout");
const stayLoggedIn = document.querySelector("#stayLoggedIn");
const confirmLogout = document.querySelector("#confirmLogout");
const profileSetupDialog = document.querySelector("#profileSetupDialog");
const closeProfileSetup = document.querySelector("#closeProfileSetup");
const profileSetupForm = document.querySelector("#profileSetupForm");
const profileSetupTitle = document.querySelector("#profileSetupTitle");
const profileSubmitButton = document.querySelector("#profileSubmitButton");
const firstNameInput = document.querySelector("#firstNameInput");
const lastNameInput = document.querySelector("#lastNameInput");
const bioInput = document.querySelector("#bioInput");
const avatarInput = document.querySelector("#avatarInput");
const websiteInput = document.querySelector("#websiteInput");
const twitterInput = document.querySelector("#twitterInput");
const facebookInput = document.querySelector("#facebookInput");
const instagramInput = document.querySelector("#instagramInput");
const linkedinInput = document.querySelector("#linkedinInput");
const countryInput = document.querySelector("#countryInput");
const profileCountryText = document.querySelector("#profileCountryText");
const profileSetupMessage = document.querySelector("#profileSetupMessage");
const profileViewDialog = document.querySelector("#profileViewDialog");
const closeProfileView = document.querySelector("#closeProfileView");
const profileViewAvatar = document.querySelector("#profileViewAvatar");
const profileViewCountry = document.querySelector("#profileViewCountry");
const profileViewName = document.querySelector("#profileViewName");
const profileViewBio = document.querySelector("#profileViewBio");
const profileViewLinks = document.querySelector("#profileViewLinks");
const editProfileButton = document.querySelector("#editProfileButton");

let authMode = "signin";
let isAuthenticated = false;
let currentUser = null;
let editingPostId = null;
let isEditingProfile = false;

const applyTheme = (theme) => {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  toggleTheme.textContent = isDark ? "Light mode" : "Dark mode";
  toggleTheme.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  localStorage.setItem("blogTheme", theme);
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
};

const formatDate = (value) => {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const excerpt = (text, max = 115) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
};

const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Could not read selected image")));
    reader.readAsDataURL(file);
  });
};

const getSelectedImage = async (input) => {
  const file = input.files?.[0];

  if (!file) {
    return "";
  }

  if (file.size > 3 * 1024 * 1024) {
    throw new Error("Please select an image smaller than 3MB");
  }

  return fileToDataUrl(file);
};

const setStatus = (message, isError = false) => {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b42318" : "";
  statusMessage.style.fontWeight = isError ? "800" : "";
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCurrentUserId = () => currentUser?._id || currentUser?.id;

const shufflePosts = (posts) => {
  const shuffled = [...posts];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
};

const isDefaultPostImage = (image = "") => {
  return !image || image === DEFAULT_POST_IMAGE || image.includes(OLD_DEFAULT_POST_IMAGE);
};

const getPostImage = (image = "") => {
  return isDefaultPostImage(image) ? DEFAULT_POST_IMAGE : image;
};

const getDetectedCountry = () => {
  const locale = navigator.language || "en-US";
  const region = locale.split("-")[1] || "US";

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(region.toUpperCase()) || "United States";
  } catch (error) {
    return "United States";
  }
};

const getUserDisplayName = (user) => {
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return fullName || user?.username || "User";
};

const syncHeaderProfile = () => {
  if (!currentUser) return;
  headerAvatar.src = currentUser.profilePicture || DEFAULT_AVATAR;
  openProfile.classList.remove("hidden");
};

const isPostOwner = (post) => {
  const postUserId = typeof post.userId === "object" ? post.userId?._id : post.userId;
  return Boolean(postUserId && getCurrentUserId() && String(postUserId) === String(getCurrentUserId()));
};

const createEditIcon = () => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = `
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  `;
  return icon;
};

const createTrashIcon = () => {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = `
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  `;
  return icon;
};

const openEditPostDialog = (post) => {
  editingPostId = post._id;
  editPostTitle.value = post.title || "";
  editPostCategory.value = post.category || "Technology";
  editPostImage.value = "";
  editPostContent.value = post.content || "";
  editPostDialog.showModal();
};

const openReadPostDialog = async (postId) => {
  try {
    setStatus("Opening post...");
    const data = await request(`${API.post}/${postId}`);
    const post = data.result;

    readPostImage.src = getPostImage(post.image);
    readPostImage.classList.toggle("default-post-image", isDefaultPostImage(post.image));
    readPostCategory.textContent = post.category || "Uncategorized";
    readPostDate.textContent = formatDate(post.createdAt);
    readPostTitle.textContent = post.title || "Untitled post";
    readPostBody.textContent = post.content || "";
    setStatus("");
    readPostDialog.showModal();
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      showAuthGate("Sign in or register to view the blog.");
      return;
    }
    setStatus(error.message, true);
  }
};

const deletePost = async (postId, postTitle = "this post") => {
  if (!currentUser?.isAdmin) {
    setStatus("Only admins can delete posts.", true);
    return;
  }

  const confirmed = window.confirm(`Are you sure you want to delete ${postTitle}?`);

  if (!confirmed) {
    return;
  }

  try {
    setStatus("Deleting post...");
    await request(`${API.deletePost}/${postId}`, {
      method: "DELETE",
    });
    await loadPosts(searchInput.value.trim());
    setStatus("Post deleted.");
  } catch (error) {
    setStatus(error.message, true);
  }
};

const renderPosts = (posts) => {
  postsGrid.innerHTML = "";
  postCount.textContent = `${posts.length} ${posts.length === 1 ? "post" : "posts"}`;

  if (!posts.length) {
    setStatus("No posts found.");
    return;
  }

  setStatus("");

  const fragment = document.createDocumentFragment();

  posts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Read ${post.title || "post"}`);
    card.addEventListener("click", () => openReadPostDialog(post._id));
    card.addEventListener("keydown", (event) => {
      if (event.target.closest("button")) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openReadPostDialog(post._id);
      }
    });

    const image = document.createElement("img");
    image.src = getPostImage(post.image);
    image.alt = "";
    image.loading = "lazy";
    image.classList.toggle("default-post-image", isDefaultPostImage(post.image));

    const body = document.createElement("div");
    body.className = "post-body";

    const meta = document.createElement("div");
    meta.className = "post-meta";

    const category = document.createElement("span");
    category.className = "post-category";
    category.textContent = post.category || "Uncategorized";

    const date = document.createElement("span");
    date.textContent = formatDate(post.createdAt);

    const canEdit = isPostOwner(post);
    const canDelete = currentUser?.isAdmin;

    if (canEdit || canDelete) {
      const actions = document.createElement("div");
      actions.className = "post-actions";

      if (canEdit) {
        const editButton = document.createElement("button");
        editButton.className = "post-edit-button";
        editButton.type = "button";
        editButton.title = "Edit post";
        editButton.setAttribute("aria-label", `Edit ${post.title || "post"}`);
        editButton.appendChild(createEditIcon());
        editButton.addEventListener("click", (event) => {
          event.stopPropagation();
          openEditPostDialog(post);
        });
        actions.appendChild(editButton);
      }

      if (canDelete) {
        const deleteButton = document.createElement("button");
        deleteButton.className = "post-delete-button";
        deleteButton.type = "button";
        deleteButton.title = "Delete post";
        deleteButton.setAttribute("aria-label", `Delete ${post.title || "post"}`);
        deleteButton.appendChild(createTrashIcon());
        deleteButton.addEventListener("click", (event) => {
          event.stopPropagation();
          deletePost(post._id, post.title || "this post");
        });
        actions.appendChild(deleteButton);
      }

      body.appendChild(actions);
    }

    const title = document.createElement("h3");
    title.textContent = post.title || "Untitled post";

    const content = document.createElement("p");
    content.textContent = excerpt(post.content);

    meta.append(category, date);
    body.append(meta, title, content);
    card.append(image, body);
    fragment.appendChild(card);
  });

  postsGrid.appendChild(fragment);
};

const loadPosts = async (search = "", options = {}) => {
  try {
    setStatus("Loading posts...");
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const separator = query ? "&" : "?";
    const cacheBuster = options.fresh ? `${separator}fresh=${Date.now()}` : "";
    const data = await request(`${API.posts}${query}${cacheBuster}`);
    const posts = options.shuffle ? shufflePosts(data.result || []) : data.result || [];

    if (search && posts.length === 0) {
      setStatus(`No posts matched "${search}". Redirecting to all posts.`, true);
      await wait(1600);
      const allPostsData = await request(`${API.posts}?fresh=${Date.now()}`);
      searchInput.value = "";
      renderPosts(allPostsData.result || []);
      setStatus("");
      postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    renderPosts(posts);
  } catch (error) {
    postCount.textContent = "0 posts";
    postsGrid.innerHTML = "";
    if (error.status === 401 || error.status === 403) {
      showAuthGate("Sign in or register to view the blog.");
      return;
    }
    setStatus(error.message, true);
  }
};

const setAuthMode = (mode) => {
  authMode = mode;
  const isRegister = mode === "register";
  authTitle.textContent = isRegister ? "Register" : "Sign in";
  authSubmit.textContent = isRegister ? "Create account" : "Sign in";
  usernameLabel.classList.toggle("hidden", !isRegister);
  usernameInput.classList.toggle("hidden", !isRegister);
  usernameInput.required = isRegister;
  authSwitchText.firstChild.textContent = isRegister ? "Already have an account? " : "Do not have an account? ";
  authSwitchButton.textContent = isRegister ? "signin" : "register";
  authMessage.textContent = "";
};

const showAuthGate = (message = "") => {
  isAuthenticated = false;
  currentUser = null;
  openProfile.classList.add("hidden");
  setAuthMode("register");
  document.body.classList.add("auth-locked");
  authMessage.textContent = message;
  authMessage.style.color = message ? "#b42318" : "";

  if (!authDialog.open) {
    authDialog.showModal();
  }
};

const unlockBlog = async (user) => {
  isAuthenticated = true;
  currentUser = user;
  document.body.classList.remove("auth-locked");
  syncHeaderProfile();
  if (openAuth.isConnected) {
    openAuth.remove();
  }
  if (authDialog.open) {
    authDialog.close();
  }
  await loadPosts();
};

const checkSession = async () => {
  try {
    const data = await request(API.me);

    if (!data.result.profileCompleted) {
      showProfileSetup(data.result);
      return;
    }

    await unlockBlog(data.result);
  } catch (error) {
    showAuthGate("");
  }
};

const showProfileSetup = (user, options = {}) => {
  isEditingProfile = Boolean(options.edit);
  currentUser = user;
  profileSetupTitle.textContent = isEditingProfile ? "Edit your profile" : "Complete your profile";
  profileSubmitButton.textContent = isEditingProfile ? "Save changes" : "Save profile";
  closeProfileSetup.classList.toggle("hidden", !isEditingProfile);
  firstNameInput.value = user?.firstName || "";
  lastNameInput.value = user?.lastName || "";
  bioInput.value = user?.bio || "";
  websiteInput.value = user?.personalWebsite || "";
  twitterInput.value = user?.socialLinks?.twitter || "";
  facebookInput.value = user?.socialLinks?.facebook || "";
  instagramInput.value = user?.socialLinks?.instagram || "";
  linkedinInput.value = user?.socialLinks?.linkedin || "";
  countryInput.value = user?.country || getDetectedCountry();
  profileCountryText.textContent = `Country: ${countryInput.value}`;
  profileSetupMessage.textContent = "";
  if (authDialog.open) {
    authDialog.close();
  }
  profileSetupDialog.showModal();
};

const addProfileLink = (label, value) => {
  if (!value) return;
  const link = document.createElement("a");
  link.href = value;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = label;
  profileViewLinks.appendChild(link);
};

const openProfileDialog = () => {
  if (!currentUser) return;
  profileViewAvatar.src = currentUser.profilePicture || DEFAULT_AVATAR;
  profileViewCountry.textContent = currentUser.country || "";
  profileViewName.textContent = getUserDisplayName(currentUser);
  profileViewBio.textContent = currentUser.bio || "No bio yet.";
  profileViewLinks.innerHTML = "";
  addProfileLink("Website", currentUser.personalWebsite);
  addProfileLink("Twitter", currentUser.socialLinks?.twitter);
  addProfileLink("Facebook", currentUser.socialLinks?.facebook);
  addProfileLink("Instagram", currentUser.socialLinks?.instagram);
  addProfileLink("LinkedIn", currentUser.socialLinks?.linkedin);
  profileViewDialog.showModal();
};

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isAuthenticated) {
    showAuthGate("Sign in or register to view the blog.");
    return;
  }
  loadPosts(searchInput.value.trim());
});

refreshPosts.addEventListener("click", () => {
  if (!isAuthenticated) return;
  searchInput.value = "";
  loadPosts("", { fresh: true, shuffle: true }).then(() => {
    postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

showPosts.addEventListener("click", () => {
  if (!isAuthenticated) return;
  postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

openProfile.addEventListener("click", openProfileDialog);
openProfileFromDashboard.addEventListener("click", openProfileDialog);
closeProfileView.addEventListener("click", () => {
  profileViewDialog.close();
});

editProfileButton.addEventListener("click", () => {
  if (!currentUser) return;
  profileViewDialog.close();
  showProfileSetup(currentUser, { edit: true });
});

toggleTheme.addEventListener("click", () => {
  applyTheme(document.body.classList.contains("dark-mode") ? "light" : "dark");
});

openLogoutConfirm.addEventListener("click", () => {
  logoutDialog.showModal();
});

const closeLogoutDialog = () => logoutDialog.close();
cancelLogout.addEventListener("click", closeLogoutDialog);
stayLoggedIn.addEventListener("click", closeLogoutDialog);
confirmLogout.addEventListener("click", async () => {
  try {
    await request(API.logout, { method: "POST" });
  } catch (error) {
    // Still clear the local UI state if the server cookie is already gone.
  }

  logoutDialog.close();
  postsGrid.innerHTML = "";
  postCount.textContent = "";
  searchInput.value = "";
  showAuthGate("You have been logged out.");
});

toggleDashboard.addEventListener("click", () => {
  const isCollapsed = dashboard.classList.toggle("is-collapsed");
  document.body.classList.toggle("dashboard-collapsed", isCollapsed);
  toggleDashboard.setAttribute("aria-expanded", String(!isCollapsed));
  toggleDashboard.setAttribute("aria-label", isCollapsed ? "Expand dashboard" : "Minimize dashboard");
});

openCreatePost.addEventListener("click", () => {
  if (!isAuthenticated) {
    showAuthGate("Sign in before creating a post.");
    return;
  }
  createPostDialog.showModal();
});

closeCreatePost.addEventListener("click", () => {
  createPostDialog.close();
});

closeEditPost.addEventListener("click", () => {
  editPostDialog.close();
});

closeReadPost.addEventListener("click", () => {
  readPostDialog.close();
});

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const payload = {
      title: postForm.elements.title.value.trim(),
      category: postForm.elements.category.value,
      content: postForm.elements.content.value.trim(),
    };

    const selectedImage = await getSelectedImage(postForm.elements.image);

    if (selectedImage) {
      payload.image = selectedImage;
    }

    setStatus("Publishing post...");
    await request(API.createPost, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    postForm.reset();
    createPostDialog.close();
    await loadPosts();
    setStatus("Post published.");
  } catch (error) {
    setStatus(`${error.message}. Sign in first if you have not already.`, true);
  }
});

editPostForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!editingPostId) {
    return;
  }

  try {
    const payload = {
      title: editPostForm.elements.title.value.trim(),
      category: editPostForm.elements.category.value,
      content: editPostForm.elements.content.value.trim(),
    };

    const selectedImage = await getSelectedImage(editPostForm.elements.image);

    if (selectedImage) {
      payload.image = selectedImage;
    }

    setStatus("Updating post...");
    await request(`${API.updatePost}/${editingPostId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    editingPostId = null;
    editPostDialog.close();
    await loadPosts(searchInput.value.trim());
    setStatus("Post updated.");
  } catch (error) {
    setStatus(error.message, true);
  }
});

openAuth.addEventListener("click", () => {
  authDialog.showModal();
});

closeAuth.addEventListener("click", () => {
  if (!isAuthenticated) return;
  authDialog.close();
});

authDialog.addEventListener("cancel", (event) => {
  if (!isAuthenticated) {
    event.preventDefault();
  }
});

profileSetupDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
});

closeProfileSetup.addEventListener("click", () => {
  if (!isEditingProfile) return;
  isEditingProfile = false;
  profileSetupDialog.close();
  openProfileDialog();
});

authSwitchButton.addEventListener("click", () => {
  setAuthMode(authMode === "register" ? "signin" : "register");
});

authSubmit.addEventListener("click", async () => {
  const payload = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
  };

  if (authMode === "register") {
    payload.username = usernameInput.value.trim();
  }

  try {
    authMessage.textContent = "Working...";
    const data = await request(authMode === "register" ? API.register : API.signin, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    authMessage.textContent = "Signed in.";
    if (authMode === "register" || !data.result.profileCompleted) {
      showProfileSetup(data.result);
      return;
    }

    await unlockBlog(data.result);
  } catch (error) {
    authMessage.textContent = error.message;
    authMessage.style.color = "#b42318";
  }
});

profileSetupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    profileSetupMessage.textContent = "Saving profile...";
    profileSetupMessage.style.color = "";
    const selectedAvatar = await getSelectedImage(avatarInput);
    const payload = {
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      bio: bioInput.value.trim(),
      avatar: selectedAvatar || currentUser?.profilePicture || DEFAULT_AVATAR,
      personalWebsite: websiteInput.value.trim(),
      socialLinks: {
        twitter: twitterInput.value.trim(),
        facebook: facebookInput.value.trim(),
        instagram: instagramInput.value.trim(),
        linkedin: linkedinInput.value.trim(),
      },
      country: countryInput.value || getDetectedCountry(),
    };

    const data = await request(API.profile, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    profileSetupForm.reset();
    profileSetupDialog.close();

    if (isEditingProfile) {
      isEditingProfile = false;
      currentUser = data.result;
      syncHeaderProfile();
      openProfileDialog();
      return;
    }

    await unlockBlog(data.result);
    postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    profileSetupMessage.textContent = error.message;
    profileSetupMessage.style.color = "#b42318";
  }
});

applyTheme(localStorage.getItem("blogTheme") || "light");
setAuthMode("register");
checkSession();
