# Components & Styling

## Component Conventions

- One component per file
- Naming: kebab-case.tsx (e.g., `login-form.tsx`, `command-menu.tsx`)
- Keyboard navigation support
- Proper ARIA attributes when needed
- Accessible form validation
- No custom CSS — use Tailwind utility classes exclusively
- CSS variables for theming defined in `src/main.css`

## Tailwind CSS v4

- OKLCH color space for light/dark modes
- `class-variance-authority` for variant management
- `tailwind-merge` via `cn()` utility for conditional classes
- Custom variant: `@custom-variant dark` for dark mode
- Mobile-first breakpoint strategy

## Mobile-Responsive Patterns

### Touch Targets (WCAG 2.5.5 AAA)

- Minimum: 44px x 44px for all interactive elements
- Buttons: `h-11` (44px default), `h-12` (48px large)
- Icon buttons: `size-11` (44px minimum)
- Inputs: `h-11` (44px)
- Nav links: `h-11` with padding

### iOS Auto-Zoom Prevention

```tsx
// 16px on mobile prevents Safari auto-zoom, 14px on desktop
className="text-base md:text-sm"
```

### Responsive Layout Patterns

```tsx
// Forms — single column, responsive spacing
<div className="space-y-4 md:space-y-6">

// Grid — stack on mobile, multi-column on desktop
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

// Flex — stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-2">
  <Button className="w-full md:w-auto" />
</div>

// Padding — tighter on mobile
<section className="p-6 md:p-10">
```

### Breakpoints

- Mobile: < 768px (base styles, no prefix)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)
- Large: `xl:` (1280px+)

### Sidebar Behavior

- Mobile/Tablet (< 1024px): Hidden, opens as Sheet drawer
- Desktop (1024px+): Visible with collapse
- Pattern: `hidden md:block`, mobile trigger `lg:hidden`

### Performance

- Code splitting: TanStack Router `autoCodeSplitting: true`
- Loading: Skeleton components during TanStack Query `isLoading`
- Pattern:
  ```tsx
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorAlert />;
  return <Content data={data} />;
  ```

### Viewport Testing

```tsx
import { setMobileViewport } from '@lib/viewport-test-utils';

describe('Component - Mobile', () => {
  beforeEach(() => setMobileViewport());
  // ...
});
```

Functions: `setMobileViewport()`, `setTabletViewport()`, `setDesktopViewport()` from `src/lib/viewport-test-utils.ts`.
