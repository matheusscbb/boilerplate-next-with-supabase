# Badge

Rótulo visual compacto para exibir status, categorias ou contagens.

## Props

| Prop      | Tipo                                                              | Padrão      |
|-----------|-------------------------------------------------------------------|-------------|
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` |
| `size`    | `'sm' \| 'md' \| 'lg'`                                           | `'md'`      |

Aceita todos os atributos nativos de `<span>`.

## Uso

```tsx
import { Badge } from '@/design-system';

// Variantes
<Badge variant="default">Rascunho</Badge>
<Badge variant="primary">Novo</Badge>
<Badge variant="success">Ativo</Badge>
<Badge variant="warning">Pendente</Badge>
<Badge variant="danger">Erro</Badge>
<Badge variant="info">Info</Badge>

// Tamanhos
<Badge size="sm">Pequeno</Badge>
<Badge size="md">Médio</Badge>
<Badge size="lg">Grande</Badge>

// Customização
<Badge variant="success" className="uppercase tracking-wide">Aprovado</Badge>
```
