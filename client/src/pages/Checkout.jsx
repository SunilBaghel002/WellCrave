// src/pages/Checkout.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { paymentAPI } from "../api/payment";
import { userAPI } from "../api/user";
import AddressForm from "../components/checkout/AddressForm";
import PaymentSection from "../components/checkout/PaymentSection";
import OrderSummary from "../components/checkout/OrderSummary";
import Loader from "../components/common/Loader";
import { APP_NAME } from "../utils/constants";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();

  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryType, setDeliveryType] = useState("home_delivery");

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchCart();
        const { data } = await userAPI.getAddresses();
        setSavedAddresses(data.data || []);

        // Pre-select default address
        const defaultAddress = data.data?.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setShippingAddress(defaultAddress);
          setStep(2);
        }
      } catch (error) {
        console.error("Error initializing checkout:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const handleAddressSubmit = (address) => {
    setShippingAddress({
      ...address,
      email: address.email || user.email,
    });
    setStep(2);
  };

  const handlePayment = async () => {
    if (deliveryType === "home_delivery" && !shippingAddress) {
      toast.error("Please add a shipping address");
      setStep(1);
      return;
    }

    setIsProcessing(true);

    try {
      // Create Razorpay order
      const { data } = await paymentAPI.createOrder({ 
        shippingAddress: deliveryType === "home_delivery" ? shippingAddress : null,
        deliveryType 
      });

      const options = {
        key: data.data.keyId,
        amount: data.data.amount,
        currency: data.data.currency,
        order_id: data.data.orderId,
        name: APP_NAME,
        description: "Order Payment",
        image: "/logo.png",
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await paymentAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              cartId: data.data.cartId,
              shippingAddress: deliveryType === "home_delivery" ? shippingAddress : null,
              deliveryType,
            });

            if (verifyResponse.data.success) {
              navigate(
                `/payment/success?orderId=${verifyResponse.data.data.orderId}`
              );
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            navigate("/payment/failure");
          }
        },
        prefill: {
          name: data.data.prefill.name,
          email: data.data.prefill.email,
          contact: data.data.prefill.contact,
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        paymentAPI.handleFailure({
          razorpayOrderId: data.data.orderId,
          error: response.error,
        });
        navigate("/payment/failure");
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!cart || cart.items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout - {APP_NAME}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-8">
            Checkout
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= 1
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="ml-2 text-sm font-medium">Shipping</span>
            </div>
            <div
              className={`w-20 h-1 mx-4 ${
                step >= 2 ? "bg-primary-600" : "bg-gray-200"
              }`}
            />
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= 2
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">Payment</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-card p-6">
                {step === 1 && (
                  <>
                    {/* Delivery Type Selection */}
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Delivery Option
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <label
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            deliveryType === "home_delivery"
                              ? "border-primary-500 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryType"
                            value="home_delivery"
                            checked={deliveryType === "home_delivery"}
                            onChange={(e) => setDeliveryType(e.target.value)}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              Home Delivery
                            </div>
                            <div className="text-sm text-gray-500">
                              Get your order delivered to your doorstep
                            </div>
                          </div>
                        </label>
                        <label
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            deliveryType === "store_pickup"
                              ? "border-primary-500 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryType"
                            value="store_pickup"
                            checked={deliveryType === "store_pickup"}
                            onChange={(e) => setDeliveryType(e.target.value)}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              Store Pickup
                            </div>
                            <div className="text-sm text-gray-500">
                              Pick up your order from our store
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {deliveryType === "home_delivery" && (
                      <>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                          Shipping Address
                        </h2>

                    {/* Saved Addresses */}
                    {savedAddresses.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          Saved Addresses
                        </h3>
                        <div className="grid gap-3">
                          {savedAddresses.map((address) => (
                            <label
                              key={address._id}
                              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                                shippingAddress?._id === address._id
                                  ? "border-primary-500 bg-primary-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="savedAddress"
                                checked={shippingAddress?._id === address._id}
                                onChange={() => setShippingAddress(address)}
                                className="mt-1"
                              />
                              <div>
                                <p className="font-medium">
                                  {address.firstName} {address.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {address.street}, {address.city},{" "}
                                  {address.state} - {address.zipCode}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {address.phone}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>

                        {shippingAddress && (
                          <button
                            onClick={() => setStep(2)}
                            className="mt-4 w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                          >
                            Continue to Payment
                          </button>
                        )}

                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                              Or add a new address
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <AddressForm
                      defaultValues={{
                        firstName: user?.firstName,
                        lastName: user?.lastName,
                        email: user?.email,
                        phone: user?.phone,
                      }}
                      onSubmit={handleAddressSubmit}
                      submitLabel="Continue to Payment"
                      showSaveOption
                    />
                      </>
                    )}

                    {deliveryType === "store_pickup" && (
                      <div className="mb-6">
                        <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                          <h3 className="font-medium text-gray-900 mb-2">
                            Store Pickup Information
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            You can pick up your order from our store. We'll notify you when your order is ready for pickup.
                          </p>
                          <div className="text-sm text-gray-700">
                            <p className="font-medium mb-1">Store Address:</p>
                            <p>123 Main Street, Mumbai, Maharashtra - 400001</p>
                            <p className="mt-2">Phone: +91 98765 43210</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setStep(2)}
                          className="mt-4 w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    )}
                  </>
                )}

                {step === 2 && (
                  <>
                    {/* Delivery Type Summary */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {deliveryType === "home_delivery" ? "Shipping to" : "Pickup Location"}
                        </h3>
                        <button
                          onClick={() => setStep(1)}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Change
                        </button>
                      </div>
                      {deliveryType === "home_delivery" && shippingAddress ? (
                        <p className="text-gray-600">
                          {shippingAddress.firstName} {shippingAddress.lastName}
                          <br />
                          {shippingAddress.street}
                          <br />
                          {shippingAddress.city}, {shippingAddress.state} -{" "}
                          {shippingAddress.zipCode}
                          <br />
                          {shippingAddress.phone}
                        </p>
                      ) : (
                        <p className="text-gray-600">
                          Store Pickup
                          <br />
                          123 Main Street, Mumbai, Maharashtra - 400001
                          <br />
                          Phone: +91 98765 43210
                        </p>
                      )}
                    </div>

                    <PaymentSection
                      onPay={handlePayment}
                      isLoading={isProcessing}
                      total={cart.total}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <OrderSummary cart={cart} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
