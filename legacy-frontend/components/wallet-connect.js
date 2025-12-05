class CustomWalletConnect extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['open'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const isOpen = this.getAttribute('open') === 'true';

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
                .wallet-option {
                    transition: all 0.2s ease;
                }
                .wallet-option:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .dark .wallet-option:hover {
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                }
            </style>
            
            <div class="fixed inset-0 z-50 ${isOpen ? 'flex' : 'hidden'} items-center justify-center modal-overlay">
                <div class="modal-content bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                    <div class="absolute top-4 right-4">
                        <button id="closeWalletModalBtn" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i data-feather="x" class="text-gray-500 dark:text-gray-400"></i>
                        </button>
                    </div>
                    
                    <div class="px-8 py-8">
                        <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Connect Your Wallet</h2>
                        <p class="text-center text-gray-600 dark:text-gray-300 mb-8">Choose your wallet provider to connect to BlockVote X</p>
                        
                        <div class="space-y-4">
                            <button class="wallet-option w-full flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <img src="https://cryptologos.cc/logos/metamask-logo.png" alt="MetaMask" class="w-8 h-8">
                                <span class="font-medium text-gray-900 dark:text-white">MetaMask</span>
                            </button>
                            
                            <button class="wallet-option w-full flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <img src="https://cryptologos.cc/logos/trust-wallet-twt-logo.png" alt="Trust Wallet" class="w-8 h-8">
                                <span class="font-medium text-gray-900 dark:text-white">Trust Wallet</span>
                            </button>
                            
                            <button class="wallet-option w-full flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <img src="https://cryptologos.cc/logos/coinbase-wallet-logo.png" alt="Coinbase Wallet" class="w-8 h-8">
                                <span class="font-medium text-gray-900 dark:text-white">Coinbase Wallet</span>
                            </button>
                            
                            <button class="wallet-option w-full flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <img src="https://cryptologos.cc/logos/walletconnect-logo.png" alt="WalletConnect" class="w-8 h-8">
                                <span class="font-medium text-gray-900 dark:text-white">WalletConnect</span>
                            </button>
                        </div>
                        
                        <div class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            Don't have a wallet? <a href="#" class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Learn more</a>
                        </div>
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

        this.shadowRoot.getElementById('closeWalletModalBtn').addEventListener('click', () => {
            this.setAttribute('open', 'false');
        });

        this.shadowRoot.querySelectorAll('.wallet-option').forEach(option => {
            option.addEventListener('click', () => {
                // In a real app, this would connect to the wallet
                alert('Wallet connected successfully!');
                this.setAttribute('open', 'false');
            });
        });

        feather.replace();
    }
}

customElements.define('custom-wallet-connect', CustomWalletConnect);