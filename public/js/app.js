const API = {
  me: "/api/auth/me",
  posts: "/api/post/getallposts",
  post: "/api/post/getpost",
  createPost: "/api/post/createpost",
  deletePost: "/api/post/delete",
  signin: "/api/auth/signin-user",
  register: "/api/auth/register-user",
};

const postsGrid = document.querySelector("#postsGrid");
const statusMessage = document.querySelector("#statusMessage");
const postCount = document.querySelector("#postCount");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const postForm = document.querySelector("#postForm");
const refreshPosts = document.querySelector("#refreshPosts");
const dashboard = document.querySelector("#dashboard");
const toggleDashboard = document.querySelector("#toggleDashboard");
const openCreatePost = document.querySelector("#openCreatePost");
const createPostDialog = document.querySelector("#createPostDialog");
const closeCreatePost = document.querySelector("#closeCreatePost");
const authDialog = document.querySelector("#authDialog");
const openAuth = document.querySelector("#openAuth");
const closeAuth = document.querySelector("#closeAuth");
const signinTab = document.querySelector("#signinTab");
const registerTab = document.querySelector("#registerTab");
const authTitle = document.querySelector("#authTitle");
const authSubmit = document.querySelector("#authSubmit");
const authMessage = document.querySelector("#authMessage");
const usernameLabel = document.querySelector("#usernameLabel");
const usernameInput = document.querySelector("#usernameInput");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const authSwitchText = document.querySelector("#authSwitchText");
const authSwitchButton = document.querySelector("#authSwitchButton");

let authMode = "signin";
let isAuthenticated = false;
let currentUser = null;

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

const setStatus = (message, isError = false) => {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b42318" : "";
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

    const image = document.createElement("img");
    image.src = post.image || "";
    image.alt = "";
    image.loading = "lazy";

    const body = document.createElement("div");
    body.className = "post-body";

    const meta = document.createElement("div");
    meta.className = "post-meta";

    const category = document.createElement("span");
    category.className = "post-category";
    category.textContent = post.category || "Uncategorized";

    const date = document.createElement("span");
    date.textContent = formatDate(post.createdAt);

    if (currentUser?.isAdmin) {
      const actions = document.createElement("div");
      actions.className = "post-actions";

      const deleteButton = document.createElement("button");
      deleteButton.className = "post-delete-button";
      deleteButton.type = "button";
      deleteButton.title = "Delete post";
      deleteButton.setAttribute("aria-label", `Delete ${post.title || "post"}`);
      deleteButton.appendChild(createTrashIcon());
      deleteButton.addEventListener("click", () => deletePost(post._id, post.title || "this post"));
      actions.appendChild(deleteButton);
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

const loadPosts = async (search = "") => {
  try {
    setStatus("Loading posts...");
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const data = await request(`${API.posts}${query}`);
    renderPosts(data.result || []);
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
  registerTab.classList.toggle("active", isRegister);
  signinTab.classList.toggle("active", !isRegister);
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
  if (openAuth.isConnected) {
    openAuth.remove();
  }
  if (authDialog.open) {
    authDialog.close();
  }
  await loadPosts();
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
  loadPosts();
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

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(postForm);
  const payload = Object.fromEntries(formData.entries());

  if (!payload.image) {
    delete payload.image;
  }

  try {
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

signinTab.addEventListener("click", () => setAuthMode("signin"));
registerTab.addEventListener("click", () => setAuthMode("register"));
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
    await unlockBlog(data.result);
  } catch (error) {
    authMessage.textContent = error.message;
    authMessage.style.color = "#b42318";
  }
});

setAuthMode("register");
showAuthGate("");
