const fs = require('fs');

const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Housing'];
const titles = ['Uber Ride', 'Morning Coffee', 'Supermarket Groceries', 'Amazon Purchase', 'Electricity Bill', 'Netflix', 'Pharmacy Meds', 'Dinner Delivery', 'Gym Supplement'];

// Start with the CSV Headers
let csvContent = 'Date,Title,Category,Type,Amount\n';

// Loop 500 times to create 500 transactions!
for (let i = 0; i < 500; i++) {
  // Generate a random day in March 2026
  const day = Math.floor(Math.random() * 31) + 1;
  const date = `2026-03-${day.toString().padStart(2, '0')}`;
  
  // 90% chance it's an expense, 10% chance it's income
  const isIncome = Math.random() > 0.9; 
  
  let category, title, amount, type;
  
  if (isIncome) {
    type = 'income';
    category = 'Other';
    title = 'Freelance Client Payment';
    amount = Math.floor(Math.random() * 15000) + 2000; // Random amount between 2000 and 17000
  } else {
    type = 'expense';
    category = categories[Math.floor(Math.random() * categories.length)];
    title = titles[Math.floor(Math.random() * titles.length)];
    amount = Math.floor(Math.random() * 2500) + 100; // Random amount between 100 and 2600
  }

  csvContent += `${date},${title},${category},${type},${amount}\n`;
}

// Create the file!
fs.writeFileSync('massive_march_data.csv', csvContent);
console.log('✅ BOOM! Successfully generated 500 transactions in massive_march_data.csv!');
