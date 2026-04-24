# NumberStepper

Campo numérico com botões de incremento/decremento otimizado para mobile (`inputMode` nativo evita o teclado alfanumérico). Útil para reps, peso, tempo, séries etc.

## Props

| Prop          | Tipo                         | Padrão      |
|---------------|------------------------------|-------------|
| `value`       | `number \| null`             | —           |
| `onChange`    | `(value: number \| null) => void` | —      |
| `min`         | `number`                     | `undefined` |
| `max`         | `number`                     | `undefined` |
| `step`        | `number`                     | `1`         |
| `precision`   | `number`                     | `0`         |
| `placeholder` | `string`                     | `''`        |
| `suffix`      | `string`                     | `undefined` |
| `size`        | `'sm' \| 'md'`               | `'md'`      |
| `disabled`    | `boolean`                    | `false`     |
| `readOnly`    | `boolean`                    | `false`     |
| `error`       | `string`                     | `undefined` |

`value` é `null` quando o campo está vazio. `precision = 2` para peso (ex.: `62.5 kg`), `0` para reps.

## Uso

```tsx
import { NumberStepper } from '@/design-system';

// Reps (inteiro)
<NumberStepper value={reps} onChange={setReps} min={0} max={999} suffix="reps" />

// Peso (decimal)
<NumberStepper
  value={weight}
  onChange={setWeight}
  min={0}
  max={999}
  step={2.5}
  precision={2}
  suffix="kg"
/>

// Somente leitura
<NumberStepper value={42} onChange={() => {}} readOnly />
```
