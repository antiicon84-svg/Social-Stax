# Admin Setup & Subscription Management Guide

## Admin User Setup

### Creating First Admin User

Admins have elevated permissions to manage subscriptions, users, and generate test tokens.

#### Step 1: Hash Admin Password
Create a secure password hash using bcrypt (10 rounds):

```javascript
const bcrypt = require('bcrypt');

const password = 'your-secure-admin-password';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

#### Step 2: Create Admin Document in Firestore

Navigate to Firestore Console and create:

**Collection:** `admins`
**Document ID:** (auto-generate or use email)

**Fields:**
```json
{
  "email": "admin@socialstax.com",
  "passwordHash": "$2b$10$...",
  "role": "admin",
  "permissions": [
    "manage_users",
    "manage_subscriptions",
    "generate_tokens",
    "view_analytics"
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "status": "active"
}
```

### Admin Permissions

| Permission | Description | Scope |
|------------|-------------|-------|
| `manage_users` | Suspend/activate user accounts | All users |
| `manage_subscriptions` | Update subscription plans and quotas | All users |
| `generate_tokens` | Create test access tokens | Global |
| `view_analytics` | Access usage analytics and reports | Global |
| `manage_admins` | Add/remove other admins | Global |

## Subscription Management

### Subscription Tiers

#### Free Tier
- **API Calls/Day:** 100
- **Features:** Basic API access
- **Cost:** Free
- **Auto-created on:** User registration

#### Starter Tier
- **API Calls/Day:** 1,000
- **Features:** Standard API features
- **Cost:** $9/month
- **Manual upgrade required**

#### Pro Tier
- **API Calls/Day:** 10,000
- **Features:** Advanced features + priority support
- **Cost:** $29/month
- **Manual upgrade required**

#### Enterprise Tier
- **API Calls/Day:** Unlimited
- **Features:** Full access + dedicated support
- **Cost:** Custom pricing
- **Contact sales for setup**

### Upgrading User Subscription

**Frontend Implementation:**
```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const updateSubscription = httpsCallable(functions, 'updateSubscription');

const upgradeUser = async (userId, newPlan) => {
  try {
    const result = await updateSubscription({
      userId,
      plan: newPlan,
      status: 'active',
      quotaLimit: getQuotaForPlan(newPlan) // 1000, 10000, unlimited
    });
    return result.data;
  } catch (error) {
    console.error('Upgrade failed:', error);
  }
};
```

### Generating Test Access Tokens

Admins can generate limited-use tokens for testing and external integrations.

**Use Cases:**
- Testing without creating user account
- Providing temporary access to partners/testers
- Rate-limited API testing
- Trial periods

**Frontend Implementation:**
```javascript
const generateAccessToken = httpsCallable(functions, 'generateAccessToken');

const createTestToken = async (email, quotaLimit = 1000, days = 30) => {
  try {
    const result = await generateAccessToken({
      email,
      quotaLimit,
      expiresInDays: days
    });
    return result.data.token;
  } catch (error) {
    console.error('Token generation failed:', error);
  }
};
```

**Token Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "quotaLimit": 1000,
  "expiresInDays": 30,
  "message": "Access token generated"
}
```

### Access Token Management

Access tokens are stored in the `accessTokens` collection:

```json
{
  "token": "jwt-token-string",
  "email": "tester@example.com",
  "createdBy": "admin-user-id",
  "createdAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-02-14T10:30:00Z",
  "quotaLimit": 1000,
  "quotaUsed": 234,
  "status": "active",
  "lastUsedAt": "2024-01-20T15:45:22Z"
}
```

### Monitoring Quota Usage

**Get User Quota Status:**
```javascript
const getQuotaStatus = httpsCallable(functions, 'getQuotaStatus');

const checkQuota = async (userId) => {
  const status = await getQuotaStatus({ userId });
  console.log(`Used: ${status.data.quotaUsed}/${status.data.quotaLimit}`);
  console.log(`Usage: ${status.data.percentageUsed}%`);
  return status.data;
};
```

**Response:**
```json
{
  "plan": "starter",
  "quotaLimit": 1000,
  "quotaUsed": 234,
  "quotaRemaining": 766,
  "percentageUsed": "23.40",
  "status": "active",
  "expiresAt": null
}
```

## Admin Dashboard Features

Required admin panel functionality:

### 1. User Management
- [ ] List all users with search/filter
- [ ] View user profile and subscription
- [ ] Suspend/reactivate accounts
- [ ] Upgrade/downgrade subscriptions
- [ ] View usage history
- [ ] Send notifications

### 2. Subscription Management
- [ ] View all active subscriptions
- [ ] Update subscription plans
- [ ] Set custom quotas
- [ ] Manage expiration dates
- [ ] Cancel subscriptions

### 3. Token Management
- [ ] Generate test tokens
- [ ] View active tokens
- [ ] Revoke tokens
- [ ] Monitor token usage
- [ ] Set expiration dates

### 4. Analytics
- [ ] Total API calls by day/month
- [ ] Usage by subscription tier
- [ ] Revenue tracking
- [ ] User growth metrics
- [ ] Feature usage statistics

### 5. Settings
- [ ] Manage admin users
- [ ] Configure quota limits
- [ ] Set subscription pricing
- [ ] Email templates
- [ ] Security settings

## Daily Quota Reset

Daily quotas automatically reset at UTC midnight:

```javascript
// Triggered by Cloud Scheduler (daily at 00:00 UTC)
exports.resetDailyQuotas = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    const batch = db.batch();
    const subscriptions = await db.collection('subscriptions').get();
    
    subscriptions.forEach(doc => {
      batch.update(doc.ref, {
        apiUsed: 0,
        quotaResetAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`Reset quotas for ${subscriptions.size} users`);
  });
```

## Revenue Tracking

### Subscription Revenue Calculation

```javascript
const calculateMonthlyRevenue = async (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  
  const subscriptions = await db.collection('subscriptions')
    .where('plan', '!=', 'free')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<', endDate)
    .get();
  
  const pricingMap = {
    'starter': 9,
    'pro': 29,
    'enterprise': 0 // Custom billing
  };
  
  let revenue = 0;
  subscriptions.forEach(doc => {
    const plan = doc.data().plan;
    revenue += pricingMap[plan] || 0;
  });
  
  return revenue;
};
```

## Quota Warnings

Notify users when approaching quota limits:

```javascript
// Trigger when usage > 80% of quota
exports.sendQuotaWarning = functions.firestore
  .document('subscriptions/{userId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const percentageUsed = (newData.apiUsed / newData.apiQuota) * 100;
    
    if (percentageUsed > 80) {
      // Send email notification
      await sendEmail({
        to: newData.userEmail,
        subject: `Quota Warning: ${percentageUsed}% used`,
        body: `You've used ${percentageUsed}% of your API quota.`
      });
    }
  });
```

## Admin Security Best Practices

1. **Password Policy**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, special chars
   - Change every 90 days
   - Never reuse last 5 passwords

2. **Account Security**
   - Use strong, unique passwords
   - Enable two-factor authentication (when implemented)
   - Regular password audits
   - Immediate account lockout after 5 failed logins

3. **Access Control**
   - Limit admin accounts to necessary personnel
   - Regular permission reviews
   - Document all administrative actions
   - Use separate admin email addresses

4. **Audit Logging**
   - Log all subscription changes
   - Track token generation
   - Monitor admin login attempts
   - Archive logs for 1 year

## Troubleshooting

**Admin Login Fails**
- Verify email and password in admins collection
- Check account status is 'active'
- Verify bcrypt hash is correct

**Quota Not Resetting**
- Check Cloud Scheduler job is active
- Verify Firestore write permissions
- Check timezone configuration

**Token Generation Fails**
- Verify admin is authenticated
- Check JWT_SECRET environment variable
- Ensure accessTokens collection exists

## Next Steps

1. Create admin user in Firestore
2. Build admin dashboard UI
3. Implement subscription upgrade flow
4. Set up email notifications
5. Configure Cloud Scheduler for quota reset
