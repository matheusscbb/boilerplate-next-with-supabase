---
name: react-component
description: "Create React components for this design-system or features. USE FOR: creating new UI primitives, composite components, compound components, feature components, or custom hooks. Enforces: memoization (React.memo, useMemo, useCallback), SOLID principles, compound pattern when applicable, and current codebase conventions (forwardRef, interface types, barrel exports, Tailwind variant maps)."
argument-hint: "Component name and type (primitive | composite | feature | hook)"
---

# React Component Creation

## When to Use
- Creating a new primitive (Button, Input, Checkbox, etc.)
- Creating a composite/compound component (Accordion, Card, Table, etc.)
- Creating a feature component (LoginForm, etc.)
- Creating a custom hook
- Reviewing an existing component for convention compliance

---

## Anatomy of a Component

Every component lives in its own folder:

```
ComponentName/
├── ComponentName.tsx        # Component implementation
├── ComponentName.types.ts   # TypeScript interfaces only
├── index.ts                 # Barrel re-exports
└── README.md                # Usage examples
```

---

## Step-by-Step Procedure

### 1. Classify the Component

| Type | Pattern | Memoization |
|------|---------|-------------|
| Primitive (wraps a single HTML element) | `forwardRef` + `React.memo` | Always `React.memo` |
| Composite (composes primitives, ≥2 parts) | Compound (`Object.assign`) | `React.memo` on each sub-component |
| Feature (domain logic, page-level) | Compound when it has natural slots | `useMemo` / `useCallback` for handlers and derived values |
| Hook | — | always return stable references with `useCallback` / `useMemo` |

**Rule**: If a composite component has 2 or more natural sub-parts (Header, Body, Item, Footer, Cell…), use the Compound pattern.

---

### 2. Define Types (`ComponentName.types.ts`)

- Use **`interface`**, never `type` alias, for component props.
- Extend the matching HTML attribute interface.
- `Omit` conflicting native attributes explicitly.

```tsx
// ComponentName.types.ts
import type { HTMLAttributes } from 'react';

export interface ComponentNameProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}
```

SOLID — **Interface Segregation**: keep types minimal. Do not bundle unrelated props in a single interface; split into separate interfaces when a component has compound sub-parts.

---

### 3. Implement the Component (`ComponentName.tsx`)

#### 3a. Primitive (single element)

```tsx
'use client';
import { forwardRef, memo } from 'react';
import type { ComponentNameProps } from './ComponentName.types';

const variantStyles: Record<NonNullable<ComponentNameProps['variant']>, string> = {
  primary: '...',
  secondary: '...',
};

const sizeStyles: Record<NonNullable<ComponentNameProps['size']>, string> = {
  sm: '...',
  md: '...',
  lg: '...',
};

const ComponentNameInner = forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[variantStyles[variant], sizeStyles[size], className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
    );
  }
);

ComponentNameInner.displayName = 'ComponentName';

export const ComponentName = memo(ComponentNameInner);
```

**Why `forwardRef` + `memo`**: `forwardRef` loses memoization unless you explicitly wrap. Always compose them as shown.

#### 3b. Compound component (multiple parts)

```tsx
'use client';
import { memo } from 'react';
import type { ComponentNameProps, ComponentNameItemProps } from './ComponentName.types';

// SOLID — Single Responsibility: each sub-component has one job
const ComponentNameRoot = memo(function ComponentNameRoot({
  children,
  className = '',
  ...props
}: ComponentNameProps) {
  return (
    <div
      className={['...base styles...', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
});

const Item = memo(function ComponentNameItem({
  children,
  className = '',
  ...props
}: ComponentNameItemProps) {
  return (
    <div className={['...', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
});

// Compound pattern via Object.assign
export const ComponentName = Object.assign(ComponentNameRoot, { Item });
```

---

### 4. Memoization Rules

| Scenario | Tool |
|---------|------|
| Pure presentational component | `React.memo` — always |
| Event handler defined inside component | `useCallback` |
| Derived value computed from props/state | `useMemo` |
| Context value object | `useMemo` (prevents all consumers re-rendering) |
| Custom hook return values (objects/arrays) | `useMemo` / `useCallback` for each returned member |

```tsx
// Inside feature components
const handleSubmit = useCallback(async (data: FormData) => {
  await submitAction(data);
}, [submitAction]);

const filteredItems = useMemo(
  () => items.filter((i) => i.active),
  [items]
);
```

SOLID — **Open/Closed**: components should be open for extension (via `className`, `...props` spread, slots) and closed for modification.

---

### 5. SOLID Checklist

Before finishing, verify:

- [ ] **S** — Single Responsibility: each component/function has one reason to change. Split if it mixes UI structure with data logic.
- [ ] **O** — Open/Closed: extension via props (`className`, `children`, variant/size maps), not modification.
- [ ] **L** — Liskov: sub-components are substitutable. Spread `...props` so consumers can pass native HTML attributes.
- [ ] **I** — Interface Segregation: don't force sub-component props into the root interface. Define separate interfaces per sub-part.
- [ ] **D** — Dependency Inversion: feature components receive data/handlers as props or via hook; they don't fetch or mutate directly inside JSX.

---

### 6. Create the Barrel (`index.ts`)

Always export both the component and its types:

```ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName.types';
```

---

### 7. Register in design-system index

Add to `design-system/src/index.ts`:

```ts
export { ComponentName } from './path/to/ComponentName';
export type { ComponentNameProps } from './path/to/ComponentName';
```

---

### 8. Custom Hook Pattern

```tsx
// useHookName.ts
import { useCallback, useMemo } from 'react';

export function useHookName(input: InputType) {
  // SOLID — Single Responsibility: one concern per hook
  const derived = useMemo(() => computeValue(input), [input]);

  const handler = useCallback(() => {
    // ...
  }, [derived]);

  // Return stable reference object - memoize if used as dependency
  return { derived, handler };
}
```

---

## Context-Specific Overrides

| Location | Rule |
|----------|------|
| `design-system/src/primitives/` | Always `forwardRef` + `React.memo` + `displayName` |
| `design-system/src/components/` | Compound pattern required if ≥2 sub-parts |
| `design-system/src/layout/` | `React.memo` + accept `children` and `className` |
| `src/features/` | `React.memo` on root export; `useCallback` for all handlers |
| `src/shared/hooks/` | `useCallback`/`useMemo` on all returned values |

---

## Anti-Patterns to Avoid

- **No `React.memo` on a stable presentational component** → unnecessary re-renders.
- **Inline object/function props without memoization** → busts memo on children.
- **Type alias (`type Foo = {}`) instead of `interface`** → breaks the consistency of the codebase.
- **Default exports** → use named exports only.
- **Logic inside JSX** → extract to a `useMemo` or helper above the return.
- **Mixed concerns** → if a component fetches and renders, split into a container hook + presentational component.
