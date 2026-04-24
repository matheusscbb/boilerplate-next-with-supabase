# Calendar

Calendário mensal controlado, sem dependências externas. Usa `Intl.DateTimeFormat` para rótulos do mês e semana conforme o `locale`. Datas são manipuladas como strings ISO `YYYY-MM-DD`, evitando problemas de timezone.

## Props

| Prop            | Tipo                                           | Padrão    |
|-----------------|------------------------------------------------|-----------|
| `selectedDate`  | `string` (ISO `YYYY-MM-DD`)                    | —         |
| `monthDate`     | `string` (ISO do 1º dia do mês visível)        | —         |
| `markers`       | `Record<string, CalendarDayMarker>`            | `{}`      |
| `today`         | `string`                                       | hoje      |
| `weekStartsOn`  | `0 \| 1`                                       | `0`       |
| `locale`        | `string`                                       | `'pt-BR'` |
| `onSelectDate`  | `(iso: string) => void`                        | —         |
| `onChangeMonth` | `(iso: string) => void`                        | —         |

### `CalendarDayMarker`

```ts
interface CalendarDayMarker {
  scheduled?: boolean; // ponto primário
  logged?: boolean;    // ponto verde
  label?: string;
}
```

## Uso

```tsx
import { Calendar } from '@/design-system';

<Calendar
  selectedDate={selected}
  monthDate={month}
  markers={{
    '2026-04-20': { scheduled: true, logged: true },
    '2026-04-22': { scheduled: true },
  }}
  onSelectDate={setSelected}
  onChangeMonth={setMonth}
/>
```
