# Textarea

Campo de texto multilinha para observações, descrições e notas longas. Segue o mesmo estilo visual do `Input`.

## Props

| Prop     | Tipo                                              | Padrão       |
|----------|---------------------------------------------------|--------------|
| `error`  | `string`                                          | `undefined`  |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'`  | `'vertical'` |
| `rows`   | `number`                                          | `3`          |

Aceita todos os atributos nativos de `<textarea>`.

## Uso

```tsx
import { Textarea } from '@/design-system';

<Textarea
  placeholder="Observações do treino..."
  rows={4}
  defaultValue={observation}
  onChange={(e) => setObservation(e.target.value)}
/>

<Textarea error="Campo obrigatório" resize="none" />
```
