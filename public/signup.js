async function handleSignUp() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('responseMsg');

    msg.innerText = "";
    msg.className = "message-area"; 

    if (!username || !email || !password) {
        msg.innerText = "All fields are required!";
        msg.style.color = "red";
        return;
    }

    const API_URL = "https://simple-blog-app-nu.vercel.app/api/auth/register-user";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            msg.innerText = "Registration Successful! Moving to Login...";
            msg.style.color = "green";
            
            setTimeout(() => {
                window.location.href = "/signin";
            }, 2000);
        } else {
            
            msg.innerText = data.message || "Registration failed. Try again.";
            msg.style.color = "red";
        }
    } catch (error) {
        msg.innerText = "Cannot connect to server. Please check your connection.";
        msg.style.color = "red";
    }
}