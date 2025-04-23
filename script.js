document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input');
    const themeToggle = document.getElementById('theme-toggle');
    const currencySelect = document.getElementById('currency-select');
    
    // Add version check
    const STORAGE_VERSION = '1.0';
    const currentVersion = localStorage.getItem('whereToBuyItVersion');
    if (currentVersion !== STORAGE_VERSION) {
        localStorage.clear();
        localStorage.setItem('whereToBuyItVersion', STORAGE_VERSION);
    }
    
    const currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'AUD': '$',
        'CAD': '$',
        'HUF': 'Ft'
    };

    // Set initial currency if not already set
    if (!localStorage.getItem('currency')) {
        localStorage.setItem('currency', 'USD');
    }
    
    // Initialize currency select
    currencySelect.value = localStorage.getItem('currency') || 'USD';

    function getDecimalPlaces(number) {
        const decimalStr = number.toString().split('.')[1];
        return decimalStr ? decimalStr.length : 0;
    }
    
    function evaluateExpression(expression) {
        if (!expression) return 0;
        try {
            const sanitizedExpression = expression.replace(/\s+/g, '');
            return Function('"use strict";return (' + sanitizedExpression + ')')();
        } catch (error) {
            console.log('Error evaluating expression:', error);
            const numericValue = parseFloat(expression);
            return isNaN(numericValue) ? 0 : numericValue;
        }
    }

    function formatCurrency(amount) {
        const currency = currencySelect.value;
        const symbol = currencySymbols[currency];
        
        // Convert to string and remove trailing zeros after decimal
        let [whole, decimal] = amount.toString().split('.');
        
        // Format based on whether there are decimal places
        let formattedAmount;
        if (currency === 'JPY') {
            formattedAmount = whole;
        } else if (decimal) {
            // Remove trailing zeros from decimal
            decimal = decimal.replace(/0+$/, '');
            formattedAmount = decimal ? `${whole}.${decimal}` : whole;
        } else {
            formattedAmount = whole;
        }
        
        // Position the currency symbol
        if (currency === 'HUF') {
            return `${formattedAmount} ${symbol}`;
        } else if (currency === 'JPY') {
            return `${formattedAmount}${symbol}`;
        } else {
            return `${symbol}${formattedAmount}`;
        }
    }

    function saveToLocalStorage() {
        const data = {
            theme: document.documentElement.getAttribute('data-theme'),
            currency: currencySelect.value,
            stores: {}
        };

        ['1', '2'].forEach(storeId => {
            data.stores[storeId] = {
                name: document.querySelector(`.store-name[data-store="${storeId}"]`)?.value || '',
                price: document.querySelector(`.price[data-store="${storeId}"]`)?.value || '',
                units: document.querySelector(`.units[data-store="${storeId}"]`)?.value || '',
                quantity: document.querySelector(`.quantity[data-store="${storeId}"]`)?.value || '',
                delivery: document.querySelector(`.delivery[data-store="${storeId}"]`)?.value || ''
            };
        });

        console.log('Saving data:', data); // Debug log
        localStorage.setItem('whereToBuyItData', JSON.stringify(data));
    }

    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('whereToBuyItData');
        console.log('Loading saved data:', savedData); // Debug log
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                console.log('Parsed data:', data); // Debug log
                
                // Load currency first
                if (data.currency && currencySymbols[data.currency]) {
                    console.log('Setting currency to:', data.currency); // Debug log
                    currencySelect.value = data.currency;
                }

                // Load theme
                if (data.theme) {
                    document.documentElement.setAttribute('data-theme', data.theme);
                }

                // Load store data
                ['1', '2'].forEach(storeId => {
                    if (data.stores && data.stores[storeId]) {
                        const store = data.stores[storeId];
                        const nameInput = document.querySelector(`.store-name[data-store="${storeId}"]`);
                        const priceInput = document.querySelector(`.price[data-store="${storeId}"]`);
                        const unitsInput = document.querySelector(`.units[data-store="${storeId}"]`);
                        const quantityInput = document.querySelector(`.quantity[data-store="${storeId}"]`);
                        const deliveryInput = document.querySelector(`.delivery[data-store="${storeId}"]`);

                        if (nameInput) nameInput.value = store.name || '';
                        if (priceInput) priceInput.value = store.price || '';
                        if (unitsInput) unitsInput.value = store.units || '';
                        if (quantityInput) quantityInput.value = store.quantity || '';
                        if (deliveryInput) deliveryInput.value = store.delivery || '';
                    }
                });

                // Update calculations
                updatePrices();
            } catch (error) {
                console.error('Error loading saved data:', error);
                localStorage.removeItem('whereToBuyItData');
            }
        }
    }
    
    function calculatePrices(storeId) {
        const priceInput = document.querySelector(`.price[data-store="${storeId}"]`)?.value || '';
        const unitsInput = document.querySelector(`.units[data-store="${storeId}"]`)?.value || '';
        const quantityInput = document.querySelector(`.quantity[data-store="${storeId}"]`)?.value || '';
        const deliveryInput = document.querySelector(`.delivery[data-store="${storeId}"]`)?.value || '';
        const storeName = document.querySelector(`.store-name[data-store="${storeId}"]`)?.value || `Store ${storeId}`;

        const price = evaluateExpression(priceInput);
        const units = evaluateExpression(unitsInput);
        const quantity = evaluateExpression(quantityInput);
        const delivery = evaluateExpression(deliveryInput);
        
        const unitsPrecision = getDecimalPlaces(units);
        const totalUnits = units * quantity;
        const basePricePerUnit = units > 0 ? price / units : 0;
        const totalPricePerUnit = totalUnits > 0 ? 
            basePricePerUnit + (delivery / totalUnits) : 0;
        const total = (basePricePerUnit * totalUnits) + delivery;
        
        return {
            total,
            basePricePerUnit,
            totalPricePerUnit,
            totalUnits,
            unitsPrecision,
            name: storeName
        };
    }

    function updatePrices() {
        const store1Prices = calculatePrices('1');
        const store2Prices = calculatePrices('2');

        // Update displays for Store 1
        document.querySelector('#store1 .total').textContent = 
            `Total: ${formatCurrency(store1Prices.total)} (${store1Prices.totalUnits.toFixed(store1Prices.unitsPrecision)} units)`;
        document.querySelector('#store1 .base-price').textContent = 
            `Base price per unit: ${formatCurrency(store1Prices.basePricePerUnit)}`;
        document.querySelector('#store1 .total-price').textContent = 
            `Total price per unit (with delivery): ${formatCurrency(store1Prices.totalPricePerUnit)}`;

        // Update displays for Store 2
        document.querySelector('#store2 .total').textContent = 
            `Total: ${formatCurrency(store2Prices.total)} (${store2Prices.totalUnits.toFixed(store2Prices.unitsPrecision)} units)`;
        document.querySelector('#store2 .base-price').textContent = 
            `Base price per unit: ${formatCurrency(store2Prices.basePricePerUnit)}`;
        document.querySelector('#store2 .total-price').textContent = 
            `Total price per unit (with delivery): ${formatCurrency(store2Prices.totalPricePerUnit)}`;

        // Update price difference
        const priceDifference = Math.abs(store1Prices.total - store2Prices.total);
        const differenceElement = document.querySelector('.difference-amount');
        const savingsElement = document.querySelector('.savings-message');

        if (store1Prices.total > 0 && store2Prices.total > 0) {
            differenceElement.textContent = `Difference: ${formatCurrency(priceDifference)}`;
            
            if (priceDifference === 0) {
                savingsElement.textContent = `${store1Prices.name} and ${store2Prices.name} cost the same!`;
            } else {
                const cheaper = store1Prices.total < store2Prices.total ? store1Prices : store2Prices;
                savingsElement.textContent = 
                    `You'll save ${formatCurrency(priceDifference)} by shopping at ${cheaper.name}!`;
            }
        } else {
            differenceElement.textContent = `Difference: ${formatCurrency(0)}`;
            savingsElement.textContent = "Enter values for both stores to see the difference";
        }

        // Update store highlighting
        document.querySelectorAll('.store').forEach(store => {
            store.classList.remove('cheaper');
        });

        if (store1Prices.total < store2Prices.total && store1Prices.total > 0) {
            document.querySelector('#store1').classList.add('cheaper');
        } else if (store2Prices.total < store1Prices.total && store2Prices.total > 0) {
            document.querySelector('#store2').classList.add('cheaper');
        }

        // Save the current state
        saveToLocalStorage();
    }

    // Initialize
    loadFromLocalStorage();

    // Add event listeners
    inputs.forEach(input => {
        input.addEventListener('input', updatePrices);
    });

    currencySelect.addEventListener('change', () => {
        localStorage.setItem('currency', currencySelect.value);
        updatePrices();
    });

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        saveToLocalStorage();
    });
}); 