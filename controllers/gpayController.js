function generateUpiUrl({ upiId, payeeName, amount, transactionId, transactionRefId, transactionNote }) {
    // Construct the UPI payment URL
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&tid=${encodeURIComponent(transactionId)}&tr=${encodeURIComponent(transactionRefId)}&tn=${encodeURIComponent(transactionNote)}&am=${encodeURIComponent(amount)}&cu=INR`;
    return upiUrl;
}

// Example usage
const upiId = 'yourname@upi';
const payeeName = 'Your Business Name';
const amount = '500.00';
const transactionId = 'TXN123456';
const transactionRefId = 'REF123456';
const transactionNote = 'Payment for Order #5678';

const upiPaymentUrl = generateUpiUrl({ upiId, payeeName, amount, transactionId, transactionRefId, transactionNote });
console.log(upiPaymentUrl);
