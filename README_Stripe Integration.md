# Stripe Integration Strategy - All Access Artist

## Overview
This document outlines the comprehensive strategy for integrating Stripe subscription billing into the All Access Artist platform, focusing on security, user experience, and minimal complexity.

## Key Design Decisions

### ✅ **Payment Security Strategy**
- **No Stored Payment Methods**: Use Stripe Checkout for all payment collection
- **PCI Compliance**: Stripe handles all sensitive payment data
- **Recurring Billing**: Stripe manages monthly subscription charges automatically
- **Security Benefits**: Zero payment data stored in our database

### ✅ **Access Control Strategy**
- **Admin Override**: `brennan.tharaldson@gmail.com` hardcoded for full access
- **Test User**: `feedbacklooploop@gmail.com` hardcoded with active subscription (temporary)
- **Read-Only Mode**: Expired subscriptions get read-only access to existing data
- **Simple Lockdown**: Block all mutations (create/edit/delete) when expired

### ✅ **User Experience Strategy**
- **Profile Integration**: Pay tab in Profile Settings modal
- **Status Visibility**: Subscription status in Profile Settings Info tab
- **Seamless Checkout**: Redirect to Stripe Checkout for subscription management
- **Clear Messaging**: Obvious indicators for subscription status and limitations

---

## Technical Architecture

### **1. Database Schema (Already Implemented)**
```sql
-- user_profiles table now includes:
stripe_customer_id VARCHAR(255) UNIQUE
stripe_subscription_id VARCHAR(255)
subscription_status VARCHAR(50)
subscription_plan_id VARCHAR(100)
current_period_end TIMESTAMPTZ
-- ... additional Stripe fields
```

### **2. Backend Services**

#### **StripeService** (`backend/src/services/stripeService.ts`)
```typescript
class StripeService {
  // Product/Price Management
  async createProducts()
  async createPrices()
  
  // Customer Management
  async createCustomer(userId: string, email: string)
  async getCustomer(customerId: string)
  
  // Subscription Management
  async createCheckoutSession(customerId: string, priceId: string)
  async cancelSubscription(subscriptionId: string)
  async getSubscription(subscriptionId: string)
  
  // Webhook Processing
  async processWebhook(event: Stripe.Event)
}
```

#### **SubscriptionMiddleware** (`backend/src/middleware/subscriptionAuth.ts`)
```typescript
// Middleware to check subscription status
// - Admin users: Always allowed
// - Active subscriptions: Full access
// - Expired subscriptions: Read-only access
// - No subscription: Redirect to billing
```

### **3. Frontend Components**

#### **PayTab** (`frontend/src/components/profile/PayTab.tsx`)
- Current subscription status display
- "Subscribe to Artist Plan" button
- "Cancel Subscription" button
- Billing history (future enhancement)

#### **SubscriptionStatus** (`frontend/src/components/ui/SubscriptionStatus.tsx`)
- Status badge component for Info tab
- Color-coded status indicators
- Expiration date display

#### **ReadOnlyBanner** (`frontend/src/components/ui/ReadOnlyBanner.tsx`)
- Prominent banner for expired users
- Upgrade prompt with direct checkout link
- Clear explanation of limitations

### **4. API Endpoints**

#### **Subscription Routes** (`backend/src/routes/subscription.ts`)
```typescript
GET /api/subscription/status     // Get user's subscription status
POST /api/subscription/checkout  // Create Stripe Checkout session
POST /api/subscription/cancel    // Cancel user's subscription
GET /api/subscription/products   // Get available subscription plans
```

#### **Webhook Route** (`backend/src/routes/webhooks.ts`)
```typescript
POST /api/webhooks/stripe        // Handle Stripe webhook events
```

---

## Implementation Phases

### **Phase 1: Core Infrastructure** (Priority: High)
1. **Stripe Service Setup**
   - Install Stripe SDK in backend
   - Create StripeService class
   - Set up Stripe products/prices via API

2. **Webhook Handler**
   - Create webhook endpoint
   - Handle subscription events (created, updated, canceled)
   - Update user_profiles table with subscription data

