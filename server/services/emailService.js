// services/emailService.js
const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(options) {
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2d5a27 0%, #4a7c45 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #2d5a27; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 Welcome to DehydratedFoods!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName}!</h2>
            <p>Thank you for joining our community of health-conscious food lovers!</p>
            <p>At DehydratedFoods, we're passionate about bringing you premium dehydrated foods that preserve nutrition, taste, and freshness.</p>
            <h3>What you can expect:</h3>
            <ul>
              <li>🍎 100% Natural Ingredients</li>
              <li>⏰ Extended Shelf Life</li>
              <li>💪 Maximum Nutrition Retention</li>
              <li>🌱 Sustainable Packaging</li>
            </ul>
            <a href="${
              process.env.CLIENT_URL
            }/shop" class="button">Start Shopping</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} DehydratedFoods. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      email: user.email,
      subject: "Welcome to DehydratedFoods! 🌿",
      html,
    });
  }

  async sendPasswordResetEmail(user, resetUrl) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5a27; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <div class="warning">
              <p><strong>⚠️ This link will expire in 10 minutes.</strong></p>
              <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      email: user.email,
      subject: "Password Reset Request (Valid for 10 minutes)",
      html,
    });
  }

  async sendEmailVerification(user, verificationUrl) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d5a27; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName},</h2>
            <p>Please verify your email address to complete your registration:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      email: user.email,
      subject: "Verify Your Email Address",
      html,
    });
  }

  async sendOrderConfirmation(order, user) {
    const itemsHtml = order.items
      .map(
        (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${
          item.name
        }" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${
          item.size
        })</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${
        item.quantity
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total.toFixed(
        2
      )}</td>
    </tr>
  `
      )
      .join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2d5a27; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .totals { background: #fff; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .button { display: inline-block; background: #2d5a27; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Order #${order.orderNumber}</p>
        </div>
        <div class="content">
          <h2>Thank you for your order, ${user.firstName}!</h2>
          <p>We're preparing your order and will notify you when it ships.</p>
          
          <table class="order-table">
            <thead>
              <tr style="background: #2d5a27; color: white;">
                <th style="padding: 10px;">Item</th>
                <th style="padding: 10px;">Product</th>
                <th style="padding: 10px;">Qty</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: ₹${order.subtotal.toFixed(2)}</p>
            ${
              order.discount > 0
                ? `<p>Discount: -₹${order.discount.toFixed(2)}</p>`
                : ""
            }
            <p>Shipping: ₹${order.shipping.cost.toFixed(2)}</p>
            <p>Tax (GST): ₹${order.tax.toFixed(2)}</p>
            <p><strong>Total: ₹${order.total.toFixed(2)}</strong></p>
          </div>
          
          <h3>Shipping Address:</h3>
          <p>
            ${order.shippingAddress.firstName} ${
      order.shippingAddress.lastName
    }<br>
            ${order.shippingAddress.street}${
      order.shippingAddress.apartment
        ? ", " + order.shippingAddress.apartment
        : ""
    }<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
      order.shippingAddress.zipCode
    }<br>
            ${order.shippingAddress.country}
          </p>
          
          <p><strong>Payment ID:</strong> ${order.payment.razorpayPaymentId}</p>
          
          <a href="${process.env.CLIENT_URL}/orders/${
      order._id
    }" class="button">Track Order</a>
        </div>
      </div>
    </body>
    </html>
  `;

    await this.sendEmail({
      email: user.email,
      subject: `Order Confirmed! #${order.orderNumber}`,
      html,
    });
  }

  async sendShippingNotification(order, user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3498db; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .tracking-box { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3498db; }
          .button { display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order Has Shipped!</h1>
          </div>
          <div class="content">
            <h2>Great news, ${user.firstName}!</h2>
            <p>Your order #${order.orderNumber} is on its way!</p>
            
            <div class="tracking-box">
              <p><strong>Carrier:</strong> ${
                order.tracking?.carrier || "Standard Shipping"
              }</p>
              <p><strong>Tracking Number:</strong> ${
                order.tracking?.trackingNumber || "Pending"
              }</p>
              ${
                order.tracking?.estimatedDelivery
                  ? `<p><strong>Estimated Delivery:</strong> ${new Date(
                      order.tracking.estimatedDelivery
                    ).toLocaleDateString()}</p>`
                  : ""
              }
            </div>
            
            ${
              order.tracking?.trackingUrl
                ? `<a href="${order.tracking.trackingUrl}" class="button">Track Package</a>`
                : ""
            }
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      email: user.email,
      subject: `Your Order Has Shipped! #${order.orderNumber}`,
      html,
    });
  }
}

module.exports = new EmailService();
