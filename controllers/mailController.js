const nodemailer = require('nodemailer');
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 465
ADMIN_EMAIL = 'kiskaonlineshoppy@gmail.com';
EMAIL_SECURE = 'true'



// Create a transporter using your email service credentials
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST, // e.g., 'smtp.gmail.com'
  port: EMAIL_PORT, // e.g., 587 for TLS, 465 for SSL
  secure: EMAIL_SECURE, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Function to send the order confirmation email to the user
const sendOrderConfirmationEmail = async (order, recipientEmail) => {
  try {
    const mailOptions = {
      from: `"Kiska Online" <${process.env.EMAIL_USER}>`, // Sender address
      to: order.userId.email, // Recipient's email (user)
      subject: 'Order Confirmation - Your Order with Us', // Subject line
      html: `
        <h1>Thank you for your order!</h1>
        <p>Order ID: ${order.orderId}</p>
        <p>Total Amount: $${order.totalAmount}</p>
        <p>Payment Status: ${order.paymentStatus}</p>
        <p>Order Status: ${order.orderStatus}</p>
        <h2>Order Details</h2>
        <ul>
          ${order.products.map(
        (product) => `
            <li>
              Product: ${product.productId.name}<br>
              Quantity: ${product.quantity}<br>
              Price: $${product.productId.price}
            </li>
            <p><b>Total Amount: ${order.totalAmount}<b><p>
          `
      ).join('')}
        </ul>
        <p>We are currently processing your order and will notify you once it has been shipped.</p>
        <p>Thank you for shopping with us!</p>
         
      `, // HTML body content
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to user successfully.');
  } catch (error) {
    console.error('Error sending order confirmation email to user:', error);
  }
};

// Function to send an order notification email to the admin
const sendOrderNotificationToAdmin = async (order) => {
  try {
    const mailOptions = {
      from: `"Kiska" <${process.env.EMAIL_USER}>`, // Sender address
      to: ADMIN_EMAIL, // Admin's email address
      subject: 'New Order Received', // Subject line
      html: `
        <h1>New Order Received</h1>
        <p>Order ID: ${order.orderId}</p>
        <p>User: ${order.userId.email}</p>
        <p>Total Amount: $${order.totalAmount}</p>
        <p>Payment Status: ${order.paymentStatus}</p>
        <p>Order Status: ${order.orderStatus}</p>
        <h2>Order Details</h2>
        <ul>
          ${order.products.map(
        (product) => `
            <li>
              Product: ${product.productId.name}<br>
              Quantity: ${product.quantity}<br>
              Price: $${product.productId.price}
            </li>
          `
      ).join('')}
        </ul>
        <h2>User Address</h2>
        <p>
        ${order.addressId.name}<br>
          ${order.addressId.street}, ${order.addressId.city}<br>
          ${order.addressId.state}, ${order.addressId.zipCode}<br>
          ${order.addressId.phone},
        </p>
      `, // HTML body content
    };

    await transporter.sendMail(mailOptions);
    console.log('Order notification email sent to admin successfully.');
  } catch (error) {
    console.error('Error sending order notification email to admin:', error);
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderNotificationToAdmin,
};

