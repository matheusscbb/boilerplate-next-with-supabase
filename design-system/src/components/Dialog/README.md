# Dialog

Modal leve e acessível, sem dependências externas. Usa composição: `Dialog` + `Dialog.Header`, `Dialog.Body`, `Dialog.Footer`. Fecha com Esc, clique fora ou chamada explícita a `onOpenChange(false)`.

## Props

### `Dialog`

| Prop                  | Tipo                          | Padrão |
|-----------------------|-------------------------------|--------|
| `open`                | `boolean`                     | —      |
| `onOpenChange`        | `(open: boolean) => void`     | —      |
| `size`                | `'sm' \| 'md' \| 'lg'`        | `'md'` |
| `closeOnOverlayClick` | `boolean`                     | `true` |
| `closeOnEscape`       | `boolean`                     | `true` |

## Uso

```tsx
import { Dialog, Button } from '@/design-system';

<Dialog open={open} onOpenChange={setOpen} aria-labelledby="dlg-title">
  <Dialog.Header>
    <h2 id="dlg-title">Adicionar série</h2>
  </Dialog.Header>
  <Dialog.Body>
    {/* conteúdo */}
  </Dialog.Body>
  <Dialog.Footer>
    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
    <Button onClick={onConfirm}>Salvar</Button>
  </Dialog.Footer>
</Dialog>
```
