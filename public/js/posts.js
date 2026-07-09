(() => {
  const config = window.BlogConfig;
  const dom = window.BlogDom;
  const state = window.BlogState;
  const { request } = window.BlogApi;
  const { excerpt, formatDate, getSelectedImage, shufflePosts, wait } = window.BlogUtils;

  const setStatus = (message, isError = false) => {
    dom.statusMessage.textContent = message;
    dom.statusMessage.style.color = isError ? "#b42318" : "";
    dom.statusMessage.style.fontWeight = isError ? "800" : "";
  };

  const getCurrentUserId = () => state.currentUser?._id || state.currentUser?.id;

  const isDefaultPostImage = (image = "") => {
    return !image || image === config.DEFAULT_POST_IMAGE || image.includes(config.OLD_DEFAULT_POST_IMAGE);
  };

  const getPostImage = (image = "") => {
    return isDefaultPostImage(image) ? config.DEFAULT_POST_IMAGE : image;
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
    state.editingPostId = post._id;
    dom.editPostTitle.value = post.title || "";
    dom.editPostCategory.value = post.category || "Technology";
    dom.editPostImage.value = "";
    dom.editPostContent.value = post.content || "";
    dom.editPostDialog.showModal();
  };

  const openReadPostDialog = async (postId) => {
    try {
      setStatus("Opening post...");
      const data = await request(`${config.API.post}/${postId}`);
      const post = data.result;

      dom.readPostImage.src = getPostImage(post.image);
      dom.readPostImage.classList.toggle("default-post-image", isDefaultPostImage(post.image));
      dom.readPostCategory.textContent = post.category || "Uncategorized";
      dom.readPostDate.textContent = formatDate(post.createdAt);
      dom.readPostTitle.textContent = post.title || "Untitled post";
      dom.readPostBody.textContent = post.content || "";
      setStatus("");
      dom.readPostDialog.showModal();
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        window.BlogAuth.showAuthGate("Sign in or register to view the blog.");
        return;
      }
      setStatus(error.message, true);
    }
  };

  const deletePost = async (postId, postTitle = "this post") => {
    if (!state.currentUser?.isAdmin) {
      setStatus("Only admins can delete posts.", true);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${postTitle}?`)) {
      return;
    }

    try {
      setStatus("Deleting post...");
      await request(`${config.API.deletePost}/${postId}`, { method: "DELETE" });
      await loadPosts(dom.searchInput.value.trim());
      setStatus("Post deleted.");
    } catch (error) {
      setStatus(error.message, true);
    }
  };

  const renderPosts = (posts) => {
    dom.postsGrid.innerHTML = "";
    dom.postCount.textContent = `${posts.length} ${posts.length === 1 ? "post" : "posts"}`;

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
        if (event.target.closest("button")) return;

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

      if (isPostOwner(post) || state.currentUser?.isAdmin) {
        const actions = document.createElement("div");
        actions.className = "post-actions";

        if (isPostOwner(post)) {
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

        if (state.currentUser?.isAdmin) {
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

    dom.postsGrid.appendChild(fragment);
  };

  const loadPosts = async (search = "", options = {}) => {
    try {
      setStatus("Loading posts...");
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const separator = query ? "&" : "?";
      const cacheBuster = options.fresh ? `${separator}fresh=${Date.now()}` : "";
      const data = await request(`${config.API.posts}${query}${cacheBuster}`);
      const posts = options.shuffle ? shufflePosts(data.result || []) : data.result || [];

      if (search && posts.length === 0) {
        setStatus(`No posts matched "${search}". Redirecting to all posts.`, true);
        await wait(1600);
        const allPostsData = await request(`${config.API.posts}?fresh=${Date.now()}`);
        dom.searchInput.value = "";
        renderPosts(allPostsData.result || []);
        setStatus("");
        dom.postsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      renderPosts(posts);
    } catch (error) {
      dom.postCount.textContent = "0 posts";
      dom.postsGrid.innerHTML = "";
      if (error.status === 401 || error.status === 403) {
        window.BlogAuth.showAuthGate("Sign in or register to view the blog.");
        return;
      }
      setStatus(error.message, true);
    }
  };

  const setupPostEvents = () => {
    dom.searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!state.isAuthenticated) {
        window.BlogAuth.showAuthGate("Sign in or register to view the blog.");
        return;
      }
      loadPosts(dom.searchInput.value.trim());
    });

    dom.postForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      try {
        const payload = {
          title: dom.postForm.elements.title.value.trim(),
          category: dom.postForm.elements.category.value,
          content: dom.postForm.elements.content.value.trim(),
        };
        const selectedImage = await getSelectedImage(dom.postForm.elements.image);

        if (selectedImage) payload.image = selectedImage;

        setStatus("Publishing post...");
        await request(config.API.createPost, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        dom.postForm.reset();
        dom.createPostDialog.close();
        await loadPosts();
        setStatus("Post published.");
      } catch (error) {
        setStatus(`${error.message}. Sign in first if you have not already.`, true);
      }
    });

    dom.editPostForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!state.editingPostId) return;

      try {
        const payload = {
          title: dom.editPostForm.elements.title.value.trim(),
          category: dom.editPostForm.elements.category.value,
          content: dom.editPostForm.elements.content.value.trim(),
        };
        const selectedImage = await getSelectedImage(dom.editPostForm.elements.image);

        if (selectedImage) payload.image = selectedImage;

        setStatus("Updating post...");
        await request(`${config.API.updatePost}/${state.editingPostId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        state.editingPostId = null;
        dom.editPostDialog.close();
        await loadPosts(dom.searchInput.value.trim());
        setStatus("Post updated.");
      } catch (error) {
        setStatus(error.message, true);
      }
    });

    dom.closeCreatePost.addEventListener("click", () => dom.createPostDialog.close());
    dom.closeEditPost.addEventListener("click", () => dom.editPostDialog.close());
    dom.closeReadPost.addEventListener("click", () => dom.readPostDialog.close());
  };

  window.BlogPosts = {
    loadPosts,
    renderPosts,
    setStatus,
    setupPostEvents,
  };
})();
