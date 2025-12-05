class CustomNavbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['auth', 'role'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const isAuthenticated = this.getAttribute('auth') === 'true';
        const isAdmin = this.getAttribute('role') === 'admin';

        this.shadowRoot.innerHTML = `
            <style>
                .nav-container {
                    backdrop-filter: blur(10px);
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .dark .nav-container {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                }
                .nav-link {
                    position: relative;
                    transition: all 0.3s ease;
                }
                .nav-link:hover {
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8),
                                 0 0 20px rgba(255, 255, 255, 0.6),
                                 0 0 30px rgba(255, 255, 255, 0.4);
                    transform: scale(1.05);
                }
                .btn-signup {
                    transition: all 0.3s ease;
                }
                .btn-signup:hover {
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.6),
                                0 0 30px rgba(255, 255, 255, 0.4),
                                0 0 45px rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }
                .user-avatar {
                    transition: transform 0.2s ease;
                }
                .user-avatar:hover {
                    transform: scale(1.1);
                }
                .dropdown {
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(10px);
                    transition: all 0.2s ease;
                }
                .dropdown-container:hover .dropdown {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
            </style>
            
            <nav class="nav-container fixed w-full z-50 px-6 py-4">
                <div class="max-w-6xl mx-auto flex justify-between items-center">
                    <a href="index.html" class="flex items-center space-x-2">
                                <i data-feather="map-pin" class="text-white"></i>
                                <span class="text-xl font-bold text-white">BlockVote Geo</span>
</a>
                    
                    <div class="flex items-center space-x-6">
                        ${isAuthenticated ? `
                            <div class="dropdown-container relative">
                                <div class="flex items-center space-x-2 cursor-pointer">
                                    <div class="user-avatar w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                                        ${isAdmin ? 'A' : 'V'}
                                    </div>
                                    <span class="text-gray-700 dark:text-gray-300 font-medium">
                                        ${isAdmin ? 'Admin' : 'Voter'}
                                    </span>
                                    <i data-feather="chevron-down" class="text-gray-500 dark:text-gray-400 w-4 h-4"></i>
                                </div>
                                <div class="dropdown absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                                    ${isAdmin ? `
                                        <a href="admin-dashboard.html" class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</a>
                                        <a href="create-election.html" class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">New Election</a>
                                    ` : `
                                        <a href="voter-dashboard.html" class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</a>
                                        <a href="elections.html" class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">My Elections</a>
                                    `}
                                    <a href="#" id="logoutBtn" class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Sign Out</a>
                                </div>
                            </div>
                        ` : `
                            <button id="navLoginBtn" class="nav-link text-white font-medium">Sign In</button>
                                    <button id="navSignupBtn" class="btn-signup px-4 py-2 bg-white text-green-600 hover:bg-green-50 rounded-lg font-medium">Sign Up</button>
`}
                    </div>
                </div>
            </nav>
        `;

        // Add event listeners
        if (!isAuthenticated) {
            this.shadowRoot.getElementById('navLoginBtn').addEventListener('click', () => {
                document.querySelector('custom-auth-modal').setAttribute('mode', 'login');
                document.querySelector('custom-auth-modal').setAttribute('open', 'true');
            });
            
            this.shadowRoot.getElementById('navSignupBtn').addEventListener('click', () => {
                document.querySelector('custom-auth-modal').setAttribute('mode', 'signup');
                document.querySelector('custom-auth-modal').setAttribute('open', 'true');
            });
        } else {
            this.shadowRoot.getElementById('logoutBtn').addEventListener('click', () => {
                setAuthState(null);
                window.location.href = 'index.html';
            });
        }

        feather.replace();
    }
}

customElements.define('custom-navbar', CustomNavbar);