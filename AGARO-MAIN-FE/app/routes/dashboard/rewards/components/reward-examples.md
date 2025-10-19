# Reward Component - Composition Pattern Examples

The `Reward` component uses a **composition pattern** (compound component), allowing you to build custom reward displays by composing smaller sub-components.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Available Components](#available-components)
- [Use Case Examples](#use-case-examples)
  - [Pending Rewards (Active Polls)](#1-pending-rewards-active-polls)
  - [Claimable Rewards](#2-claimable-rewards)
  - [Claimed Rewards (History)](#3-claimed-rewards-history)
  - [Minimal Card View](#4-minimal-card-view)
  - [List View (Compact)](#5-list-view-compact)
  - [Custom Layout](#6-custom-layout)

---

## Basic Usage

```tsx
import { Reward } from './reward';

<Reward reward={rewardData}>
  <Reward.Card>
    <Reward.Header>
      <Reward.Title />
    </Reward.Header>
    <Reward.Content>
      <Reward.TimeRemaining />
    </Reward.Content>
  </Reward.Card>
</Reward>
```

---

## Available Components

### Root & Layout
- `Reward` - Root component (provides context)
- `Reward.Card` - Card wrapper
- `Reward.Header` - Card header
- `Reward.Content` - Card content area
- `Reward.Section` - Content section with spacing

### Header Components
- `Reward.HeaderContainer` - Flex container for header items
- `Reward.TitleContainer` - Container for title group
- `Reward.TitleGroup` - Flex group for title + badge
- `Reward.Title` - Poll title
- `Reward.Description` - Vote choice description
- `Reward.StatusBadge` - Status badge (active/claimable/claimed/expired)

### Time Components
- `Reward.TimeRemaining` - Countdown timer
- `Reward.ClaimableDate` - Formatted claimable date

### Info Components
- `Reward.InfoGrid` - Grid layout for info rows
- `Reward.InfoRow` - Custom info row (label + value)
- `Reward.VotedDate` - Voted date row
- `Reward.TotalVotes` - Total poll votes row
- `Reward.ChoiceVotes` - Choice votes row

### Amount Components
- `Reward.AmountBox` - Reward amount container
- `Reward.AmountRow` - Flex row for amount display
- `Reward.AmountLabel` - Amount label
- `Reward.AmountValue` - Amount value container
- `Reward.Principal` - Principal amount text

### Other Components
- `Reward.Alert` - Alert box (warning/info/success/error)
- `Reward.Actions` - Action buttons container

---

## Use Case Examples

### 1. Pending Rewards (Active Polls)

Shows countdown, vote info, and potential rewards.

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
      {/* Countdown */}
      <Reward.Section>
        <Reward.TimeRemaining />
        <Reward.ClaimableDate />
      </Reward.Section>

      {/* Vote Info */}
      <Reward.InfoGrid>
        <Reward.VotedDate />
        <Reward.TotalVotes />
        <Reward.ChoiceVotes />
      </Reward.InfoGrid>

      {/* Potential Reward */}
      <Reward.AmountBox>
        <Reward.AmountRow>
          <Reward.AmountLabel />
          <Reward.AmountValue>
            <ClaimAmount className="text-xl font-bold" reward={reward} />
            <Reward.Principal />
          </Reward.AmountValue>
        </Reward.AmountRow>
      </Reward.AmountBox>

      {/* Warning */}
      <Reward.Alert variant="warning">
        ⚠️ Reward will be claimable after poll ends
      </Reward.Alert>

      {/* Actions */}
      <Reward.Actions>
        <Button variant="outline">View Poll</Button>
        <Button variant="outline">Set Reminder</Button>
      </Reward.Actions>
    </Reward.Content>
  </Reward.Card>
</Reward>
```

---

### 2. Claimable Rewards

Emphasizes the claim action and shows reward is ready.

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
          <Reward.Description />
        </Reward.TitleContainer>
      </Reward.HeaderContainer>
    </Reward.Header>

    <Reward.Content>
      {/* Reward Amount - Prominent Display */}
      <Reward.AmountBox className="bg-green-500/10 border border-green-500/20">
        <Reward.AmountRow>
          <Reward.AmountLabel emoji="💰">Ready to Claim:</Reward.AmountLabel>
          <Reward.AmountValue>
            <ClaimAmount className="text-2xl font-bold text-green-600" reward={reward} />
            <Reward.Principal className="text-green-700" />
          </Reward.AmountValue>
        </Reward.AmountRow>
      </Reward.AmountBox>

      {/* Vote Stats */}
      <Reward.InfoGrid>
        <Reward.VotedDate />
        <Reward.TotalVotes />
        <Reward.ChoiceVotes />
      </Reward.InfoGrid>

      {/* Success Alert */}
      <Reward.Alert variant="success">
        ✅ Your reward is ready! Claim now to receive your tokens.
      </Reward.Alert>

      {/* Primary Claim Action */}
      <Reward.Actions>
        <Button className="w-full" onClick={handleClaim}>
          Claim {rewardAmount} AGR
        </Button>
      </Reward.Actions>
    </Reward.Content>
  </Reward.Card>
</Reward>
```

---

### 3. Claimed Rewards (History)

Shows historical data without action buttons.

```tsx
<Reward reward={reward}>
  <Reward.Card className="opacity-75">
    <Reward.Header>
      <Reward.HeaderContainer>
        <Reward.TitleContainer>
          <Reward.TitleGroup>
            <Reward.Title emoji="✅" />
            <Reward.StatusBadge status="claimed" />
          </Reward.TitleGroup>
          <Reward.Description />
        </Reward.TitleContainer>
      </Reward.HeaderContainer>
    </Reward.Header>

    <Reward.Content>
      {/* Claimed Amount */}
      <Reward.AmountBox>
        <Reward.AmountRow>
          <Reward.AmountLabel emoji="💰">Claimed:</Reward.AmountLabel>
          <Reward.AmountValue>
            <p className="text-xl font-bold">{reward.reward_amount.toFixed(4)} AGR</p>
            <Reward.Principal />
          </Reward.AmountValue>
        </Reward.AmountRow>
      </Reward.AmountBox>

      {/* Historical Info */}
      <Reward.InfoGrid>
        <Reward.VotedDate />
        <Reward.InfoRow 
          label="Claimed At:" 
          value={<ClientDate date={new Date(reward.claimed_at!)} />}
          suppressHydrationWarning
        />
        <Reward.TotalVotes />
      </Reward.InfoGrid>

      {/* View Transaction */}
      <Reward.Actions>
        <Button variant="outline" size="sm">
          View Transaction
        </Button>
      </Reward.Actions>
    </Reward.Content>
  </Reward.Card>
</Reward>
```

---

### 4. Minimal Card View

Perfect for dashboard overviews or grid layouts.

```tsx
<Reward reward={reward}>
  <Reward.Card className="hover:shadow-md transition-shadow">
    <Reward.Header className="pb-3">
      <Reward.TitleGroup>
        <Reward.Title className="text-base" />
        <Reward.StatusBadge status="claimable" />
      </Reward.TitleGroup>
    </Reward.Header>

    <Reward.Content className="space-y-2 pt-0">
      <Reward.AmountBox className="p-3">
        <div className="text-center">
          <ClaimAmount className="text-xl" reward={reward} />
        </div>
      </Reward.AmountBox>
      
      <Button className="w-full" size="sm">
        Claim Now
      </Button>
    </Reward.Content>
  </Reward.Card>
</Reward>
```

---

### 5. List View (Compact)

No card wrapper - inline list item style.

```tsx
<Reward reward={reward}>
  <div className="flex items-center justify-between p-4 border-b hover:bg-muted/50">
    <div className="flex-1">
      <Reward.TitleGroup>
        <Reward.Title className="text-sm" emoji="" />
        <Reward.StatusBadge status="active" />
      </Reward.TitleGroup>
      <Reward.Description className="text-xs" />
    </div>

    <div className="flex items-center gap-4">
      <div className="text-right">
        <ClaimAmount className="text-lg font-bold" reward={reward} />
        <Reward.TimeRemaining label="Ready in:" className="text-xs" />
      </div>
      
      <Button size="sm" variant="ghost">
        View
      </Button>
    </div>
  </div>
</Reward>
```

---

### 6. Custom Layout

Build completely custom layouts by mixing components.

```tsx
<Reward reward={reward}>
  <div className="p-6 rounded-lg border bg-gradient-to-br from-purple-500/10 to-blue-500/10">
    {/* Custom Header */}
    <div className="flex items-center justify-between mb-4">
      <Reward.Title className="text-2xl" />
      <Reward.StatusBadge status="claimable" />
    </div>

    {/* Two Column Layout */}
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Info */}
      <div className="space-y-3">
        <Reward.InfoGrid>
          <Reward.VotedDate />
          <Reward.TotalVotes />
          <Reward.ChoiceVotes />
        </Reward.InfoGrid>
      </div>

      {/* Right: Amount & Action */}
      <div className="space-y-4">
        <Reward.AmountBox>
          <Reward.AmountRow>
            <Reward.AmountLabel />
            <Reward.AmountValue>
              <ClaimAmount reward={reward} />
              <Reward.Principal />
            </Reward.AmountValue>
          </Reward.AmountRow>
        </Reward.AmountBox>

        <Button className="w-full">Claim Now</Button>
      </div>
    </div>
  </div>
</Reward>
```

---

## Customization Tips

### 1. Override Default Props

Most components accept props to override defaults:

```tsx
<Reward.Title emoji="🎉">Custom Title</Reward.Title>
<Reward.TimeRemaining label="Available in:" />
<Reward.StatusBadge status="claimable" />
<Reward.Principal label="Staked:" />
```

### 2. Add Custom Classes

All components support `className` prop:

```tsx
<Reward.Card className="border-2 border-green-500">
  <Reward.Title className="text-3xl text-green-600" />
  <Reward.AmountBox className="bg-green-50" />
</Reward.Card>
```

### 3. Custom Info Rows

Use `Reward.InfoRow` for custom data:

```tsx
<Reward.InfoGrid>
  <Reward.VotedDate />
  <Reward.InfoRow 
    label="Pool Share:" 
    value={`${poolShare}%`} 
  />
  <Reward.InfoRow 
    label="Rank:" 
    value={`#${rank}`} 
  />
</Reward.InfoGrid>
```

### 4. Mix with Other Components

Compose with any other React components:

```tsx
<Reward reward={reward}>
  <Reward.Card>
    <Reward.Header>
      <Reward.Title />
      {/* Custom component */}
      <ShareButton pollId={reward.poll_id} />
    </Reward.Header>
    
    <Reward.Content>
      <Reward.TimeRemaining />
      {/* Another custom component */}
      <VoteProgressBar reward={reward} />
    </Reward.Content>
  </Reward.Card>
</Reward>
```

---

## Backward Compatibility

Legacy imports still work:

```tsx
import { RewardProvider, RewardTimeRemaining, RewardClaimableDate } from './reward';

<RewardProvider reward={reward}>
  <div>
    <RewardTimeRemaining />
    <RewardClaimableDate />
  </div>
</RewardProvider>
```

But prefer the new composition pattern:

```tsx
import { Reward } from './reward';

<Reward reward={reward}>
  <Reward.TimeRemaining />
  <Reward.ClaimableDate />
</Reward>
```

---

## Benefits of Composition Pattern

1. **Flexibility**: Mix and match components as needed
2. **Reusability**: Same components, different layouts
3. **Maintainability**: Single source of truth for reward data
4. **Type Safety**: Full TypeScript support
5. **Customization**: Override props and styles easily
6. **Readability**: Self-documenting component structure

---

## Context Hook

Access reward data in custom components:

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

---

That's it! The composition pattern gives you full control over how rewards are displayed while maintaining consistency and type safety. 🎉

