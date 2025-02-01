// PaymentSuccess.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // Get session ID from URL parameters
      const sessionId = new URLSearchParams(window.location.search).get('session_id');
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/verify-payment/${sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setLoading(false);
          // Wait briefly before redirecting to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setError(error.response?.data?.message || 'Payment verification failed');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Verifying your payment...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="rounded-full h-12 w-12 bg-red-100 p-2 flex items-center justify-center mx-auto">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Payment Verification Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="rounded-full h-12 w-12 bg-green-100 p-2 flex items-center justify-center mx-auto">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Payment Successful!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Thank you for your payment. Your project is now being processed.
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          You will be redirected to your dashboard in a few seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;

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