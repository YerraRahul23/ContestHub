document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!name || !email) {
        alert("Please enter both name and email.");
        return;
    }

    // Save user info in localStorage
    localStorage.setItem('user', JSON.stringify({ name, email }));

    // Redirect to home page
    window.location.href = 'index.html';
});
