// src/utils/smsParser.js

export const parseSMS = (text) => {
  if (!text) return null;

  // 1. Detect Amount (Looks for Rs., INR, or just numbers after 'debited')
  const amountRegex = /(?:Rs\.?|INR)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i;
  const amountMatch = text.match(amountRegex);
  let amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  // 2. Detect Type (Credit or Debit)
  const isCredit = /credited|received|deposited/i.test(text);
  const type = isCredit ? 'income' : 'expense';

  // 3. Detect Merchant/Source (The hardest part!)
  // Strategy: Look for "at" or "to" or "from" followed by text
  // Added '|for' to the list of prepositions
  const merchantRegex = /(?:at|to|from|for)\s+([A-Za-z0-9\s]+?)(?:\s+(?:on|using|via|ref|bal)|$)/i;
  const merchantMatch = text.match(merchantRegex);
  
  // Default title if we can't find a merchant
  let title = merchantMatch ? merchantMatch[1].trim() : 'Unknown Transaction';
  
  // Clean up common bank SMS garbage text from the title
  title = title.replace(/UPI|REF|NEFT|IMPS/gi, '').trim();

  // 4. Detect Date (If present, otherwise use today)
  // Looks for patterns like 12-05-2025 or 12/05/25
  const dateRegex = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/;
  const dateMatch = text.match(dateRegex);
  
  let date = new Date().toISOString().split('T')[0]; // Default to today
  if (dateMatch) {
    // Attempt to parse the found date
    // Note: This assumes DD-MM-YYYY format common in India
    const parts = dateMatch[0].split(/[-/]/);
    if (parts.length === 3) {
      // Reformat to YYYY-MM-DD for HTML input
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) year = '20' + year;
      date = `${year}-${month}-${day}`;
    }
  }

  return {
    title,
    amount,
    type,
    category: 'Other', // We can't guess category easily, default to Other
    date
  };
};