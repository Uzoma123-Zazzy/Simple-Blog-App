document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const displayArea = document.getElementById('fullPostContent');

    if (!postId) {
        displayArea.innerHTML = "<p>Error: No post ID found.</p>";
        return;
    }

    try {
        // Adjust this URL to match your backend route
        const response = await fetch(`https://simple-blog-app-nu.vercel.app/api/post/getpost/${postId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Post not found");

        const post = data.result;

        // Check if image exists; handle as "uncompulsory"
        const imageTag = post.image ? `<img src="${post.image}" class="full-post-image" alt="${post.title}">` : '';

        displayArea.innerHTML = `
            <span class="full-post-category">${post.category || 'General'}</span>
            <h1 class="full-post-title">${post.title}</h1>
            ${imageTag}
            <div class="full-post-text">${post.content}</div>
        `;

        // Update document title to the post title
        document.title = `${post.title} | Blog-App`;

    } catch (error) {
        displayArea.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
});