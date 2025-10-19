# Reward Components - Composition Pattern

## Overview

The `Reward` component has been refactored to use a **composition pattern** (also known as compound component pattern), making it highly flexible and reusable across different contexts.

## What Changed?

### Before (Legacy Pattern)

```tsx
import { RewardProvider, RewardTimeRemaining, RewardClaimableDate } from './reward';

<RewardProvider reward={reward}>
  <Card>
    <CardHeader>
      <CardTitle>{reward.poll_title}</CardTitle>
    </CardHeader>
    <CardContent>
      <RewardTimeRemaining />
      <RewardClaimableDate />
    </CardContent>
  </Card>
</RewardProvider>
```

### After (Composition Pattern)

```tsx
import { Reward } from './reward';

<Reward reward={reward}>
  <Reward.Card>
    <Reward.Header>
      <Reward.Title />
    </Reward.Header>
    <Reward.Content>
      <Reward.TimeRemaining />
      <Reward.ClaimableDate />
    </Reward.Content>
  </Reward.Card>
</Reward>
```

## Benefits

✅ **Flexible** - Mix and match components as needed  
✅ **Reusable** - Same components, different layouts  
✅ **Maintainable** - Single source of truth for reward data  
✅ **Type-safe** - Full TypeScript support  
✅ **Customizable** - Override props and styles easily  
✅ **Readable** - Self-documenting component structure  
✅ **Backward Compatible** - Legacy exports still work  

## Quick Start

### 1. Import the Component

```tsx
import { Reward } from '~/routes/dashboard/rewards/components';
```

### 2. Basic Usage

```tsx
<Reward reward={rewardData}>
  <Reward.Card>
    <Reward.Header>
      <Reward.HeaderContainer>
        <Reward.TitleContainer>
          <Reward.TitleGroup>
            <Reward.Title />
            <Reward.StatusBadge status="active" />
          </Reward.TitleGroup>
          <Reward.Description />
        </Reward.TitleContainer>
      </Reward.HeaderContainer>
    </Reward.Header>
    
    <Reward.Content>
      <Reward.Section>
        <Reward.TimeRemaining />
        <Reward.ClaimableDate />
      </Reward.Section>
    </Reward.Content>
  </Reward.Card>
</Reward>
```

## Component Categories

### 🎯 Root & Layout
- `Reward` - Root component (provides context)
- `Reward.Card` - Card wrapper
- `Reward.Header` - Card header
- `Reward.Content` - Card content
- `Reward.Section` - Content section

### 📝 Header Components
- `Reward.HeaderContainer`
- `Reward.TitleContainer`
- `Reward.TitleGroup`
- `Reward.Title`
- `Reward.Description`
- `Reward.StatusBadge`

### ⏰ Time Components
- `Reward.TimeRemaining`
- `Reward.ClaimableDate`

### 📊 Info Components
- `Reward.InfoGrid`
- `Reward.InfoRow`
- `Reward.VotedDate`
- `Reward.TotalVotes`
- `Reward.ChoiceVotes`

### 💰 Amount Components
- `Reward.AmountBox`
- `Reward.AmountRow`
- `Reward.AmountLabel`
- `Reward.AmountValue`
- `Reward.Principal`

### 🔔 Other Components
- `Reward.Alert`
- `Reward.Actions`

## Real-World Examples

### Pending Rewards (Active Polls)

```tsx
<Reward reward={reward}>
  <Reward.Card>
    <Reward.Header>
      <Reward.HeaderContainer>
        <Reward.TitleContainer>
          <Reward.TitleGroup>
            <Reward.Title />
            <Reward.StatusBadge status="active" />
          </Reward.TitleGroup>
          <Reward.Description />
        </Reward.TitleContainer>
      </Reward.HeaderContainer>
    </Reward.Header>

    <Reward.Content>
      <Reward.Section>
        <Reward.TimeRemaining />
        <Reward.ClaimableDate />
      </Reward.Section>

      <Reward.InfoGrid>
        <Reward.VotedDate />
        <Reward.TotalVotes />
        <Reward.ChoiceVotes />
      </Reward.InfoGrid>

      <Reward.Alert variant="warning">
        ⚠️ Reward will be claimable after poll ends
      </Reward.Alert>

      <Reward.Actions>
        <Button variant="outline">View Poll</Button>
      </Reward.Actions>
    </Reward.Content>
  </Reward.Card>
</Reward>
```

### Claimable Rewards

```tsx
<Reward reward={reward}>
  <Reward.Card>
    <Reward.Header>
      <Reward.HeaderContainer>
        <Reward.TitleContainer>
          <Reward.TitleGroup>
            <Reward.Title />
            <Reward.StatusBadge status="claimable" />
          </Reward.TitleGroup>
        </Reward.TitleContainer>
      </Reward.HeaderContainer>
    </Reward.Header>

    <Reward.Content>
      <Reward.AmountBox className="bg-green-500/10 border border-green-500/20">
        <Reward.AmountRow>
          <Reward.AmountLabel emoji="💎">Reward:</Reward.AmountLabel>
          <Reward.AmountValue>
            <ClaimAmount reward={reward} className="text-xl font-bold text-green-700" />
          </Reward.AmountValue>
        </Reward.AmountRow>
      </Reward.AmountBox>

      <Reward.Alert variant="success">
        ✅ Your reward is ready! Claim now to receive your tokens.
      </Reward.Alert>

      <Reward.Actions>
        <Button>Claim Now</Button>
      </Reward.Actions>
    </Reward.Content>
  </Reward.Card>
</Reward>
```

