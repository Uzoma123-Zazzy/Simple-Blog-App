const API = {
  posts: "/api/post/getallposts",
  post: "/api/post/getpost",
  createPost: "/api/post/createpost",
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

let authMode = "signin";

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
    throw new Error(data.message || "Request failed");
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

const excerpt = (text, max = 150) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
};

const setStatus = (message, isError = false) => {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b42318" : "";
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
  authMessage.textContent = "";
};

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadPosts(searchInput.value.trim());
});

refreshPosts.addEventListener("click", () => {
  searchInput.value = "";
  loadPosts();
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
  authDialog.close();
});

signinTab.addEventListener("click", () => setAuthMode("signin"));
registerTab.addEventListener("click", () => setAuthMode("register"));

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
    await request(authMode === "register" ? API.register : API.signin, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    authMessage.textContent = "Signed in.";
    openAuth.textContent = "Signed in";
    setTimeout(() => authDialog.close(), 450);
  } catch (error) {
    authMessage.textContent = error.message;
    authMessage.style.color = "#b42318";
  }
});

setAuthMode("signin");
loadPosts();
