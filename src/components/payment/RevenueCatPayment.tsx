import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { CreditCard, Check, AlertTriangle, RefreshCw, Shield, ArrowRight, Receipt, Calendar, Euro } from 'lucide-react';

interface RevenueCatPaymentProps {
  planId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface InvoiceData {
  transactionId: string;
  planName: string;
  amount: string;
  currency: string;
  billingPeriod: string;
  purchaseDate: Date;
  nextBillingDate: Date;
  paymentMethod: string;
}

const RevenueCatPayment: React.FC<RevenueCatPaymentProps> = ({ 
  planId,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const { purchaseProduct, isLoading } = useSubscription();
  const [status, setStatus] = useState<'idle' | 'processing' | 'invoice' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  // Get plan details based on planId
  const getPlanDetails = () => {
    const plans = {
      'premium_monthly': {
        name: 'GuardNomad Premium Monthly',
        price: '9.99',
        currency: 'USD',
        period: 'month',
        description: 'Full access to all premium features',
        nextBilling: 30
      },
      'premium_yearly': {
        name: 'GuardNomad Premium Yearly',
        price: '99.99',
        currency: 'USD',
        period: 'year',
        description: 'Full access to all premium features (save 17%)',
        nextBilling: 365
      }
    };
    
    return plans[planId as keyof typeof plans] || {
      name: 'Unknown Plan',
      price: '0.00',
      currency: 'USD',
      period: 'unknown',
      description: 'Unknown plan details',
      nextBilling: 30
    };
  };

  const plan = getPlanDetails();

  const generateInvoiceData = (transactionId: string): InvoiceData => {
    const purchaseDate = new Date();
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + plan.nextBilling);

    return {
      transactionId,
      planName: plan.name,
      amount: plan.price,
      currency: plan.currency,
      billingPeriod: plan.period,
      purchaseDate,
      nextBillingDate,
      paymentMethod: 'Credit Card ****-1234'
    };
  };

  const handlePurchase = async () => {
    setStatus('processing');
    setErrorMessage(null);
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = await purchaseProduct(planId);
      
      if (success) {
        // Generate invoice data
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const invoice = generateInvoiceData(transactionId);
        setInvoiceData(invoice);
        setStatus('invoice');
        
        // Auto-proceed to success after showing invoice
        setTimeout(() => {
          setStatus('success');
          setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            } else {
              navigate('/payment-success', { 
                state: { 
                  invoiceData: invoice,
                  planDetails: plan 
                } 
              });
            }
          }, 2000);
        }, 4000);
      } else {
        setStatus('error');
        setErrorMessage('The purchase could not be completed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  // Reset status if planId changes
  useEffect(() => {
    setStatus('idle');
    setErrorMessage(null);
    setInvoiceData(null);
  }, [planId]);

  if (status === 'processing' || isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment</h3>
        <p className="text-gray-600 mb-6">
          Please wait while we securely process your payment...
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Your payment is being processed securely</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          This may take a few moments...
        </div>
      </div>
    );
  }

  if (status === 'invoice' && invoiceData) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Processed</h3>
          <p className="text-gray-600">Here's your invoice details</p>
        </div>

        {/* Invoice Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-900">Invoice</h4>
            <span className="text-sm text-gray-600">#{invoiceData.transactionId}</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan</span>
              <span className="font-medium text-gray-900">{invoiceData.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="font-bold text-gray-900">
                {invoiceData.currency === 'USD' ? '$' : '€'}{invoiceData.amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Billing Period</span>
              <span className="font-medium text-gray-900">Per {invoiceData.billingPeriod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Purchase Date</span>
              <span className="font-medium text-gray-900">
                {invoiceData.purchaseDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Next Billing</span>
              <span className="font-medium text-gray-900">
                {invoiceData.nextBillingDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium text-gray-900">{invoiceData.paymentMethod}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Paid</span>
              <span className="font-bold text-green-600 text-lg">
                {invoiceData.currency === 'USD' ? '$' : '€'}{invoiceData.amount}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Payment Successful</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Your subscription is now active. A confirmation email has been sent.
          </p>
        </div>

        <div className="text-center">
          <div className="animate-pulse text-blue-600 mb-2">
            Redirecting to your dashboard...
          </div>
          <div className="text-sm text-gray-500">
            You will be redirected automatically in a few seconds
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Guard Nomand Premium!</h3>
        <p className="text-gray-600 mb-6">
          Your subscription is now active. Enjoy all premium features!
        </p>
        <div className="animate-pulse text-blue-600">
          Redirecting to your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
        <p className="text-gray-600">
          Secure payment for {plan.name}
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-900">{plan.name}</span>
          <span className="font-bold text-gray-900">
            ${plan.price}
          </span>
        </div>
        <div className="text-sm text-gray-600 mb-3">
          Billed per {plan.period} • Cancel anytime
        </div>
        
        {/* Billing Info */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Next billing: {new Date(Date.now() + plan.nextBilling * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Euro className="w-4 h-4" />
            <span>Secure payment processing</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-800 font-medium">Payment Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
        </div>
      )}

      {/* RevenueCat Payment Info */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Secure Payment Processing</h4>
              <p className="text-blue-700 text-sm mt-1">
                Your payment will be processed securely through RevenueCat with industry-standard encryption.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <Shield className="w-5 h-5" />
          <span>Subscribe to {plan.name}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          You can cancel your subscription at any time.
        </p>
      </div>
    </div>
  );
};

export default RevenueCatPayment;