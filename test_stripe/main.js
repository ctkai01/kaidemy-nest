const stripe = require('stripe')(
  'sk_test_51NUmJOFEsDSfMpHunO8Zscoo1KwMISvWpj00QwhHnLTjYQVkQF1uH0WBgCd8pWgfd5gAKBguz9MfszFPlQwOVPXl00ZUdeBaS5',
);

const test = async () => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 10000,
    currency: 'gbp',
    transfer_group: 'ORDER10',
  });

  console.log('paymentIntent: ', paymentIntent);
};

const transfer = async () => {
  const transfer = await stripe.transfers.create({
    amount: 7000,
    currency: 'gbp',
    destination: 'acct_1P1UKgFSgql4rV8r',
    transfer_group: 'ORDER10',
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
  const transaction = await stripe.treasury.transactions.retrieve(
    'acct_1P1UKgFSgql4rV8r',
  );

  console.log('transaction: ', transaction);
};
// transfer()
// balance()
balance_2();
// test()
// transac();
