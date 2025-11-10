let isLoginMode = true;
const messageEl = document.getElementById('message');
const authTitleEl = document.getElementById('authTitle');
const authButtonEl = document.getElementById('authButton');
const toggleTextEl = document.getElementById('toggleText');

function showMessage(type, text) {
    messageEl.textContent = text;
    messageEl.classList.remove('hidden', 'bg-red-200', 'text-red-800', 'bg-green-200', 'text-green-800');
    if (type === 'error') {
        messageEl.classList.add('bg-red-200', 'text-red-800');
    } else {
        messageEl.classList.add('bg-green-200', 'text-green-800');
    }
}

function toggleMode(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;

    if (isLoginMode) {
        // Switch to Login view
        authTitleEl.textContent = 'Login';
        authButtonEl.textContent = 'Login';
        toggleTextEl.textContent = "Don't have an account?";
        e.target.textContent = 'Sign Up';

        // Correct autocomplete for Login
        document.getElementById("username").setAttribute("autocomplete", "username");
        document.getElementById("password").setAttribute("autocomplete", "current-password");

    } else {
        // Switch to Signup view
        authTitleEl.textContent = 'Sign Up';
        authButtonEl.textContent = 'Sign Up';
        toggleTextEl.textContent = "Already have an account?";
        e.target.textContent = 'Login';

        // Correct autocomplete for Signup
        document.getElementById("username").setAttribute("autocomplete", "new-username");
        document.getElementById("password").setAttribute("autocomplete", "new-password");
    }


    // Only clear message *if user clicked manually*, not after signup success
    if (e.manualToggle !== false) {
        messageEl.classList.add('hidden');
    }
}

async function handleAuth() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        return showMessage('error', 'Please enter both username and password.');
    }

    const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/signup";

    try {
        const response = await fetch(`http://localhost:5000${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        // SUCCESS PATHS
        if (response.ok) {
            if (isLoginMode) {
                localStorage.setItem('token', data.token);
                showMessage('success', 'Login successful! Redirecting...');
                return setTimeout(() => window.location.href = 'index.html', 600);
            } else {
                showMessage('success', 'Signup successful! Please log in.');
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';

                // Only switch forms WHEN signup truly succeeded
                toggleMode({ target: { textContent: '' }, preventDefault: () => { }, manualToggle: false });
                return;
            }
        }

        // KNOWN BACKEND ERRORS (user exists, invalid password, etc.)
        return showMessage('error', data.error || 'Authentication failed.');

    } catch (error) {
        console.error("Unexpected auth error:", error);

        return showMessage('error', 'Server error occurred. Please try again.');
    }
}
