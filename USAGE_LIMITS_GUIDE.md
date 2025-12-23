# AI Usage Limits & Blocking System

## Overview

Your Social StaX app now has a complete AI usage tracking and limiting system that prevents abuse of your API. Users are blocked from using AI features when they exceed their monthly limits.

## How It Works

### 1. **Automatic Usage Tracking**
- Every AI call (content generation, image generation, voice) is tracked
- Monthly counters reset on the first of each month
- Tracking is per-user, per-plan

### 2. **Limit Enforcement**
- **Before** any AI call, the system checks remaining usage
- If limit is exceeded → call is blocked with user-friendly error
- Users can see their remaining quota in the dashboard

### 3. **Different Limits for Different Users**

#### Paid Subscribers (Monthly Reset)
- **Trial**: 5 content, 10 images, 30 voice mins
- **Starter**: 50 content, 100 images, 300 voice mins
- **Pro**: 500 content, 1000 images, 1000 voice mins
- **Enterprise**: Unlimited

#### Free Access Grants (with custom limits per person)
- **Default Starter**: 20 content, 30 images, 60 voice mins
- **Default Pro**: 150 content, 300 images, 300 voice mins
- **Default Enterprise**: 300 content, 500 images, 500 voice mins
- **Custom**: You can override limits per person in Admin Panel

---

## Usage in Components

### Simple Usage Check
```typescript
import { checkContentGenerationLimit, AIUsageError } from '../services/aiUsageSafeWrapper';

// In your component:
try {
  const result = await checkContentGenerationLimit(
    userId,
    userEmail,
    userPlan
  );
  
  if (result.allowed) {
    // Call AI service
    const content = await generateContent(...);
  } else {
    alert(`Limit reached: ${result.message}`);
  }
} catch (error: any) {
  console.error(error.message);
}
```

### Using Safe Wrapper
```typescript
import { safeGenerateContentOptions, getAIErrorMessage } from '../services/safeAIWrapper';

// This handles limits AND API calls:
const result = await safeGenerateContentOptions(
  client,
  topic,
  userEmail,
  userPlan,
  uid
);

if (result.success) {
  console.log('Generated:', result.data);
  alert(result.message); // "✓ Generated content. 10 uses remaining..."
} else {
  alert(getAIErrorMessage(result.error));
}
```

### With Usage Alert Component
```typescript
import UsageLimitAlert from '../components/UsageLimitAlert';

const MyComponent = () => {
  const [usageError, setUsageError] = useState<AIUsageError | null>(null);

  const handleGenerate = async () => {
    try {
      const result = await safeGenerateContentOptions(
        client, topic, email, plan, uid
      );
      if (!result.success && result.error) {
        setUsageError(result.error);
      }
    } catch (error) {
      // error handling
    }
  };

  return (
    <>
      <button onClick={handleGenerate}>Generate</button>
      <UsageLimitAlert error={usageError} />
    </>
  );
};
```

---

## Admin Controls

### Grant Free Access with Custom Limits
In the Admin Panel:

1. Click "Grant Free Access"
2. Enter email, plan, reason, expiration
3. Click "Show Custom Usage Limits"
4. Set specific limits:
   - `Content Generations/month`
   - `Image Generations/month`
   - `Voice Assistant Minutes/month`
   - `API Calls/month`
   - Use `-1` for unlimited
5. Save

**Example**: Grant a beta tester Pro plan with reduced limits:
- Content: 100 (vs 500 default)
- Images: 200 (vs 1000 default)
- Voice: 200 mins (vs 1000 default)

---

## Error Handling

### AIUsageError Type
```typescript
class AIUsageError extends Error {
  constructor(message: string, remaining: number = 0)
}
```

**Properties**:
- `message`: Human-readable error
- `remaining`: How many uses left
- `name`: "AIUsageError"

### Example Error Messages
- "You've reached your monthly content generation limit (0 remaining)"
- "Insufficient voice assistant minutes. You need 5 minutes but only have 2 remaining"
- "Content generation limit reached for your starter plan"

---

## Display Usage to Users

### Show Usage Dashboard
```typescript
import UsageDisplay from '../components/UsageDisplay';

<UsageDisplay uid={uid} plan={plan} />
```

This shows:
- ✅ Content generation progress bar
- ✅ Image generation progress bar
- ✅ Voice assistant progress bar
- ⚠️ Warning when near 80% usage
- 🚫 Block message when limit reached

---

## Monitoring (Admin)

### Get User Quota
```typescript
import { getUserQuotaDisplay } from '../services/aiUsageSafeWrapper';

const quota = await getUserQuotaDisplay(uid, email, plan);
console.log(quota);
// {
//   contentGenerations: { used: 15, limit: 50, percentage: 30 }
//   imageGenerations: { used: 25, limit: 100, percentage: 25 }
//   voiceAssistant: { used: 120, limit: 300, percentage: 40 }
// }
```

---

## Testing

### Test Limit Blocking
1. Sign in as user
2. Generate content 5-10 times
3. Check database → usage_stats collection
4. Manually set `contentGenerations: 49` for starter plan
5. Try to generate → should show "1 remaining"
6. Generate again → should show limit error

### Test Free Access Limits
1. Grant free access with custom limit: `{ monthlyContentGenerations: 3 }`
2. Sign in as that user
3. Generate content 3 times
4. Try 4th → should be blocked

---

## Security Notes

1. **Usage is per-user**: Can't game the system with multiple accounts
2. **Monthly reset**: Automatic on day 1 of each month
3. **Admin panel**: Only accessible to admin users
4. **Blocking is server-side**: Checked before API calls are made

---

## Future Enhancements

- [ ] Soft limits (warn at 80%, block at 100%)
- [ ] Upgrade prompts in UI
- [ ] Usage analytics dashboard
- [ ] Pro-rate refunds for downgrading
- [ ] Burst allowance (small overage permitted)
