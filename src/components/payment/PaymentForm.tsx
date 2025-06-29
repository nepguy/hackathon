import React, { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { CreditCard, Lock, Shield, Check, AlertTriangle, ArrowLeft } from 'lucide-react';

interface PaymentFormProps {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  email: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  planId,
  planName,
  amount,
  currency,
  onSuccess,
  onCancel,
}) => {
  const { purchaseProduct } = useSubscription();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Germany'
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');

  const formatPrice = (amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Valid card number is required';
    }
    if (!formData.expiryDate || formData.expiryDate.length < 5) {
      newErrors.expiryDate = 'Valid expiry date is required';
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'Valid CVV is required';
    }
    if (!formData.cardholderName) newErrors.cardholderName = 'Cardholder name is required';
    if (!formData.billingAddress.street) newErrors.street = 'Street address is required';
    if (!formData.billingAddress.city) newErrors.city = 'City is required';
    if (!formData.billingAddress.postalCode) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      value = formatExpiryDate(value);
    } else if (field === 'cvv') {
      value = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FormData] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    let success = false;
    try {
      // Process payment through RevenueCat
      success = await purchaseProduct(planId);

      if (success) {
        setStep('success');
        
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setErrors({ general: 'Payment failed. Please try again.' });
        setStep('payment');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({ general: 'Payment failed. Please try again.' });
      setStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'processing') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
          <p className="text-gray-600 mb-6">
            Please wait while we securely process your payment...
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <Lock className="w-5 h-5" />
              <div>
                <h4 className="font-medium text-blue-900">Secure Payment</h4>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h3>
          <p className="text-gray-600 mb-6">
            Welcome to GuardNomad Premium! Your subscription is now active.
          </p>
          <div className="animate-pulse text-blue-600">
            Redirecting to your dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
        <p className="text-gray-600">
          Secure payment for {planName}
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">{planName}</span>
          <span className="font-bold text-gray-900">
            {formatPrice(amount, currency)}
          </span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Monthly subscription • Cancel anytime
        </div>
      </div>

      {/* Error Message */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-800 font-medium">Payment Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{errors.general}</p>
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Card Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.cardNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            {errors.cardNumber && <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                {errors.expiryDate && <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.cvv ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="CVV"
                  maxLength={4}
                />
                {errors.cvv && <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={formData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.cardholderName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {errors.cardholderName && <p className="text-red-600 text-sm mt-1">{errors.cardholderName}</p>}
        </div>

        {/* Billing Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Billing Address
          </label>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.billingAddress.street}
              onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.street ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Street Address"
            />
            {errors.street && <p className="text-red-600 text-sm mt-1">{errors.street}</p>}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={formData.billingAddress.city}
                  onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="City"
                />
                {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={formData.billingAddress.postalCode}
                  onChange={(e) => handleInputChange('billingAddress.postalCode', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.postalCode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Postal Code"
                />
                {errors.postalCode && <p className="text-red-600 text-sm mt-1">{errors.postalCode}</p>}
              </div>
            </div>
            
            <select
              value={formData.billingAddress.country}
              onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Spain">Spain</option>
              <option value="Italy">Italy</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Austria">Austria</option>
              <option value="Belgium">Belgium</option>
              <option value="Switzerland">Switzerland</option>
            </select>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Secure Payment</h4>
              <p className="text-blue-700 text-sm mt-1">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Shield className="w-5 h-5" />
            <span>Pay {formatPrice(amount, currency)}</span>
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By completing this purchase, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;