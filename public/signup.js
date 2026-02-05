async function handleSignUp() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('responseMsg');

    try {
        const res = await fetch('https://simple-blog-app-nu.vercel.app/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();

        if (res.ok) {
            msg.innerHTML = `<p class="success-msg">Success! Redirecting to login...</p>`;
            setTimeout(() => { window.location.href = "/auth.html"; }, 2000);
        } else {
            msg.innerHTML = `<p class="error-msg">${data.message}</p>`;
        }
    } catch (err) {
        msg.innerHTML = `<p class="error-msg">Server error. Try again.</p>`;
    }
}