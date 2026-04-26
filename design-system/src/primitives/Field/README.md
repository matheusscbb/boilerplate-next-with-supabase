# Field

Form field shell with consistent spacing for label, input slot, and helper / error text.

```tsx
import { Field, Input } from '@/design-system';

<Field label="Nome" hint="Como você quer ser chamado" htmlFor="full-name">
  <Input id="full-name" />
</Field>

<Field label="E-mail" error="Endereço inválido" required htmlFor="email">
  <Input id="email" type="email" error="invalid" />
</Field>
```

## Props

| Prop       | Type                | Description                                                   |
| ---------- | ------------------- | ------------------------------------------------------------- |
| `label`    | `ReactNode`         | Visual label above the input.                                 |
| `hint`     | `ReactNode`         | Optional helper text shown when there is no `error`.          |
| `error`    | `ReactNode`         | Destructive-coloured error text shown instead of `hint`.      |
| `required` | `boolean`           | Renders a destructive asterisk after the label.               |
| `htmlFor`  | `string`            | Wired to the input `id` for accessibility.                    |
| `children` | `ReactNode`         | Required: the actual input (Input, Select, NumberStepper, …). |
