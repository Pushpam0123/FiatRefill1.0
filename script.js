document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let currentStep = 1;
    let isLoginMode = true;
    let isUserLoggedIn = false;
    let cryptoPrices = {};

    // --- DOM Element References ---
    const form = document.getElementById('orderForm');
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const successMessage = document.getElementById('successMessage');
    const formProgressBarContainer = document.getElementById('form-progress-bar');
    const progressBar = document.getElementById('progressBar');
    const stepNames = Array.from(document.querySelectorAll('[id^="step-name-"]'));
    
    // Main Content Wrappers
    const mainContent = document.getElementById('main-content');
    const orderHistorySection = document.getElementById('order-history-section');
    const orderList = document.getElementById('order-list');

    // --- Buttons ---
    const nextBtn1 = document.getElementById('next-to-2');
    const prevBtn1 = document.getElementById('prev-to-1');
    const nextBtn2 = document.getElementById('next-to-3');
    const prevBtn2 = document.getElementById('prev-to-2');
    const nextBtn3 = document.getElementById('next-to-4');
    const prevBtn3 = document.getElementById('prev-to-3');
    const startNewBtn = document.getElementById('startNewRequest');
    const logoBtn = document.getElementById('logo-btn');

    // --- Cost Estimator ---
    const productPriceInput = document.getElementById('productPrice');
    const costEstimatorDiv = document.getElementById('cost-estimator');
    const cryptoEstimatesDiv = document.getElementById('crypto-estimates');

    // --- Fast Delivery ---
    const fastDeliveryCheckbox = document.getElementById('fast-delivery');
    const fastDeliveryFeeEl = document.getElementById('fast-delivery-fee');
    
    // --- Auth Modal Elements ---
    const authModal = document.getElementById('auth-modal');
    const modalContainer = authModal.querySelector('.modal-container');
    const accountBtn = document.getElementById('account-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const authSwitchLink = document.getElementById('auth-switch-link');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authForm = document.getElementById('auth-form');
    
    // --- Nav Links ---
    const logoutBtn = document.getElementById('logout-btn');
    const orderHistoryBtn = document.getElementById('order-history-btn');


    // --- Functions ---
    const showStep = (stepNumber) => {
        steps.forEach((step, index) => {
            step.classList.toggle('hidden', (index + 1) !== stepNumber);
        });
        const progressPercentage = (stepNumber / steps.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        stepNames.forEach((name, index) => {
            name.classList.toggle('font-bold', (index + 1) <= stepNumber);
            name.classList.toggle('text-blue-400', (index + 1) <= stepNumber);
        });
        currentStep = stepNumber;
    };

    const validateStep = (stepNumber) => {
        const inputs = steps[stepNumber - 1].querySelectorAll('input[required]');
        for (const input of inputs) {
            if (!input.checkValidity()) {
                input.reportValidity();
                return false;
            }
        }
        return true;
    };

    const populateSummary = () => {
        document.getElementById('summary-link').textContent = document.getElementById('productLink').value;
        const address = `${document.getElementById('address').value}, ${document.getElementById('city').value}, ${document.getElementById('state').value} - ${document.getElementById('pincode').value}`;
        document.getElementById('summary-address').textContent = address;
        const contact = `${document.getElementById('fullName').value} | ${document.getElementById('email').value} | ${document.getElementById('phone').value}`;
        document.getElementById('summary-contact').textContent = contact;
    };
    
    const fetchCryptoPrices = async () => {
        const tickerContainer = document.getElementById('crypto-ticker-container');
        if (!tickerContainer) {
            console.error("Crypto ticker container not found in the HTML.");
            return;
        }
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=inr');
            if (!response.ok) throw new Error('Network response was not ok');
            cryptoPrices = await response.json();
            
            let tickerHTML = '<div class="ticker-track">';
            const items = Object.entries(cryptoPrices).map(([key, value]) => 
                `<div class="ticker-item">${key.charAt(0).toUpperCase() + key.slice(1)}: <span class="text-green-400">₹${value.inr.toLocaleString('en-IN')}</span></div>`
            ).join('');
            tickerHTML += items + '</div><div class="ticker-track">' + items + '</div>'; // Duplicate for seamless scroll

            tickerContainer.innerHTML = tickerHTML;
        } catch (error) {
            tickerContainer.innerHTML = `<div class="text-center w-full text-red-400">Could not load crypto prices.</div>`;
            console.error("Failed to fetch crypto prices:", error);
        }
    };

    const calculateCryptoCosts = () => {
        const priceINR = parseFloat(productPriceInput.value);
        if (isNaN(priceINR) || priceINR <= 0) {
            costEstimatorDiv.classList.add('hidden');
            return;
        }

        costEstimatorDiv.classList.remove('hidden');
        let estimatesHTML = '';

        if (cryptoPrices.bitcoin) {
            const btcCost = (priceINR / cryptoPrices.bitcoin.inr).toFixed(6);
            estimatesHTML += `<p><strong>BTC:</strong> ${btcCost}</p>`;
        }
        if (cryptoPrices.ethereum) {
            const ethCost = (priceINR / cryptoPrices.ethereum.inr).toFixed(4);
            estimatesHTML += `<p><strong>ETH:</strong> ${ethCost}</p>`;
        }
        if (cryptoPrices.tether) {
            const usdtCost = (priceINR / cryptoPrices.tether.inr).toFixed(2);
            estimatesHTML += `<p><strong>USDT:</strong> ${usdtCost}</p>`;
        }
        
        cryptoEstimatesDiv.innerHTML = estimatesHTML || '<p>Could not calculate estimates.</p>';
    };

    const updateNav = () => {
        accountBtn.classList.toggle('hidden', isUserLoggedIn);
        logoutBtn.classList.toggle('hidden', !isUserLoggedIn);
    };

    const showMainContent = () => {
        mainContent.classList.remove('hidden');
        orderHistorySection.classList.add('hidden');
    };

    const showOrderHistory = () => {
        mainContent.classList.add('hidden');
        orderHistorySection.classList.remove('hidden');
    };

    const openModal = (loginMode) => {
        isLoginMode = loginMode;
        modalTitle.textContent = isLoginMode ? 'Login' : 'Sign Up';
        modalSubtitle.textContent = isLoginMode ? 'Welcome back! Please enter your details.' : 'Create an account to get started.';
        authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Create Account';
        document.getElementById('auth-switch-text').textContent = isLoginMode ? "Don't have an account?" : "Already have an account?";
        authSwitchLink.textContent = isLoginMode ? "Sign Up" : "Login";
        
        authModal.classList.remove('hidden');
        setTimeout(() => {
            authModal.classList.remove('opacity-0');
            modalContainer.classList.remove('scale-95', 'opacity-0');
        }, 10);
    };

    const closeModal = () => {
        authModal.classList.add('opacity-0');
        modalContainer.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            authModal.classList.add('hidden');
        }, 300);
    };

    const login = () => {
        isUserLoggedIn = true;
        updateNav();
        closeModal();
    };

    const logout = () => {
        isUserLoggedIn = false;
        updateNav();
        showMainContent();
    };

    // --- Event Listeners ---
    nextBtn1.addEventListener('click', () => { if (validateStep(1)) showStep(2); });
    prevBtn1.addEventListener('click', () => showStep(1));
    nextBtn2.addEventListener('click', () => { if (validateStep(2)) showStep(3); });
    prevBtn2.addEventListener('click', () => showStep(2));
    nextBtn3.addEventListener('click', () => { 
        if (validateStep(3)) {
            populateSummary();
            showStep(4);
        }
    });
    prevBtn3.addEventListener('click', () => showStep(3));

    productPriceInput.addEventListener('input', calculateCryptoCosts);

    fastDeliveryCheckbox.addEventListener('change', (e) => {
        fastDeliveryFeeEl.classList.toggle('hidden', !e.target.checked);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.classList.add('hidden');
        formProgressBarContainer.classList.add('hidden');
        successMessage.classList.remove('hidden');
    });

    startNewBtn.addEventListener('click', () => {
        form.reset();
        fastDeliveryFeeEl.classList.add('hidden');
        costEstimatorDiv.classList.add('hidden');
        form.classList.remove('hidden');
        formProgressBarContainer.classList.remove('hidden');
        successMessage.classList.add('hidden');
        showStep(1);
    });
    
    // --- Auth Modal Listeners ---
    accountBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(true); });
    closeModalBtn.addEventListener('click', closeModal);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
    });
    authSwitchLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(!isLoginMode);
    });
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        //  real auth logic
        login();
    });

    // --- Logged In Nav Listeners ---
    orderHistoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isUserLoggedIn) {
            showOrderHistory();
        } else {
            openModal(true);
        }
    });
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    logoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showMainContent();
    });
    
    // --- Order History Click Listener ---
    orderList.addEventListener('click', (e) => {
        const orderItem = e.target.closest('.order-item');
        if (orderItem) {
            orderItem.classList.toggle('open');
        }
    });

    // --- Initialize ---
    fetchCryptoPrices();
    showStep(1);
    updateNav();
});
