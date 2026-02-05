async function handleSignIn() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('loginMsg');

    try {
        const res = await fetch('https://your-vercel-link.vercel.app/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            // Store the token and user details for later use
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.result));
            
            msg.innerHTML = `<p class="success-msg">Welcome back!</p>`;
            window.location.href = "/index.html"; // Go to your home page
        } else {
            msg.innerHTML = `<p class="error-msg">${data.message}</p>`;
        }
    } catch (err) {
        msg.innerHTML = `<p class="error-msg">Connection failed.</p>`;
    }
}