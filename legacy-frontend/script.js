// Theme toggle functionality
const themeToggle = document.createElement('div');
themeToggle.className = 'theme-toggle';
themeToggle.innerHTML = `
    <button id="themeToggleBtn" class="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <i data-feather="moon" class="hidden dark:block"></i>
        <i data-feather="sun" class="dark:hidden"></i>
    </button>
`;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme from localStorage or prefer-color-scheme
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    // Check if navbar exists before prepending
    const navbar = document.querySelector('custom-navbar');
    if (navbar) {
            const navContainer = navbar.shadowRoot.querySelector('.nav-container');
            if (navContainer) {
                navContainer.prepend(themeToggle);
            }
}
    
    // Theme toggle event
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        feather.replace();
    });
    
    feather.replace();
});

// Auth state management
let currentUser = null;

function setAuthState(user) {
    currentUser = user;
    const navbar = document.querySelector('custom-navbar');
    if (navbar) {
        navbar.setAttribute('auth', user ? 'true' : 'false');
        if (user) {
            navbar.setAttribute('role', user.isAdmin ? 'admin' : 'voter');
        }
    }
}

// Demo login function
function demoLogin(email, password) {
    // In a real app, this would be an API call
    return new Promise((resolve) => {
        setTimeout(() => {
            if (email === 'admin@blockvote.com' && password === 'admin123') {
                resolve({
                    id: 'admin-1',
                    name: 'Admin User',
                    email: 'admin@blockvote.com',
                    isAdmin: true
                });
            } else {
                // Mock voter login
                resolve({
                    id: 'user-' + Math.floor(Math.random() * 1000),
                    name: 'Demo Voter',
                    email: email,
                    walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
                    isAdmin: false
                });
            }
        }, 800);
    });
}

// Handle successful login
function handleLoginSuccess(user) {
    setAuthState(user);
    if (user.isAdmin) {
        window.location.href = 'admin-dashboard.html';
    } else {
        window.location.href = 'voter-dashboard.html';
    }
}