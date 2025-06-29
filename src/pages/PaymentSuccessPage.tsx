import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Crown, Shield, Zap, ArrowRight, Receipt, Download, Mail } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import PageContainer from '../components/layout/PageContainer';

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



const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSubscriptionStatus } = useSubscription();
  
  // Get invoice data from navigation state
  const invoiceData = location.state?.invoiceData as InvoiceData | undefined;

  useEffect(() => {
    // In a real implementation, you would:
    // 1. Verify the payment with your backend
    // 2. Update user subscription status in database
    // 3. Send confirmation email
    console.log('Payment successful - updating user subscription status');
    
    // Update trial status to premium
    refreshSubscriptionStatus();
  }, []);

  const handleDownloadInvoice = () => {
    if (!invoiceData) return;
    
    // In a real implementation, this would generate a PDF invoice
    const invoiceText = `
GUARDNOMAD INVOICE
==================

Transaction ID: ${invoiceData.transactionId}
Date: ${invoiceData.purchaseDate.toLocaleDateString()}

Plan: ${invoiceData.planName}
Amount: ${invoiceData.currency === 'USD' ? '$' : '€'}${invoiceData.amount}
Billing Period: Per ${invoiceData.billingPeriod}
Next Billing Date: ${invoiceData.nextBillingDate.toLocaleDateString()}
Payment Method: ${invoiceData.paymentMethod}

Thank you for your subscription to GuardNomad Premium!
    `;
    
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GuardNomad_Invoice_${invoiceData.transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
              <Crown className="w-4 h-4 text-white" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Guard Nomand Premium!</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Your subscription is now active. Enjoy advanced travel safety features and AI-powered insights.
          </p>
        </div>

        {/* Invoice Section */}
        {invoiceData && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Payment Receipt</h3>
                  <p className="text-sm text-gray-600">Transaction #{invoiceData.transactionId}</p>
                </div>
              </div>
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Payment Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Payment Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium text-gray-900">{invoiceData.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-bold text-green-600">
                      {invoiceData.currency === 'USD' ? '$' : '€'}{invoiceData.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing Cycle</span>
                    <span className="font-medium text-gray-900">Per {invoiceData.billingPeriod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-gray-900">{invoiceData.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Billing Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchase Date</span>
                    <span className="font-medium text-gray-900">
                      {invoiceData.purchaseDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Billing Date</span>
                    <span className="font-medium text-gray-900">
                      {invoiceData.nextBillingDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Notice */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900">Confirmation Email Sent</h5>
                  <p className="text-blue-700 text-sm mt-1">
                    A detailed receipt and subscription information has been sent to your email address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Premium Features Unlocked */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🎉 Premium Features Unlocked</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">AI-Powered Safety Insights</h4>
                <p className="text-sm text-gray-600">Real-time location-based safety analysis and personalized recommendations</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Priority Safety Alerts</h4>
                <p className="text-sm text-gray-600">Instant notifications about safety conditions in your location</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Premium Support</h4>
                <p className="text-sm text-gray-600">Priority customer support and 24/7 assistance</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Unlimited Access</h4>
                <p className="text-sm text-gray-600">All premium features and future updates included</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-4 mb-8">
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>Start Using Premium Features</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Manage Subscription
            </button>
            <button
              onClick={() => navigate('/alerts')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-8 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              View Safety Alerts
            </button>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-900 mb-4">What's Next?</h4>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">1</div>
              <span>Explore your enhanced dashboard with real-time location-based safety data</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">2</div>
              <span>Set up personalized safety alerts for your travel destinations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">3</div>
              <span>Access AI-powered travel insights and location-specific recommendations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">4</div>
              <span>Download the mobile app for real-time alerts on the go</span>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help getting started with your premium features?
          </p>
          <a
            href="mailto:support@guardnomand.com"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Contact Premium Support
          </a>
        </div>
      </div>
    </PageContainer>
  );
};

export default PaymentSuccessPage;