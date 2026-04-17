# Button

Botão primitivo com variantes, tamanhos e estado de loading.

## Props

| Prop        | Tipo                                          | Padrão      |
|-------------|-----------------------------------------------|-------------|
| `variant`   | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` |
| `size`      | `'sm' \| 'md' \| 'lg'`                        | `'md'`      |
| `isLoading` | `boolean`                                     | `false`     |
| `fullWidth` | `boolean`                                     | `false`     |

Aceita todos os atributos nativos de `<button>`.

## Uso

```tsx
import { Button } from '@/design-system';

// Variantes
<Button variant="primary">Confirmar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="ghost">Saiba mais</Button>
<Button variant="danger">Excluir</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="md">Médio</Button>
<Button size="lg">Grande</Button>

// Loading
<Button isLoading>Salvando...</Button>

// Largura total
<Button fullWidth>Entrar</Button>

// Desabilitado
<Button disabled>Indisponível</Button>
```
