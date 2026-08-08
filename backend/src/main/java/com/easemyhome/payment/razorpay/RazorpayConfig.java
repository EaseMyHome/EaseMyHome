package com.easemyhome.payment.razorpay;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key.id:rzp_test_TM1QMxtaA6plwt}")
    private String keyId;

    @Value("${razorpay.key.secret:hKKOEqcmhQhz0Z9uxfF37CUI}")
    private String keySecret;

    public String getKeyId() {
        return keyId;
    }

    public String getKeySecret() {
        return keySecret;
    }
}
