const stripe = require('stripe')(
  'sk_test_51NUmJOFEsDSfMpHunO8Zscoo1KwMISvWpj00QwhHnLTjYQVkQF1uH0WBgCd8pWgfd5gAKBguz9MfszFPlQwOVPXl00ZUdeBaS5',
);
const express = require('express');
const app = express();

const endpointSecret =
  'whsec_cb4db6ed715b11790d10316f918e525c0a5809ed00b4e60ee01080b566d85c04';

  app.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    (request, response) => {
      const sig = request.headers['stripe-signature'];

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          sig,
          endpointSecret,
        );
      } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      // Handle the event
      switch (event.type) {
        case 'charge.succeeded':
          const paymentIntentSucceeded = event.data.object;
          console.log('CHARGE: ', event);
          // Then define and call a function to handle the event payment_intent.succeeded
          break;
        // ... handle other event types
        // case 'checkout.session.completed':
        //   const a = event.data.object;
        //   console.log('checkout: ', a);
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      response.send();
    },
  );
// pi_3P1hkBFEsDSfMpHu1GsOM726
//cs_test_a15XKgeTrNrlz9Tz4VgHjYlLF6Mdk9Cig3JjmFCYaq8vSclRucImNo9Z69
  app.listen(4242, () => console.log('Running on port 4242'));