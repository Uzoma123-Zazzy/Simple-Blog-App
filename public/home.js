document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
});

async function fetchPosts() {
    const postsList = document.getElementById('postsList');
    const token = localStorage.getItem('token');
    let isAdmin = false;

    if (token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            isAdmin = payload.isAdmin; 
        } catch (e) {
            console.error("Token decoding failed:", e);
        }
    }

    try {
        const response = await fetch('https://simple-blog-app-nu.vercel.app/api/post/getall');
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to fetch posts");

        postsList.innerHTML = ''; 

        if (data.result.length === 0) {
            postsList.innerHTML = '<p>No posts found. Be the first to post!</p>';
            return;
        }

        data.result.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';

            // Format the date from the MongoDB timestamp
            const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            const postDate = new Date(post.createdAt).toLocaleDateString(undefined, dateOptions);

            const imageHtml = post.image ? `<img src="${post.image}" class="post-image" alt="Post Image">` : '';

            const deleteBtnHtml = isAdmin 
                ? `<button class="del-btn" onclick="deletePost('${post._id}')">Delete</button>` 
                : '';

            postCard.innerHTML = `
                <div class="post-meta">
                    <span class="post-category">${post.category || 'General'}</span>
                    <span class="post-date">${postDate}</span>
                </div>
                <h2 class="post-title">${post.title}</h2>
                ${imageHtml}
                <p class="post-content">${post.content}</p>
                <div class="post-actions">
                    <button class="view-btn" onclick="viewPost('${post._id}')">View</button>
                    ${deleteBtnHtml}
                </div>
            `;
            postsList.appendChild(postCard);
        });

    } catch (error) {
        postsList.innerHTML = `<p style="color:red;">Error loading posts: ${error.message}</p>`;
    }
}

function viewPost(id) {
    window.location.href = `/post.html?id=${id}`;
}

async function deletePost(id) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`https://simple-blog-app-nu.vercel.app/api/post/delete/${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });

        if (response.ok) {
            alert("Post deleted successfully");
            fetchPosts(); 
        } else {
            const data = await response.json();
            alert(data.message || "Delete failed");
        }
    } catch (err) {
        alert("Error connecting to server");
    }
}

function handleLogout() {
    localStorage.clear();
    window.location.href = '/signin';
}