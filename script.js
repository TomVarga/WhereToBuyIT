document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Set initial theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

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

    function saveToLocalStorage() {
        const data = {
            theme: document.documentElement.getAttribute('data-theme'),
            stores: {}
        };

        ['1', '2'].forEach(storeId => {
            data.stores[storeId] = {
                name: document.querySelector(`.store-name[data-store="${storeId}"]`).value,
                price: document.querySelector(`.price[data-store="${storeId}"]`).value,
                units: document.querySelector(`.units[data-store="${storeId}"]`).value,
                quantity: document.querySelector(`.quantity[data-store="${storeId}"]`).value,
                delivery: document.querySelector(`.delivery[data-store="${storeId}"]`).value
            };
        });

        localStorage.setItem('whereToBuyItData', JSON.stringify(data));
    }

    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('whereToBuyItData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Load theme
            document.documentElement.setAttribute('data-theme', data.theme || 'dark');

            // Load data for each store
            ['1', '2'].forEach(storeId => {
                if (data.stores[storeId]) {
                    const store = data.stores[storeId];
                    document.querySelector(`.store-name[data-store="${storeId}"]`).value = store.name || '';
                    document.querySelector(`.price[data-store="${storeId}"]`).value = store.price || '';
                    document.querySelector(`.units[data-store="${storeId}"]`).value = store.units || '';
                    document.querySelector(`.quantity[data-store="${storeId}"]`).value = store.quantity || '';
                    document.querySelector(`.delivery[data-store="${storeId}"]`).value = store.delivery || '';
                }
            });

            // Update calculations
            updatePrices();
        }
    }
    
    function calculatePrices(storeId) {
        const priceInput = document.querySelector(`.price[data-store="${storeId}"]`).value;
        const unitsInput = document.querySelector(`.units[data-store="${storeId}"]`).value;
        const quantityInput = document.querySelector(`.quantity[data-store="${storeId}"]`).value;
        const deliveryInput = document.querySelector(`.delivery[data-store="${storeId}"]`).value;
        const storeName = document.querySelector(`.store-name[data-store="${storeId}"]`).value || `Store ${storeId}`;

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
            `Total: $${store1Prices.total.toFixed(2)} (${store1Prices.totalUnits.toFixed(store1Prices.unitsPrecision)} units)`;
        document.querySelector('#store1 .base-price').textContent = 
            `Base price per unit: $${store1Prices.basePricePerUnit.toFixed(2)}`;
        document.querySelector('#store1 .total-price').textContent = 
            `Total price per unit (with delivery): $${store1Prices.totalPricePerUnit.toFixed(2)}`;

        // Update displays for Store 2
        document.querySelector('#store2 .total').textContent = 
            `Total: $${store2Prices.total.toFixed(2)} (${store2Prices.totalUnits.toFixed(store2Prices.unitsPrecision)} units)`;
        document.querySelector('#store2 .base-price').textContent = 
            `Base price per unit: $${store2Prices.basePricePerUnit.toFixed(2)}`;
        document.querySelector('#store2 .total-price').textContent = 
            `Total price per unit (with delivery): $${store2Prices.totalPricePerUnit.toFixed(2)}`;

        // Calculate and display price difference
        const priceDifference = Math.abs(store1Prices.total - store2Prices.total);
        const differenceElement = document.querySelector('.difference-amount');
        const savingsElement = document.querySelector('.savings-message');

        if (store1Prices.total > 0 && store2Prices.total > 0) {
            differenceElement.textContent = `Difference: $${priceDifference.toFixed(2)}`;
            
            if (priceDifference === 0) {
                savingsElement.textContent = `${store1Prices.name} and ${store2Prices.name} cost the same!`;
            } else {
                const cheaper = store1Prices.total < store2Prices.total ? store1Prices : store2Prices;
                savingsElement.textContent = 
                    `You'll save $${priceDifference.toFixed(2)} by shopping at ${cheaper.name}!`;
            }
        } else {
            differenceElement.textContent = "Difference: $0.00";
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

    // Load saved data when page loads
    loadFromLocalStorage();

    // Add event listeners to all inputs
    inputs.forEach(input => {
        input.addEventListener('input', updatePrices);
    });

    // Add event listener for theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        saveToLocalStorage();
    });
}); 