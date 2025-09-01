// Test script to call Stripe setup endpoint
const token = "eyJhbGciOiJIUzI1NiIsImtpZCI6ImhWNFZiOU1mMjRhSEtXRmsiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3hsb25qYXR3ZGxlaGVtenZkd2ZhLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJlODVlMTI5NC02MzJiLTQyYzEtODViYS04YzY2NDhmYzA0NjciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2NjkwNTEwLCJpYXQiOjE3NTY2ODY5MTAsImVtYWlsIjoiYnJlbm5hbi50aGFyYWxkc29uQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXJ0aXN0X25hbWUiOiJCcmVubmFuIFRoYXJhbGRzb24iLCJlbWFpbCI6ImJyZW5uYW4udGhhcmFsZHNvbkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQnJlbm5hbiBUaGFyYWxkc29uIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiJlODVlMTI5NC02MzJiLTQyYzEtODViYS04YzY2NDhmYzA0NjcifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc1NjY4NjkxMH1dLCJzZXNzaW9uX2lkIjoiNjcwM2Y1YzctZDFmNi00ZWY1LWE2NGEtMzI2ODI0N2Y0NWM4IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.6ID8S2A7aJXKiCDl8puH0-gCB4wkwdDI-DmeyT0zdNE";

async function testStripeSetup() {
  try {
    console.log('Testing Stripe setup endpoint...');
    
    const response = await fetch('https://allaccessartist-dev.brennanwesley.workers.dev/api/subscription/setup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.ok) {
      try {
        const json = JSON.parse(data);
        console.log('Parsed JSON:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Response is not JSON');
      }
    }
    
  } catch (error) {
    console.error('Error calling Stripe setup:', error.message);
  }
}

testStripeSetup();
