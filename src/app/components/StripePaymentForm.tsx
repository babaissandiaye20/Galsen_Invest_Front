/**
 * Composant Stripe Embedded Checkout
 * Utilise EmbeddedCheckoutProvider car le backend crée des Checkout Sessions (cs_test_...)
 * et non des PaymentIntents (pi_...)
 */
import React from 'react';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';

interface StripeEmbeddedCheckoutProps {
  stripePromise: Promise<Stripe | null>;
  clientSecret: string;
  onComplete: () => void;
}

export function StripeEmbeddedCheckoutForm({
  stripePromise,
  clientSecret,
  onComplete,
}: StripeEmbeddedCheckoutProps) {
  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{
        clientSecret,
        onComplete,
      }}
    >
      {/* EmbeddedCheckout monte un iframe Stripe — style width:100% pour le responsive */}
      <div style={{ width: '100%' }}>
        <EmbeddedCheckout />
      </div>
    </EmbeddedCheckoutProvider>
  );
}