### Claimed Rewards (History)

```tsx
<Reward reward={reward}>
  <Reward.Card className="opacity-75 hover:opacity-100 transition-opacity">
    <Reward.Header>
      <Reward.HeaderContainer>
        <Reward.TitleContainer>
          <Reward.TitleGroup>
            <Reward.Title emoji="✅" />
            <Reward.StatusBadge status="claimed" />
          </Reward.TitleGroup>
        </Reward.TitleContainer>
      </Reward.HeaderContainer>
    </Reward.Header>

    <Reward.Content>
      <Reward.InfoGrid>
        <Reward.VotedDate />
        <Reward.TotalVotes />
      </Reward.InfoGrid>

      <Reward.AmountBox className="bg-green-500/10 border border-green-500/20">
        <Reward.AmountRow>
          <Reward.AmountLabel emoji="💰">Claimed Amount:</Reward.AmountLabel>
          <Reward.AmountValue>
            <ClaimAmount reward={reward} className="text-xl font-bold text-green-700" />
          </Reward.AmountValue>
        </Reward.AmountRow>
      </Reward.AmountBox>

      <Reward.Actions>
        <Button variant="outline" size="sm">View Poll</Button>
      </Reward.Actions>
    </Reward.Content>
  </Reward.Card>
</Reward>
```

## Customization

### Override Default Props

```tsx
<Reward.Title emoji="🎉">Custom Title</Reward.Title>
<Reward.TimeRemaining label="Available in:" />
<Reward.StatusBadge status="claimable" />
<Reward.Principal label="Staked:" />
```

### Add Custom Classes

```tsx
<Reward.Card className="border-2 border-green-500">
  <Reward.Title className="text-3xl text-green-600" />
  <Reward.AmountBox className="bg-green-50" />
</Reward.Card>
```

### Custom Info Rows

```tsx
<Reward.InfoGrid>
  <Reward.VotedDate />
  <Reward.InfoRow label="Pool Share:" value={`${poolShare}%`} />
  <Reward.InfoRow label="Rank:" value={`#${rank}`} />
</Reward.InfoGrid>
```

### Mix with Other Components

```tsx
<Reward reward={reward}>
  <Reward.Card>
    <Reward.Header>
      <Reward.Title />
      <ShareButton pollId={reward.poll_id} />
    </Reward.Header>
    
    <Reward.Content>
      <Reward.TimeRemaining />
      <VoteProgressBar reward={reward} />
    </Reward.Content>
  </Reward.Card>
</Reward>
```

## Advanced: Custom Components with Context

Access reward data in your own components:

```tsx
import { useRewardContext } from './reward';

function CustomRewardInfo() {
  const { reward } = useRewardContext();
  
  return (
    <div>
      <p>Poll ID: {reward.poll_id}</p>
      <p>Amount: {reward.reward_amount}</p>
    </div>
  );
}

// Usage
<Reward reward={reward}>
  <Reward.Card>
    <Reward.Content>
      <CustomRewardInfo />
    </Reward.Content>
  </Reward.Card>
</Reward>
```

## Status Badge Options

```tsx
<Reward.StatusBadge status="active" />   // 🔵 Active
<Reward.StatusBadge status="claimable" /> // ✅ Claimable
<Reward.StatusBadge status="claimed" />   // 💰 Claimed
<Reward.StatusBadge status="expired" />   // ⏰ Expired
```

## Alert Variants

```tsx
<Reward.Alert variant="warning">⚠️ Warning message</Reward.Alert>
<Reward.Alert variant="info">ℹ️ Info message</Reward.Alert>
<Reward.Alert variant="success">✅ Success message</Reward.Alert>
<Reward.Alert variant="error">❌ Error message</Reward.Alert>
```

## Files Updated

- ✅ `reward.tsx` - Main composable component
- ✅ `pending-rewards-list.tsx` - Updated to use composition pattern
- ✅ `claimable-rewards-list.tsx` - Updated to use composition pattern
- ✅ `claim-history-list.tsx` - Updated to use composition pattern
- ✅ `index.ts` - Added exports

## Documentation

- 📖 `reward-examples.md` - Comprehensive examples and use cases
- 📖 `README.md` - This file (quick reference)

## Migration Guide

If you have existing code using the legacy pattern, it will **still work**:

```tsx
// Legacy - still works
import { RewardProvider, RewardTimeRemaining } from './reward';

<RewardProvider reward={reward}>
  <RewardTimeRemaining />
</RewardProvider>
```

But we recommend migrating to the new pattern:

```tsx
// New - recommended
import { Reward } from './reward';

<Reward reward={reward}>
  <Reward.TimeRemaining />
</Reward>
```

## Support

For more examples, see `reward-examples.md` in the same directory.

For questions or issues, please refer to the project documentation or contact the development team.

---

**Built with ❤️ for AgaroVote**

