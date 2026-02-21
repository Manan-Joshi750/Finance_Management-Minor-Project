// src/utils/smsParser.js

export const parseSMS = (text) => {
  if (!text) return null;

  // 1. Detect Amount (Looks for Rs., INR, ₹, or just numbers after 'debited')
  const amountRegex = /(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i;
  const amountMatch = text.match(amountRegex);
  let amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  if (amount === 0 || isNaN(amount)) {
    return null; // Return null if no amount is found so the app knows it failed
  }

  // 2. Detect Type (Credit or Debit)
  const isCredit = /credited|received|deposited|added|refunded/i.test(text);
  const type = isCredit ? 'income' : 'expense';

  // 3. Detect Merchant/Source 
  // eslint-disable-next-line no-useless-escape
  const merchantRegex = /(?:at|to|from|for|vpa|upi\/[^\/]+\/)\s+([A-Za-z0-9\s]+?)(?:\s+(?:on|using|via|ref|bal)|$)/i;
  const merchantMatch = text.match(merchantRegex);
  
  let title = merchantMatch ? merchantMatch[1].trim() : (isCredit ? 'Bank Deposit' : 'Unknown Transaction');
  title = title.replace(/UPI|REF|NEFT|IMPS/gi, '').trim();

  // 4. Detect Date (Using your excellent Indian date parser!)
  const dateRegex = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/;
  const dateMatch = text.match(dateRegex);
  
  let date = new Date().toISOString().split('T')[0]; // Default to today
  if (dateMatch) {
    const parts = dateMatch[0].split(/[-/]/);
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) year = '20' + year;
      date = `${year}-${month}-${day}`;
    }
  }

  // 5. Smart Category Guessing (The new addition!)
  let category = 'Others';
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('zomato') || lowerText.includes('swiggy') || lowerText.includes('restaurant')) category = 'Food';
  else if (lowerText.includes('amazon') || lowerText.includes('flipkart') || lowerText.includes('myntra')) category = 'Shopping';
  else if (lowerText.includes('uber') || lowerText.includes('ola') || lowerText.includes('irctc') || lowerText.includes('petrol')) category = 'Transport';
  else if (lowerText.includes('dth') || lowerText.includes('recharge') || lowerText.includes('jio') || lowerText.includes('airtel')) category = 'Bills';
  else if (type === 'income') category = 'Salary/Income';

  return {
    title,
    amount,
    type,
    category,
    date
  };
};