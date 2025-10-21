# Rewards Section - Nested Routes Migration

## ✅ Migration Complete

The rewards section has been successfully migrated from **query parameter-based tabs** to **React Router v7 nested routes**.

---

## 🔄 What Changed

### Before (Query Parameters)
```
/dashboard/rewards?activeTab=claimable
/dashboard/rewards?activeTab=pending
/dashboard/rewards?activeTab=history
```

### After (Nested Routes)
```
/dashboard/rewards/claimable
/dashboard/rewards/pending
/dashboard/rewards/history
```

---

## 📁 New File Structure

```
app/routes/dashboard/rewards/
├── layout.tsx                    # Main layout with header, stats, and tab navigation
├── claimable/
│   └── page.tsx                 # Claimable rewards route
├── pending/
│   └── page.tsx                 # Pending rewards route
├── history/
│   └── page.tsx                 # Claim history route
├── components/
│   ├── claimable-rewards-list.tsx
│   ├── pending-rewards-list.tsx
│   ├── claim-history-list.tsx
│   └── ... (other components)
└── hooks/
    ├── use-reward-dashboard-summary.ts
    └── use-synthetic-rewards-earned.ts
```

---

## 🗑️ Removed Files

- ❌ `page.tsx` (replaced by `layout.tsx`)
- ❌ `components/rewards-tabs.tsx` (tab logic now in layout)
- ❌ `hooks/use-tabs-query-state.ts` (React Router handles navigation)

---

## 🎯 Key Benefits

### 1. **Better SEO**
Each tab is now a unique URL that search engines can index.

### 2. **Shareable Links**
Users can share direct links to specific tabs:
- Share claimable rewards: `https://app.com/dashboard/rewards/claimable`
- Share history: `https://app.com/dashboard/rewards/history`

### 3. **Browser Navigation**
Back/forward buttons work naturally - users can navigate between tabs using browser controls.

### 4. **Cleaner Code**
- No need for `nuqs` library for tab state management
- React Router handles all navigation logic
- Reduced complexity in component code

### 5. **Better UX**
- Tab state persists on page refresh
- URLs reflect current application state
- Users can bookmark specific tabs

---

## 🔧 How It Works

### Route Configuration (`routes.ts`)
```typescript
layout('routes/dashboard/rewards/layout.tsx', [
  index('routes/dashboard/rewards/claimable/page.tsx'),  // Default route
  route('claimable', 'routes/dashboard/rewards/claimable/page.tsx'),
  route('pending', 'routes/dashboard/rewards/pending/page.tsx'),
  route('history', 'routes/dashboard/rewards/history/page.tsx'),
])
```

### Layout Component (`layout.tsx`)
The layout contains:
- Header with breadcrumbs
- Rewards summary cards
- Tab navigation using `<NavLink>` components
- `<Outlet />` to render nested route content

```tsx
<NavLink
  to="/dashboard/rewards/claimable"
  className={({ isActive }) => /* styling based on active state */}
>
  💰 Claimable
</NavLink>

{/* Nested route renders here */}
<Outlet />
```

### Individual Route Pages
Each tab is now a separate route file that renders its specific content:

- `claimable/page.tsx` → `<ClaimableRewardsList />`
- `pending/page.tsx` → `<PendingRewardsList />`
- `history/page.tsx` → `<ClaimHistoryList />`

---

## 🔗 Navigation Updates

### Sidebar Links Updated
The app sidebar now uses proper route paths:

```typescript
{
  title: 'Rewards',
  url: '/dashboard/rewards/claimable',
  items: [
    { title: 'Claimable', url: '/dashboard/rewards/claimable' },
    { title: 'Pending', url: '/dashboard/rewards/pending' },
    { title: 'History', url: '/dashboard/rewards/history' },
  ],
}
```

### Tab Navigation
Tabs use React Router's `NavLink` component which:
- Automatically applies active styles
- Updates browser URL on click
- Works with browser back/forward buttons

---

## 🚀 Usage Examples

### Programmatic Navigation
```typescript
import { useNavigate } from 'react-router';

function MyComponent() {
  const navigate = useNavigate();
  
  const viewHistory = () => {
    navigate('/dashboard/rewards/history');
  };
  
  return <button onClick={viewHistory}>View History</button>;
}
```

### Direct Links
```tsx
import { Link } from 'react-router';

<Link to="/dashboard/rewards/claimable">
  View Claimable Rewards
</Link>
```

### Active Tab Detection
```tsx
import { useLocation } from 'react-router';

function MyComponent() {
  const location = useLocation();
  const isOnHistory = location.pathname === '/dashboard/rewards/history';
  
  return <div>{isOnHistory && 'Viewing history'}</div>;
}
```

---

## ✨ React Router v7 Features Used

1. **Nested Routes** - Parent layout with child routes
2. **Index Route** - `/dashboard/rewards` redirects to `/claimable`
3. **`<Outlet />`** - Renders nested route content
4. **`<NavLink>`** - Navigation with active state detection
5. **File-based Routing** - Routes defined in `routes.ts`

---

## 📝 Notes

- **Default Route**: Accessing `/dashboard/rewards` will automatically redirect to `/dashboard/rewards/claimable` (via the `index` route)
- **Suspense**: Each route page wraps its content in `<Suspense>` for loading states
- **Shared State**: Reward counts are fetched in the layout and passed to tab navigation
- **Authentication**: Middleware is applied at the layout level, protecting all nested routes

---

## 🎉 Result

The rewards section now follows React Router v7 best practices with:
- ✅ Clean, semantic URLs
- ✅ Better user experience
- ✅ Improved SEO
- ✅ Simplified state management
- ✅ Native browser navigation support

