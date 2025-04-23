# Where To Buy IT

A static webpage calculator that helps you compare prices between two stores, taking into account unit pricing and delivery fees.

🌐 [Try it live!](https://tomvarga.github.io/WhereToBuyIT)

## Features

### Store Information
- Customizable store names
- Values persist between page reloads
- Green highlighting for the cheaper option

### Price Calculations
- Price of item
- Units in item (e.g., number of liters in a bottle)
- Quantity to buy (e.g., number of bottles)
- Delivery fee
- Support for basic math in all numeric fields (e.g., "600+150+289")

### Price Comparisons
- Total price calculation
- Total units calculation
- Base price per unit
- Total price per unit (including delivery)
- Price difference between stores
- Savings message showing how much you'll save

### User Interface
- Dark/light theme toggle
- Theme preference saves between sessions
- Responsive design that works on mobile and desktop
- Real-time calculations as you type

## How to Use

1. Enter names for your stores (optional)
2. For each store, enter:
   - Price of the item
   - Units in the item (e.g., 2 for a 2-liter bottle)
   - Quantity to buy (e.g., 3 bottles)
   - Delivery fee

3. The calculator will automatically:
   - Calculate the total cost
   - Show the price per unit
   - Show the total units you're getting
   - Highlight the cheaper option in green
   - Display how much you'll save

### Math Expressions

You can use basic math in any numeric field:
- Addition: `2 + 3`
- Subtraction: `10 - 2`
- Multiplication: `4 * 3`
- Division: `10 / 2`
- Combinations: `(2 + 3) * 4`

For example, you can enter `600+150+289` for a delivery fee that has multiple components.

## Technical Details

This is a completely static webpage that:
- Requires no server
- Works offline
- Saves all values to localStorage
- Performs all calculations client-side
- Can be hosted on any static hosting service