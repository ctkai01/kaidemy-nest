const stripe = require('stripe')(
  'sk_test_51NUmJOFEsDSfMpHunO8Zscoo1KwMISvWpj00QwhHnLTjYQVkQF1uH0WBgCd8pWgfd5gAKBguz9MfszFPlQwOVPXl00ZUdeBaS5',
);

const test = async () => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 10000,
    currency: 'gbp',
    transfer_group: 'OK',
  });

  console.log('paymentIntent: ', paymentIntent);
};

const transfer = async () => {
  const transfer = await stripe.transfers.create({
    amount: 6000,
    currency: 'gbp',
    destination: 'acct_1P1UKgFSgql4rV8r',
    transfer_group: 'OK',
  });

  console.log('transfer: ', transfer);
};
// stripe_account: accountId;
const balance_1 = async () => {
  const balance = await stripe.balance.retrieve({
    stripeAccount: 'acct_1P1UKgFSgql4rV8r',
  });

  console.log('Balance: ', balance);
};

const balance_2 = async () => {
  const balance = await stripe.balance.retrieve();

  console.log('Balance: ', balance);
};

const transac = async () => {
 
const balanceTransactions = await stripe.balanceTransactions.list({
  limit: 7,
  // stripeAccount: 'acct_1P1UKgFSgql4rV8r',
});
console.log('transaction: ', balanceTransactions);
};

const retriveTrans = async () => {

const balanceTransaction = await stripe.balanceTransactions.retrieve(
  'txn_3P1hkBFEsDSfMpHu1vWjtrI2',
);

console.log(balanceTransaction);
}

const retrivePAy = async () => {
  const balanceTransaction = await stripe.paymentIntents.retrieve(
    'pi_3P1hkBFEsDSfMpHu1GsOM726',
  );

  console.log(balanceTransaction);
};
// stripe.paymentIntents.retrieve;
// transfer()
// balance_1()
// balance_2();
// test()
retrivePAy();
// txn_1P1g6NFEsDSfMpHulXptnsan;

//TODO
// save checkout_session

// In webhook receive "checkout.session.completed" -> get payment_intent "pi_3P1i7qFEsDSfMpHu04QaOHLc" 
   // Receive "balance_transaction" from charge.succeeded bases on payment_intent

   // section_id
   // cart_id