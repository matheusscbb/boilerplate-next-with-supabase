# List

Lista estilizada com suporte a variantes não-ordenada, ordenada e sem marcador.

## Componentes

| Componente | Descrição              |
|------------|------------------------|
| `List`     | Contêiner da lista     |
| `ListItem` | Item individual        |

## Props — List

| Prop      | Tipo                                    | Padrão        |
|-----------|-----------------------------------------|---------------|
| `variant` | `'unordered' \| 'ordered' \| 'none'`   | `'unordered'` |

Ambos aceitam todos os atributos nativos de `<ul>`/`<li>`.

## Uso

```tsx
import { List } from '@/design-system';

// Não-ordenada (padrão)
<List>
  <List.Item>Primeiro item</List.Item>
  <List.Item>Segundo item</List.Item>
  <List.Item>Terceiro item</List.Item>
</List>

// Ordenada
<List variant="ordered">
  <List.Item>Passo um</List.Item>
  <List.Item>Passo dois</List.Item>
  <List.Item>Passo três</List.Item>
</List>

// Sem marcador (para menus, cards de feature, etc.)
<List variant="none">
  <List.Item>Item sem bullet</List.Item>
  <List.Item>Outro item limpo</List.Item>
</List>
```
