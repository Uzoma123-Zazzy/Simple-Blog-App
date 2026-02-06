async function handleSignIn() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('loginMsg');

    msg.innerText = ""; 
    const API_URL = "https://simple-blog-app-nu.vercel.app/api/auth/signin-user";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            
            localStorage.setItem('token', data.token);
            
            localStorage.setItem('user', JSON.stringify(data.result));

            msg.innerText = "Login Successful! Redirecting...";
            msg.style.color = "green";

            setTimeout(() => {
                window.location.href = "/"; 
            }, 1500);
        } else {
            msg.innerText = data.message || "Login failed";
            msg.style.color = "red";
        }
    } catch (error) {
        msg.innerText = "Error connecting to server.";
        msg.style.color = "red";
    }
}