// services/stripeService.js
const stripe = require("../config/stripe");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");
const AppError = require("../utils/appError");

class StripeService {
  // Create or get Stripe customer
  async getOrCreateCustomer(user) {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user._id.toString(),
      },
    });

    await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
    return customer.id;
  }

  // Create payment intent
  async createPaymentIntent(cart, user, shippingAddress) {
    const customerId = await this.getOrCreateCustomer(user);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(cart.total * 100), // Convert to cents
      currency: "usd",
      customer: customerId,
      metadata: {
        userId: user._id.toString(),
        cartId: cart._id.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
      shipping: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        address: {
          line1: shippingAddress.street,
          line2: shippingAddress.apartment || "",
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
      },
    });

    return paymentIntent;
  }

  // Create checkout session
  async createCheckoutSession(
    cart,
    user,
    successUrl,
    cancelUrl,
    shippingAddress
  ) {
    const customerId = await this.getOrCreateCustomer(user);

    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: `${item.size} - ${item.weight}${item.weightUnit}`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping if applicable
    if (cart.shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
          },
          unit_amount: Math.round(cart.shipping * 100),
        },
        quantity: 1,
      });
    }

    const sessionConfig = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId: user._id.toString(),
        cartId: cart._id.toString(),
        shippingAddress: JSON.stringify(shippingAddress),
      },
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      allow_promotion_codes: true,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    };

    // Add tax if applicable
    if (cart.tax > 0) {
      sessionConfig.line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax",
          },
          unit_amount: Math.round(cart.tax * 100),
        },
        quantity: 1,
      });
    }

    // Add discount if applicable
    if (cart.discount > 0 && cart.coupon) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(cart.discount * 100),
        currency: "usd",
        duration: "once",
        name: cart.coupon.code,
      });

      sessionConfig.discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return session;
  }

  // Handle successful payment
  async handleSuccessfulPayment(session) {
    const { userId, cartId, shippingAddress } = session.metadata;

    const cart = await Cart.findById(cartId).populate("items.product");
    const user = await User.findById(userId);

    if (!cart || !user) {
      throw new AppError("Cart or user not found", 404);
    }

    const parsedShippingAddress = JSON.parse(shippingAddress);

    // Create order
    const order = await Order.create({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        variant: item.variant,
        name: item.name,
        image: item.image,
        size: item.size,
        weight: item.weight,
        weightUnit: item.weightUnit,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      shippingAddress: parsedShippingAddress,
      billingAddress: parsedShippingAddress,
      subtotal: cart.subtotal,
      discount: cart.discount,
      coupon: cart.coupon,
      shipping: {
        cost: cart.shipping,
        method: "standard",
      },
      tax: cart.tax,
      total: cart.total,
      payment: {
        method: "card",
        status: "completed",
        stripePaymentIntentId: session.payment_intent,
        paidAt: new Date(),
      },
      status: "confirmed",
    });

    // Add status history
    order.addStatusHistory("confirmed", "Payment completed successfully", null);
    await order.save();

    // Clear cart
    await Cart.findByIdAndDelete(cartId);

    // Update product stock
    for (const item of cart.items) {
      await Product.findOneAndUpdate(
        { _id: item.product._id, "variants._id": item.variant },
        {
          $inc: {
            "variants.$.stock": -item.quantity,
            soldCount: item.quantity,
          },
        }
      );
    }

    return order;
  }

  // Create refund
  async createRefund(order, amount, reason) {
    if (!order.payment.stripePaymentIntentId) {
      throw new AppError("No payment intent found for this order", 400);
    }

    const refundAmount = amount ? Math.round(amount * 100) : undefined;

    const refund = await stripe.refunds.create({
      payment_intent: order.payment.stripePaymentIntentId,
      amount: refundAmount, // If undefined, refunds the full amount
      reason: reason || "requested_by_customer",
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    // Update order payment status
    const refundedAmount =
      (order.payment.refundedAmount || 0) + refund.amount / 100;

    if (refundedAmount >= order.total) {
      order.payment.status = "refunded";
      order.status = "refunded";
    } else {
      order.payment.status = "partially_refunded";
    }

    order.payment.refundedAmount = refundedAmount;
    order.addStatusHistory(
      order.payment.status,
      `Refund of $${(refund.amount / 100).toFixed(2)} processed. Reason: ${
        reason || "Customer request"
      }`,
      null
    );

    await order.save();

    return refund;
  }

  // Get payment intent status
  async getPaymentIntentStatus(paymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  }

  // Retrieve checkout session
  async retrieveCheckoutSession(sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    });
    return session;
  }

  // Create setup intent for saving cards
  async createSetupIntent(user) {
    const customerId = await this.getOrCreateCustomer(user);

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      metadata: {
        userId: user._id.toString(),
      },
    });

    return setupIntent;
  }

  // Get customer's saved payment methods
  async getPaymentMethods(user) {
    if (!user.stripeCustomerId) {
      return [];
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
    }));
  }

  // Delete payment method
  async deletePaymentMethod(paymentMethodId) {
    await stripe.paymentMethods.detach(paymentMethodId);
    return true;
  }

  // Create payment with saved card
  async chargeWithSavedCard(user, paymentMethodId, amount, description) {
    const customerId = await this.getOrCreateCustomer(user);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      description,
      metadata: {
        userId: user._id.toString(),
      },
    });

    return paymentIntent;
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (err) {
      throw new AppError(
        `Webhook signature verification failed: ${err.message}`,
        400
      );
    }
  }

  // Handle webhook events
  async handleWebhookEvent(event) {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.payment_status === "paid") {
          await this.handleSuccessfulPayment(session);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent ${paymentIntent.id} failed: ${paymentIntent.last_payment_error?.message}`
        );
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        console.log(`Charge ${charge.id} refunded`);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // Handle subscription events if needed
        const subscription = event.data.object;
        console.log(
          `Subscription ${subscription.id} ${event.type.split(".").pop()}`
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  // Get balance transactions for analytics
  async getBalanceTransactions(startDate, endDate) {
    const transactions = await stripe.balanceTransactions.list({
      created: {
        gte: Math.floor(new Date(startDate).getTime() / 1000),
        lte: Math.floor(new Date(endDate).getTime() / 1000),
      },
      limit: 100,
    });

    return transactions.data;
  }

  // Create transfer to connected account (for marketplace)
  async createTransfer(amount, destinationAccountId, description) {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      destination: destinationAccountId,
      description,
    });

    return transfer;
  }
}

module.exports = new StripeService();
