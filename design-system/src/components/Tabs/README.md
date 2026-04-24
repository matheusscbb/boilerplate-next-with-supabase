# Tabs

Componente composto controlado para abas. `Tabs` é a raiz (com `value` e `onChange`); `Tabs.List`, `Tabs.Trigger` e `Tabs.Panel` montam a estrutura.

## Props

### `Tabs`

| Prop         | Tipo                        | Padrão |
|--------------|-----------------------------|--------|
| `value`      | `string`                    | —      |
| `onChange`   | `(value: string) => void`   | —      |
| `aria-label` | `string`                    | —      |

### `Tabs.Trigger`

| Prop       | Tipo      | Padrão |
|------------|-----------|--------|
| `value`    | `string`  | —      |
| `disabled` | `boolean` | —      |

## Uso

```tsx
import { Tabs } from '@/design-system';

<Tabs value={tab} onChange={setTab} aria-label="Visualização">
  <Tabs.List>
    <Tabs.Trigger value="strength">Força</Tabs.Trigger>
    <Tabs.Trigger value="cardio">Cardio</Tabs.Trigger>
  </Tabs.List>

  <Tabs.Panel value="strength">...</Tabs.Panel>
  <Tabs.Panel value="cardio">...</Tabs.Panel>
</Tabs>
```
