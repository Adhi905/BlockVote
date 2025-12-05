class CustomAuthModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['open', 'mode'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const isOpen = this.getAttribute('open') === 'true';
        const isSignup = this.getAttribute('mode') === 'signup';

        this.shadowRoot.innerHTML = `
            <style>
                .modal-overlay {
                    background-color: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                }
                .modal-content {
                    transform: translateY(-20px);
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                .modal-open .modal-content {
                    transform: translateY(0);
                    opacity: 1;
                }
                .input-field {
                    transition: all 0.2s ease;
                }
                .input-field:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                }
                .tab {
                    position: relative;
                }
                .tab-active:after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background-color: #3b82f6;
                }
            </style>
            
            <div class="fixed inset-0 z-50 ${isOpen ? 'flex' : 'hidden'} items-center justify-center modal-overlay">
                <div class="modal-content bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                    <div class="absolute top-4 right-4">
                        <button id="closeModalBtn" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i data-feather="x" class="text-gray-500 dark:text-gray-400"></i>
                        </button>
                    </div>
                    
                    <div class="px-8 py-8">
                        <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                            <button class="tab ${isSignup ? '' : 'tab-active'} px-4 py-2 font-medium text-gray-900 dark:text-white mr-2" data-tab="login">Sign In</button>
                            <button class="tab ${isSignup ? 'tab-active' : ''} px-4 py-2 font-medium text-gray-900 dark:text-white" data-tab="signup">Sign Up</button>
                        </div>
                        
                        <form id="authForm" class="space-y-4">
                            ${isSignup ? `
                                <div>
                                    <label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <input type="text" id="fullName" name="fullName" required class="input-field w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                                <div>
                                    <label for="age" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                                    <input type="number" id="age" name="age" min="18" required class="input-field w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                            ` : ''}
                            
                            <div>
                                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" id="email" name="email" required class="input-field w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            </div>
                            
                            ${isSignup ? `
                                <div>
                                    <label for="walletAddress" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wallet Address</label>
                                    <input type="text" id="walletAddress" name="walletAddress" required class="input-field w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0x...">
                                </div>
                            ` : ''}
                            
                            <div>
                                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input type="password" id="password" name="password" required class="input-field w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            </div>
                            
                            ${!isSignup ? `
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <input type="checkbox" id="rememberMe" name="rememberMe" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600">
                                        <label for="rememberMe" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Remember me</label>
                                    </div>
                                    <a href="#" class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Forgot password?</a>
                                </div>
                            ` : ''}
                            
                            <button type="submit" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
                                ${isSignup ? 'Create Account' : 'Sign In'}
                            </button>
                            
                            ${!isSignup ? `
                                <div class="text-center text-sm text-gray-600 dark:text-gray-400">
                                    Don't have an account? 
                                    <button type="button" id="switchToSignup" class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Sign up</button>
                                </div>
                                <div class="relative">
                                    <div class="absolute inset-0 flex items-center">
                                        <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                    </div>
                                    <div class="relative flex justify-center text-sm">
                                        <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                                    </div>
                                </div>
                                <button type="button" id="demoAdminBtn" class="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition">
                                    Demo Admin Login
                                </button>
                            ` : ''}
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        if (isOpen) {
            setTimeout(() => {
                this.shadowRoot.querySelector('.modal-content').classList.add('modal-open');
            }, 10);
        }

        this.shadowRoot.getElementById('closeModalBtn').addEventListener('click', () => {
            this.setAttribute('open', 'false');
        });

        this.shadowRoot.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', () => {
                this.setAttribute('mode', tab.dataset.tab);
            });
        });

        if (this.shadowRoot.getElementById('switchToSignup')) {
            this.shadowRoot.getElementById('switchToSignup').addEventListener('click', () => {
                this.setAttribute('mode', 'signup');
            });
        }

        if (this.shadowRoot.getElementById('demoAdminBtn')) {
            this.shadowRoot.getElementById('demoAdminBtn').addEventListener('click', async () => {
                const demoEmail = 'admin@blockvote.com';
                const demoPassword = 'admin123';
                
                try {
                    const user = await demoLogin(demoEmail, demoPassword);
                    handleLoginSuccess(user);
                    this.setAttribute('open', 'false');
                } catch (error) {
                    alert(error.message);
                }
            });
        }

        this.shadowRoot.getElementById('authForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = this.shadowRoot.getElementById('email').value;
            const password = this.shadowRoot.getElementById('password').value;
            
            try {
                const user = await demoLogin(email, password);
                handleLoginSuccess(user);
                this.setAttribute('open', 'false');
            } catch (error) {
                alert(error.message);
            }
        });

        feather.replace();
    }
}

customElements.define('custom-auth-modal', CustomAuthModal);