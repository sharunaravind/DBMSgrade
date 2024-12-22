let token = '';

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('subject', data.subject);
            window.location.href = 'dashboard.html';
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Error during login');
    }
}

async function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const subject = document.getElementById('subject-select').value;

    if (!username || !password || !subject) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, subject })
        });

        if (response.ok) {
            alert('Signup successful! Please login.');
            window.location.href = 'index.html';
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        alert('Error during signup');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('subject');
    window.location.href = 'index.html';
}