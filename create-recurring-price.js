// Script to create recurring monthly subscription price for Artist Plan
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createRecurringPrice() {
  try {
    console.log('Creating recurring monthly price for Artist Plan...');
    
    // Create recurring monthly price for the Artist Plan product
    const price = await stripe.prices.create({
      product: 'prod_SyIOZerF9U5Xx5', // Latest Artist Plan product
      unit_amount: 999, // $9.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_name: 'Artist Plan',
        created_by: 'setup_script'
      }
    });

    console.log('✅ Successfully created recurring price:');
    console.log(`Price ID: ${price.id}`);
    console.log(`Product ID: ${price.product}`);
    console.log(`Amount: $${price.unit_amount / 100}`);
    console.log(`Interval: ${price.recurring.interval}`);
    
    return price;
  } catch (error) {
    console.error('❌ Error creating recurring price:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createRecurringPrice()
    .then(() => console.log('✅ Setup complete!'))
    .catch(error => {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { createRecurringPrice };
