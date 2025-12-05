class CustomCreateElection extends HTMLElement {
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
                .input-field {
                    transition: all 0.2s ease;
                }
                .input-field:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                }
                .candidate-input {
                    transition: all 0.2s ease;
                }
                .candidate-input:focus-within {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                }
            </style>
            
            <div class="fixed inset-0 z-50 ${isOpen ? 'flex' : 'hidden'} items-center justify-center modal-overlay">
                <div class="modal-content bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-screen overflow-y-auto">
                    <div class="absolute top-4 right-4">
                        <button id="closeElectionModalBtn" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i data-feather="x" class="text-gray-500 dark:text-gray-400"></i>
                        </button>
                    </div>
                    
                    <div class="px-8 py-8">
                        <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Create New Election</h2>
                        
                        <form id="createElectionForm" class="space-y-6">
                            <div>
                                <label for="electionName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Election Name</label>
                                <input type="text" id="electionName" name="electionName" required class="input-field w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g. Student Council 2023">
                            </div>
                            
                            <div>
                                <label for="electionDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea id="electionDescription" name="electionDescription" rows="3" class="input-field w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Brief description about the election"></textarea>
                            </div>
                            
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                    <input type="datetime-local" id="startDate" name="startDate" required class="input-field w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                                <div>
                                    <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                                    <input type="datetime-local" id="endDate" name="endDate" required class="input-field w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Geofencing</label>
                                <div class="space-y-4">
                                    <div class="flex items-center">
                                        <input type="radio" id="geofenceCity" name="geofenceType" value="city" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600">
                                        <label for="geofenceCity" class="ml-3 block text-sm text-gray-700 dark:text-gray-300">City/State/Province</label>
                                    </div>
                                    <div class="flex items-center">
                                        <input type="radio" id="geofenceRadius" name="geofenceType" value="radius" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600">
                                        <label for="geofenceRadius" class="ml-3 block text-sm text-gray-700 dark:text-gray-300">Radius from location</label>
                                    </div>
                                    
                                    <div id="cityInput" class="hidden">
                                        <label for="cityName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City/State/Province</label>
                                        <input type="text" id="cityName" name="cityName" class="input-field w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g. New York, NY">
                                    </div>
                                    
                                    <div id="radiusInput" class="hidden">
                                        <div class="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="radiusValue" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Radius (meters)</label>
                                                <input type="number" id="radiusValue" name="radiusValue" min="100" class="input-field w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g. 500">
                                            </div>
                                            <div>
                                                <label for="centerLocation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Center Location</label>
                                                <input type="text" id="centerLocation" name="centerLocation" class="input-field w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Address or coordinates">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between items-center mb-2">
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Candidates</label>
                                    <button type="button" id="addCandidateBtn" class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                                        <i data-feather="plus" class="w-4 h-4 mr-1"></i>
                                        Add Candidate
                                    </button>
                                </div>
                                
                                <div id="candidatesContainer" class="space-y-3">
                                    <div class="candidate-input flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                                        <input type="text" name="candidateName" required class="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Candidate name">
                                        <button type="button" class="remove-candidate text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                            <i data-feather="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="pt-2">
                                <button type="submit" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
                                    Create Election
                                </button>
                            </div>
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

        this.shadowRoot.getElementById('closeElectionModalBtn').addEventListener('click', () => {
            this.setAttribute('open', 'false');
        });

        // Geofencing type toggle
        this.shadowRoot.querySelectorAll('input[name="geofenceType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.shadowRoot.getElementById('cityInput').classList.toggle('hidden', e.target.value !== 'city');
                this.shadowRoot.getElementById('radiusInput').classList.toggle('hidden', e.target.value !== 'radius');
            });
        });

        // Add candidate
        this.shadowRoot.getElementById('addCandidateBtn').addEventListener('click', () => {
            const container = this.shadowRoot.getElementById('candidatesContainer');
            const newCandidate = document.createElement('div');
            newCandidate.className = 'candidate-input flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg';
            newCandidate.innerHTML = `
                <input type="text" name="candidateName" required class="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Candidate name">
                <button type="button" class="remove-candidate text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                    <i data-feather="trash-2" class="w-4 h-4"></i>
                </button>
            `;
            container.appendChild(newCandidate);
            feather.replace();
            
            // Add remove event to new button
            newCandidate.querySelector('.remove-candidate').addEventListener('click', () => {
                if (container.children.length > 1) {
                    container.removeChild(newCandidate);
                } else {
                    alert('At least one candidate is required.');
                }
            });
        });

        // Remove candidate for initial element
        this.shadowRoot.querySelector('.remove-candidate').addEventListener('click', (e) => {
            const container = this.shadowRoot.getElementById('candidatesContainer');
            if (container.children.length > 1) {
                e.target.closest('.candidate-input').remove();
            } else {
                alert('At least one candidate is required.');
            }
        });

        // Form submission
        this.shadowRoot.getElementById('createElectionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Election created successfully!');
            this.setAttribute('open', 'false');
        });

        feather.replace();
    }
}

customElements.define('custom-create-election', CustomCreateElection);