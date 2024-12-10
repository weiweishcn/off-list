import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe('your_publishable_key');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
  },
};

// Payment Form Component
const PaymentForm = ({ onSubscriptionComplete, planId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Create subscription on your backend
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          planId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      setMessage('Subscription successful! Redirecting...');
      onSubscriptionComplete(data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-red-600 text-sm py-2">{error}</div>
      )}
      
      {message && (
        <div className="text-green-600 text-sm py-2">{message}</div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Card Information
        </label>
        <div className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Subscribe Now'}
      </button>
    </form>
  );
};

// Main Subscription Component
const StripeSubscription = ({ onSubscriptionComplete }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$1099.99',
      features: ['5 design requests', 'Basic support', '48h response time'],
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$1999.99',
      features: ['Unlimited requests', 'Priority support', '24h response time'],
    }
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setShowPaymentForm(true);
  };

  const handleSubscriptionComplete = (data) => {
    setShowPaymentForm(false);
    onSubscriptionComplete(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {!showPaymentForm ? (
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold mb-4">{plan.price}<span className="text-sm text-gray-500">/month</span></p>
              <ul className="mb-6 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanSelect(plan.id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Complete Subscription</h2>
            <button
              onClick={() => setShowPaymentForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Plans
            </button>
          </div>
          <Elements stripe={stripePromise}>
            <PaymentForm
              planId={selectedPlan}
              onSubscriptionComplete={handleSubscriptionComplete}
            />
          </Elements>
        </div>
      )}
    </div>
  );
};

export default StripeSubscription;