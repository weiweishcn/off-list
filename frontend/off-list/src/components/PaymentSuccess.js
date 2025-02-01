// PaymentSuccess.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        // Verify payment status with your backend
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/verify-payment`,
          { sessionId },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        setLoading(false);
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    verifyPayment();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Processing Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Payment Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4 text-green-600">Payment Successful!</h2>
        <p className="text-gray-600">Thank you for your payment. Your project will start soon.</p>
        <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

// PaymentCancel.js
const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Payment Cancelled</h2>
        <p className="text-gray-600">Your payment was cancelled. No charges were made.</p>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="block w-full px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="block w-full px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export { PaymentSuccess, PaymentCancel };