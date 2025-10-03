# Loading Components Setup

This project now includes comprehensive loading states using shadcn/ui components and custom implementations.

## 🎯 Components Added

### 1. Skeleton Component

- **File**: `app/components/ui/skeleton.tsx`
- **Source**: shadcn/ui registry
- **Purpose**: Loading placeholders for content

### 2. Custom Spinner Component

- **File**: `app/components/ui/spinner.tsx`
- **Purpose**: Animated loading indicators
- **Features**: Multiple sizes and variants

## 🚀 Usage Examples

### Skeleton Component

```tsx
import { Skeleton } from "~/components/ui/skeleton";

// Basic skeleton
<Skeleton className="h-4 w-full" />

// Card skeleton
<div className="p-3 border rounded-lg">
  <Skeleton className="h-5 w-3/4 mb-2" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-2/3 mt-1" />
</div>
```

### Spinner Component

```tsx
import { Spinner } from "~/components/ui/spinner";

// Different sizes
<Spinner size="sm" />   // 16x16px
<Spinner size="md" />    // 24x24px (default)
<Spinner size="lg" />    // 32x32px

// Different variants
<Spinner variant="default" />  // Primary color
<Spinner variant="muted" />    // Muted color

// With loading text
<div className="flex items-center gap-2">
  <Spinner size="sm" />
  <span>Loading...</span>
</div>
```

## 🎨 Implementation in Home Page

### Search Input with Loading State

```tsx
<div className="relative flex-1">
  <Input type="text" name="q" placeholder="Search posts" className="pr-8" />
  {isLoading && (
    <div className="absolute right-2 top-1/2 -translate-y-1/2">
      <Spinner size="sm" variant="muted" />
    </div>
  )}
</div>
```

### Content Loading with Skeletons

```tsx
{
  isLoading && (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span>Loading posts...</span>
      </div>
      {/* Skeleton placeholders */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-3 border rounded-lg">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3 mt-1" />
        </div>
      ))}
    </div>
  );
}
```

## 🛠 Custom Spinner Features

### Props

- `size`: "sm" | "md" | "lg" - Controls spinner size
- `variant`: "default" | "muted" - Controls color scheme
- `className`: Additional CSS classes

### Styling

- Uses `Loader2Icon` from Lucide React
- Includes `animate-spin` for rotation
- Responsive sizing with Tailwind classes
- Dark mode support

## 🎯 Best Practices

### 1. Loading States

- Show skeleton placeholders for content structure
- Use spinners for actions and form submissions
- Combine both for comprehensive loading experience

### 2. Accessibility

- Include loading text for screen readers
- Use appropriate ARIA labels
- Maintain focus management during loading

### 3. Performance

- Skeleton components are lightweight
- Spinners use CSS animations (hardware accelerated)
- Minimal re-renders with proper state management

## 🔧 Customization

### Spinner Colors

```tsx
// Custom color spinner
<Spinner className="text-blue-500" />

// Custom size
<Spinner className="h-12 w-12" />
```

### Skeleton Shapes

```tsx
// Circle skeleton
<Skeleton className="h-8 w-8 rounded-full" />

// Custom skeleton
<Skeleton className="h-20 w-full rounded-lg" />
```

## 📚 Resources

- [shadcn/ui Skeleton](https://ui.shadcn.com/docs/components/skeleton)
- [Lucide React Icons](https://lucide.dev/)
- [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)

## 🎉 Example Implementation

The home page (`app/routes/home.tsx`) demonstrates:

- Search input with inline spinner
- Content loading with skeleton placeholders
- Error states with proper styling
- Responsive design with dark mode support