3. **Subscription Middleware**
   - Create access control middleware
   - Implement read-only logic
   - Admin user hardcoding

### **Phase 2: User Interface** (Priority: High)
1. **Profile Settings Integration**
   - Add Pay tab to existing Profile modal
   - Add subscription status to Info tab
   - Create subscription status components

2. **Access Control UI**
   - Read-only banner for expired users
   - Feature lockdown implementation
   - Upgrade prompts and messaging

### **Phase 3: Checkout Flow** (Priority: High)
1. **Stripe Checkout Integration**
   - Create checkout session API
   - Frontend checkout redirect
   - Success/cancel page handling

2. **Subscription Management**
   - Cancel subscription functionality
   - Subscription status updates
   - Grace period handling

### **Phase 4: Testing & Polish** (Priority: Medium)
1. **User Flow Testing**
   - Admin user access verification
   - Artist subscription flow
   - Read-only mode testing

2. **Error Handling**
   - Failed payment scenarios
   - Webhook failure recovery
   - User-friendly error messages

---

## Subscription Plans

### **Artist Plan**
- **Price**: $9.99/month
- **Features**: Full access to all platform features
- **Billing**: Monthly recurring
- **Trial**: None

### **Manager Plan** (Coming Soon)
- **Price**: $99.99/month
- **Features**: Multi-artist management
- **Status**: Future implementation

---

## Access Control Matrix

| User Type | Subscription Status | Access Level |
|-----------|-------------------|--------------|
| Admin (`brennan.tharaldson@gmail.com`) | Any | Full Access |
| Artist | Active Subscription | Full Access |
| Artist | Grace Period (7 days) | Full Access |
| Artist | Expired | Read-Only |
| Artist | Never Subscribed | Read-Only + Upgrade Prompts |

---

## Security Considerations

### **✅ Payment Security**
- No payment data stored in our database
- Stripe Checkout handles all PCI compliance
- Webhook signature verification for security

### **✅ Access Control**
- JWT-based authentication maintained
- Subscription status checked via middleware
- RLS policies remain unchanged (user-scoped data)

### **✅ Data Protection**
- Read-only access preserves user data
- No data deletion on subscription expiry
- Clear upgrade path to restore full access

---

## Environment Variables

### **Backend (Render)**
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **Frontend (Vercel)**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
```

---

## Webhook Events to Handle

### **Critical Events**
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Plan changes
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

### **Database Updates**
- Update `subscription_status` field
- Store `stripe_subscription_id`
- Update `current_period_end` date
- Log subscription events for debugging

---

## Questions for Clarification

### **1. Read-Only Implementation Complexity**
Read-only access is **moderately complex** but achievable:
- **Easy**: Disable form submissions, hide action buttons
- **Medium**: Prevent API mutations via middleware
- **Complex**: Granular feature-by-feature lockdown

**Recommendation**: Start with broad read-only (no mutations) and refine based on user feedback.

### **2. Simplified Access Control**
- **Admin**: `brennan.tharaldson@gmail.com` - always full access
- **Test User**: `feedbacklooploop@gmail.com` - hardcoded active subscription (temporary)
- **Read-Only**: Simple broad approach - block all POST/PUT/PATCH/DELETE requests

### **3. Subscription Status Caching**
- Should subscription status be cached in JWT token?
- Or checked on every API request?
- How often should we sync with Stripe?

**Recommendation**: Cache in database, sync via webhooks, with periodic reconciliation.

---

## Success Metrics

### **Technical Metrics**
- ✅ Zero payment data stored locally
- ✅ Webhook processing reliability > 99%
- ✅ Read-only mode prevents all mutations
- ✅ Admin access always functional

### **User Experience Metrics**
- ✅ Clear subscription status visibility
- ✅ Seamless checkout experience
- ✅ Intuitive cancellation process
- ✅ Helpful upgrade prompts for expired users

---

**Next Steps**: Await clarification on the questions above, then proceed with Phase 1 implementation.