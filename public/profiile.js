document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/signin';
        return;
    }

    try {
        // Function to decode JWT payload without an external library
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        // Fill fields using the decoded token payload
        // Assuming your backend puts 'username', 'email', and 'isAdmin' in the token
        document.getElementById('profUsername').value = payload.username || "N/A";
        document.getElementById('profEmail').value = payload.email || "N/A";
        document.getElementById('profStatus').value = payload.isAdmin ? "Administrator" : "Standard User";

        // Handle profile picture if present in payload
        if (payload.picture) {
            document.getElementById('profilePic').src = payload.picture;
        }

    } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.clear();
        window.location.href = '/signin';
    }
});

function handleLogout() {
    localStorage.clear();
    window.location.href = '/signin';
}