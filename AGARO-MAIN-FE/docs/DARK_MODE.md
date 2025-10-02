# Dark Mode Implementation

## Overview
AgaroVote now supports a complete dark mode system with three theme options: Light, Dark, and System (follows OS preference).

## Features

✅ **Three Theme Modes**
- **Light** - Bright theme for daytime use
- **Dark** - Dark theme for low-light environments
- **System** - Automatically matches your operating system preference

✅ **Persistent Theme**
- Theme preference is saved in cookies (1 year expiration)
- Survives page refreshes and browser restarts
- Server-side rendering friendly (no flash of incorrect theme)

✅ **Zero Flash on Load**
- Inline script prevents flash of unstyled content (FOUC)
- Theme is applied before React hydration
- Smooth theme transitions

✅ **React Router 7 Compatible**
- Uses React Router's cookie utilities
- Loader function reads theme from cookies
- SSR-friendly implementation

## Architecture

### Files Created

1. **`app/lib/theme.server.ts`**
   - Server-side theme utilities
   - Cookie creation and parsing
   - Type definitions for theme

2. **`app/lib/theme-provider.tsx`**
   - Client-side theme context
   - React hook for theme management
   - System preference detection
   - Cookie updates on theme change

3. **`app/components/theme-toggle.tsx`**
   - Standalone theme toggle component
   - Dropdown menu with Light/Dark/System options
   - Icon indicators for current theme

### Files Modified

1. **`app/root.tsx`**
   - Added theme loader function
   - ThemeProvider wrapper
   - Inline script for flash prevention
   - suppressHydrationWarning on html element

2. **`app/components/nav-user.tsx`**
   - Integrated theme submenu in user dropdown
   - Theme icon indicators (Sun/Moon/Monitor)
   - Active theme checkmarks

## Usage

### Accessing Theme in Components

```tsx
import { useTheme } from "~/lib/theme-provider";

export function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // theme: "light" | "dark" | "system"
  // resolvedTheme: "light" | "dark" (computed from system if theme is "system")
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <button onClick={() => setTheme("dark")}>Switch to Dark</button>
    </div>
  );
}
```

### Using the Theme Toggle

The theme toggle is already integrated in the user navigation dropdown:

1. Click on your avatar in the sidebar footer
2. Look for the "Theme" submenu
3. Choose Light, Dark, or System

### Standalone Theme Toggle Component

You can also use the standalone theme toggle button:

```tsx
import { ThemeToggle } from "~/components/theme-toggle";

export function MyComponent() {
  return <ThemeToggle />;
}
```

## How It Works

### 1. Server-Side (Initial Load)

```typescript
// app/root.tsx - Loader
export async function loader({ request }: Route.LoaderArgs) {
  const theme = await getTheme(request);
  return { theme };
}
```

The loader reads the theme preference from cookies on the server.

### 2. Client-Side (Hydration)

```typescript
// app/root.tsx - Layout
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        const theme = document.cookie.match(/theme=([^;]+)/)?.[1] || 'system';
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
      })();
    `,
  }}
/>
```

An inline script applies the theme **before** React hydration to prevent flash.

### 3. Theme Context

```typescript
// ThemeProvider wraps the entire app
<ThemeProvider initialTheme={loaderData?.theme || "system"}>
  <QueryClientProvider>
    <Outlet />
  </QueryClientProvider>
</ThemeProvider>
```

The ThemeProvider:
- Manages theme state
- Listens to system preference changes
- Updates cookies when theme changes
- Provides `useTheme()` hook to all components

### 4. CSS Classes

```css
/* app/app.css */
.dark {
  --background: oklch(0.2223 0.006 271.1393);
  --foreground: oklch(0.9551 0 0);
  /* ... dark mode colors */
}
```

When the `dark` class is added to `<html>`, all CSS variables switch to dark mode values.

## Theme Persistence Flow

1. **User selects theme** → Component calls `setTheme("dark")`
2. **Cookie is set** → `document.cookie = "theme=dark; path=/; max-age=31536000"`
3. **DOM is updated** → `document.documentElement.classList.toggle("dark", true)`
4. **CSS applies** → All components instantly reflect dark mode
5. **Next page load** → Server reads cookie → Inline script applies theme → No flash!

## System Theme Detection

When theme is set to "system":

```typescript
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
mediaQuery.addEventListener("change", updateResolvedTheme);
```

The app listens to OS theme changes and automatically switches between light/dark.

## Best Practices

### ✅ Do:
- Use Tailwind's dark mode utilities: `dark:bg-gray-900`
- Access theme via `useTheme()` hook
- Test both light and dark modes during development
- Use semantic colors from the design system

### ❌ Don't:
- Manually manipulate `document.documentElement.classList`
- Hardcode colors instead of using CSS variables
- Forget to test theme switching
- Create custom dark mode implementations

## Color Palette

All colors are defined using OKLCH color space for better perceptual uniformity:

### Light Mode
- Background: `oklch(0.994 0 0)` - Near white
- Foreground: `oklch(0 0 0)` - Black
- Primary: `oklch(0.5393 0.2713 286.7462)` - Purple
- Sidebar: `oklch(0.9777 0.0051 247.8763)` - Light gray

### Dark Mode
- Background: `oklch(0.2223 0.006 271.1393)` - Dark blue-gray
- Foreground: `oklch(0.9551 0 0)` - Near white
- Primary: `oklch(0.6132 0.2294 291.7437)` - Bright purple
- Sidebar: `oklch(0.2011 0.0039 286.0396)` - Darker sidebar

## Troubleshooting

### Theme not persisting
- Check browser cookies are enabled
- Verify cookie path is set to "/"
- Check cookie max-age is sufficient

### Flash of wrong theme
- Ensure inline script is in `<head>`
- Verify script runs before React hydration
- Check cookie is being read correctly

### System theme not updating
- Verify media query listener is attached
- Check browser supports `prefers-color-scheme`
- Test by changing OS theme while app is open

## Future Enhancements

- [ ] Add smooth theme transition animations
- [ ] Create custom color schemes for organizations
- [ ] Add high contrast mode
- [ ] Implement custom theme editor
- [ ] Add theme preview before applying
- [ ] Support for multiple brand themes

## Technical Details

- **Cookie Name**: `theme`
- **Cookie Max Age**: 31,536,000 seconds (1 year)
- **Cookie Path**: `/` (entire app)
- **Cookie SameSite**: `Lax`
- **Cookie HttpOnly**: `false` (accessible by JavaScript)
- **Cookie Secure**: `true` in production, `false` in development

## Related Files

- `app/app.css` - Theme color definitions
- `app/root.tsx` - Theme initialization
- `app/lib/theme.server.ts` - Server utilities
- `app/lib/theme-provider.tsx` - Client context
- `app/components/theme-toggle.tsx` - Toggle component
- `app/components/nav-user.tsx` - User menu integration

---

**Implementation Date**: October 2025  
**Framework**: React Router 7  
**Styling**: Tailwind CSS v4 + CSS Variables

