async function handleSignIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('responseMsg');

    // Reset message state
    msg.innerText = "Authenticating...";
    msg.style.color = "blue";

    if (!email || !password) {
        msg.innerText = "Please enter both email and password.";
        msg.style.color = "red";
        return;
    }

    const API_URL = "https://simple-blog-app-nu.vercel.app/api/auth/signin-user";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the JWT token
            localStorage.setItem("token", data.token);
            
            // Store the user object from 'result' for the profile page
            localStorage.setItem("user", JSON.stringify(data.result));

            msg.innerText = "Login Successful! Redirecting...";
            msg.style.color = "green";

            // Redirect to the views folder
            setTimeout(() => {
                window.location.href = "/home"; 
            }, 1500);
        } else {
            msg.innerText = data.message || "Login failed";
            msg.style.color = "red";
        }

    } catch (error) {
        msg.innerText = "Network error: Could not reach the server.";
        msg.style.color = "red";
        console.error("Sign-in error:", error);
    }
}