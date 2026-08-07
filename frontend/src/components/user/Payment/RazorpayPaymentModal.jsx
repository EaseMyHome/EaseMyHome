import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box, Stack, Divider, Chip, CircularProgress 
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { processRazorpayPayment } from "../../../services/common/razorpay/razorpayService";

const RazorpayPaymentModal = ({
  open,
  onClose,
  booking,
  onPaymentSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!booking) return null;

  // Strict priority: use the first positive numeric value found
  const getAmount = (b) => {
    if (typeof b.amount === 'number' && b.amount > 0) return b.amount;
    if (b.subService && typeof b.subService.price === 'number' && b.subService.price > 0) return b.subService.price;
    if (typeof b.paymentAmount === 'number' && b.paymentAmount > 0) return b.paymentAmount;
    if (typeof b.price === 'number' && b.price > 0) return b.price;
    // Parse string values as fallback
    const parsed = parseFloat(b.amount || b.subService?.price || b.paymentAmount || b.price);
    if (!isNaN(parsed) && parsed > 0) return parsed;
    return 400; // default to 400, not 499
  };
  const amountToPay = getAmount(booking);

  const handlePayNow = () => {
    setLoading(true);
    setErrorMsg('');

    processRazorpayPayment({
      bookingId: booking.id,
      amount: amountToPay,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      serviceName: booking.serviceType,
      onSuccess: (data) => {
        setLoading(false);
        if (onPaymentSuccess) onPaymentSuccess(data);
        onClose();
      },
      onError: (msg) => {
        setLoading(false);
        setErrorMsg(msg || 'Payment failed or cancelled.');
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <PaymentIcon color="primary" />
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>Razorpay Test Checkout</Typography>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">Service Booked</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{booking.serviceType}</Typography>
            <Typography variant="caption" color="text.disabled">Provider: {booking.providerName || booking.provider?.name || 'Assigned Partner'}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>Total Amount Due</Typography>
            <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>₹{amountToPay}</Typography>
          </Box>

          <Chip 
            icon={<LockIcon sx={{ fontSize: 14 }} />} 
            label="Secured by Razorpay (Test Key: rzp_test_...)" 
            size="small" 
            color="success" 
            variant="outlined" 
          />

          {errorMsg && (
            <Typography variant="caption" color="error" sx={{ textAlign: 'center', display: 'block' }}>
              {errorMsg}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 0 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handlePayNow}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
          sx={{ px: 3, fontWeight: 700 }}
        >
          {loading ? 'Opening Razorpay...' : `Pay ₹${amountToPay}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RazorpayPaymentModal;
