async function handleSignup() {
  const username = document.getElementById("username").value.trim()
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value.trim()
  const msg = document.getElementById("msg")

  if (!username || !email || !password) {
    msg.innerText = "All fields are required"
    msg.style.color = "red"
    return
  }

  try {
    const res = await fetch("https://simple-blog-app-nu.vercel.app/api/auth/register-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    })

    const data = await res.json()

    if (res.ok) {
      msg.innerText = "Account created successfully"
      msg.style.color = "green"
      setTimeout(() => {
        window.location.href = "/signin"
      }, 1500)
    } else {
      msg.innerText = data.message
      msg.style.color = "red"
    }
  } catch {
    msg.innerText = "Something went wrong"
    msg.style.color = "red"
  }
}


async function handleSignin() {
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value.trim()
  const msg = document.getElementById("msg")

  if (!email || !password) {
    msg.innerText = "All fields are required"
    msg.style.color = "red"
    return
  }

  try {
    const res = await fetch("https://simple-blog-app-nu.vercel.app/api/auth/sign-in-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (res.ok) {
      msg.innerText = "Login successful"
      msg.style.color = "green"
      setTimeout(() => {
        window.location.href = "/home"
      }, 1500)
    } else {
      msg.innerText = data.message
      msg.style.color = "red"
    }
  } catch {
    msg.innerText = "Something went wrong"
    msg.style.color = "red"
  }
}

// Navigate to profile page
document.getElementById("profileBtn").addEventListener("click", () => {
    window.location.href = "/profile";
});

// Navigate to create post page
document.getElementById("createPostBtn").addEventListener("click", () => {
    window.location.href = "/createpost";
});

//del
const deleteButtons = document.querySelectorAll(".delete-btn");

deleteButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
        const postId = btn.dataset.id;

        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            // Use relative URL for local dev & deployed app
            const res = await fetch(`https://simple-blog-app-nu.vercel.app/api/post/delete/${postId}`, {
                method: "DELETE",
                credentials: "include" // send cookies
            });

            const data = await res.json();

            if (res.ok) {
                alert("Post deleted successfully!");
                // Remove the post from DOM without reload
                btn.closest('.post-card').remove();
            } else {
                alert(data.message || "Error deleting post");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong!");
        }
    });
});



