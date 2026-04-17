# Stack

Layout primitivo para empilhar elementos vertical ou horizontalmente com espaçamento consistente.

## Props

| Prop        | Tipo                          | Padrão       |
|-------------|-------------------------------|--------------|
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` |
| `gap`       | `'sm' \| 'md' \| 'lg'`       | `'md'`       |

Aceita todos os atributos nativos de `<div>`.

## Uso

```tsx
import { Stack, Button } from '@/design-system';

// Vertical (padrão) — formulários, seções
<Stack>
  <Input placeholder="Nome" />
  <Input placeholder="E-mail" />
  <Button>Enviar</Button>
</Stack>

// Horizontal — toolbars, grupos de botões
<Stack direction="horizontal" gap="sm">
  <Button variant="ghost">Cancelar</Button>
  <Button variant="primary">Salvar</Button>
</Stack>

// Espaçamentos
<Stack gap="sm">...</Stack>  {/* gap-2 */}
<Stack gap="md">...</Stack>  {/* gap-4 */}
<Stack gap="lg">...</Stack>  {/* gap-6 */}
```
