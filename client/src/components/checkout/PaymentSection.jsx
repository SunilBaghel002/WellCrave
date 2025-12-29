// src/components/checkout/PaymentSection.jsx
import { useState } from "react";
import clsx from "clsx";
import { FiCreditCard, FiSmartphone, FiShield } from "react-icons/fi";
import Button from "../common/Button";

const paymentMethods = [
  {
    id: "razorpay",
    name: "Pay with Razorpay",
    description: "Credit/Debit Card, UPI, Net Banking, Wallets",
    icon: FiCreditCard,
  },
  {
    id: "upi",
    name: "UPI",
    description: "Google Pay, PhonePe, Paytm, etc.",
    icon: FiSmartphone,
  },
];

const PaymentSection = ({ onPay, isLoading, total }) => {
  const [selectedMethod, setSelectedMethod] = useState("razorpay");

  const handlePayment = () => {
    onPay(selectedMethod);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>

      {/* Payment Methods */}
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={clsx(
              "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
              selectedMethod === method.id
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => setSelectedMethod(method.id)}
              className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <method.icon
                  size={20}
                  className={clsx(
                    selectedMethod === method.id
                      ? "text-primary-600"
                      : "text-gray-400"
                  )}
                />
                <span className="font-medium text-gray-900">{method.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{method.description}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
        <FiShield className="text-green-600" size={20} />
        <div>
          <p className="text-sm font-medium text-gray-900">Secure Payment</p>
          <p className="text-xs text-gray-500">
            Your payment information is encrypted and secure
          </p>
        </div>
      </div>

      {/* Payment Logos */}
      <div className="flex items-center justify-center gap-4 py-4">
        <img src="/visa.svg" alt="Visa" className="h-8 opacity-60" />
        <img
          src="/mastercard.svg"
          alt="Mastercard"
          className="h-8 opacity-60"
        />
        <img src="/rupay.svg" alt="RuPay" className="h-8 opacity-60" />
        <img src="/upi.svg" alt="UPI" className="h-8 opacity-60" />
      </div>

      {/* Pay Button */}
      <Button
        onClick={handlePayment}
        isLoading={isLoading}
        fullWidth
        size="lg"
        className="mt-4"
      >
        Pay ₹{total?.toFixed(2)}
      </Button>

      <p className="text-xs text-center text-gray-500">
        By placing this order, you agree to our Terms of Service and Privacy
        Policy
      </p>
    </div>
  );
};

export default PaymentSection;
