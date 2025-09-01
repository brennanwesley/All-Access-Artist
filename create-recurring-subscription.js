const Stripe = require('stripe');

// You need to replace this with your actual Stripe secret key
const stripe = new Stripe('sk_test_YOUR_SECRET_KEY_HERE');

async function createRecurringPrice() {
  try {
    // Create a recurring monthly price for the existing product
    const recurringPrice = await stripe.prices.create({
      product: 'prod_SyYKbEWw3IZv10', // Use the product we just created
      unit_amount: 999, // $9.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_name: 'Artist Plan Monthly',
        created_by: 'setup_script'
      }
    });

    console.log('✅ Recurring monthly price created successfully:');
    console.log(`Price ID: ${recurringPrice.id}`);
    console.log(`Product ID: ${recurringPrice.product}`);
    console.log(`Amount: $${recurringPrice.unit_amount / 100}`);
    console.log(`Interval: ${recurringPrice.recurring.interval}`);
    
    return recurringPrice.id;
  } catch (error) {
    console.error('❌ Error creating recurring price:', error.message);
    throw error;
  }
}

// Run the function
createRecurringPrice()
  .then(priceId => {
    console.log(`\n🎉 Success! Your new recurring price ID is: ${priceId}`);
    console.log('Update your backend code to use this price ID.');
  })
  .catch(error => {
    console.error('Failed to create recurring price:', error);
  });
