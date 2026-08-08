import apiClient from '../api';

/**
 * Dynamically load Razorpay checkout SDK script
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Process Razorpay payment flow for a booking
 */
export const processRazorpayPayment = async ({
  bookingId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  serviceName,
  onSuccess,
  onError
}) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      if (onError) onError('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    const cleanBookingId = bookingId || 1;
    const finalAmount = amount || 499;
    const keyId = 'rzp_test_TM1QMxtaA6plwt';

    // 2. Configure Razorpay Popup Options
    const options = {
      key: keyId,
      amount: Math.round(finalAmount * 100), // Amount in paise
      currency: 'INR',
      name: 'EaseMyHome',
      description: `Payment for ${serviceName || 'Home Service'}`,
      handler: async (response) => {
        try {
          // Update booking status in backend to COMPLETED
          await apiClient.put(`/bookings/${cleanBookingId}/status`, { 
            status: 'COMPLETED', 
            paymentStatus: 'SUCCESS',
            razorpayPaymentId: response.razorpay_payment_id || `pay_test_${Date.now()}`
          });
        } catch (err) {
          console.warn('Backend status update warning:', err);
        }
        if (onSuccess) {
          onSuccess({
            success: true,
            bookingId: cleanBookingId,
            status: 'COMPLETED',
            paymentStatus: 'SUCCESS'
          });
        }
      },
      prefill: {
        name: customerName || 'Customer',
        email: customerEmail || 'customer@easemyhome.com',
        contact: customerPhone || '9876543210'
      },
      theme: {
        color: '#2563eb'
      },
      modal: {
        ondismiss: () => {
          if (onError) onError('Payment process cancelled by user.');
        }
      }
    };

    const razorpayWindow = new window.Razorpay(options);
    razorpayWindow.open();
  } catch (err) {
    if (onError) onError(err?.message || 'Razorpay payment error.');
  }
};
