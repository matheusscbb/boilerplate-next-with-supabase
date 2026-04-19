# Chip

Elemento interativo compacto para filtros, seleção múltipla ou tags removíveis.

## Sub-componentes

| Sub-componente | Descrição                                   |
|----------------|---------------------------------------------|
| `Chip`         | Contêiner principal                         |
| `Chip.Icon`    | Ícone opcional à esquerda do rótulo         |
| `Chip.Remove`  | Botão para remover/descartar o chip         |

## Props — `Chip`

| Prop       | Tipo                                                        | Padrão      |
|------------|-------------------------------------------------------------|-------------|
| `variant`  | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` |
| `size`     | `'sm' \| 'md'`                                              | `'md'`      |
| `selected` | `boolean`                                                   | `false`     |
| `disabled` | `boolean`                                                   | `false`     |

Aceita todos os atributos nativos de `<div>`.

## Props — `Chip.Remove`

Aceita todos os atributos nativos de `<button>`.

## Uso

```tsx
import { Chip } from '@/design-system';

// Simples
<Chip>React</Chip>

// Variantes
<Chip variant="primary">Destaque</Chip>
<Chip variant="success">Ativo</Chip>
<Chip variant="warning">Pendente</Chip>
<Chip variant="danger">Erro</Chip>

// Selecionado
<Chip variant="primary" selected>Selecionado</Chip>

// Com ícone e remoção
<Chip variant="primary">
  <Chip.Icon>
    <StarIcon className="size-3" />
  </Chip.Icon>
  Favorito
  <Chip.Remove onClick={() => handleRemove()} />
</Chip>

// Desabilitado
<Chip disabled>Indisponível</Chip>

// Tamanhos
<Chip size="sm">Pequeno</Chip>
<Chip size="md">Médio</Chip>
```
