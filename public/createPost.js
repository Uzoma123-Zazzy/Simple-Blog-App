async function handleCreatePost() {
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const content = document.getElementById('content').value;
    const image = document.getElementById('image').value;
    const msg = document.getElementById('responseMsg');

    if (!title || !content) {
        msg.innerText = "Title and Content are required!";
        msg.style.color = "red";
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        msg.innerText = "You must be logged in to post.";
        msg.style.color = "red";
        return;
    }

    const API_URL = "https://simple-blog-app-nu.vercel.app/api/post/createpost";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Passing token to your JWT middleware
            },
            body: JSON.stringify({ title, category, content, image })
        });

        const data = await response.json();

        if (response.ok) {
            msg.innerText = "Post published successfully! Redirecting...";
            msg.style.color = "green";
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
        } else {
            msg.innerText = data.message || "Failed to create post.";
            msg.style.color = "red";
        }
    } catch (error) {
        msg.innerText = "Network error. Please try again.";
        msg.style.color = "red";
    }
}