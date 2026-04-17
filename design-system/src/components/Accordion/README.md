# Accordion

Componente de acordeão expansível com controle de estado interno.

## Sub-componentes

| Sub-componente   | Descrição                           |
|------------------|-------------------------------------|
| `Accordion`      | Contêiner com divisores entre itens |
| `Accordion.Item` | Item individual expansível          |

## Props — Accordion.Item

| Prop          | Tipo      | Padrão  |
|---------------|-----------|---------|
| `title`       | `string`  | —       |
| `defaultOpen` | `boolean` | `false` |
| `className`   | `string`  | —       |

## Uso

```tsx
import { Accordion } from '@/design-system';

// Básico
<Accordion>
  <Accordion.Item title="O que é este produto?">
    <p>Este produto é uma solução completa para...</p>
  </Accordion.Item>
  <Accordion.Item title="Como faço para começar?">
    <p>Basta criar uma conta e seguir o wizard de configuração.</p>
  </Accordion.Item>
  <Accordion.Item title="Tem suporte disponível?">
    <p>Sim, nosso suporte funciona 24/7.</p>
  </Accordion.Item>
</Accordion>

// Item aberto por padrão
<Accordion>
  <Accordion.Item title="Perguntas frequentes" defaultOpen>
    <p>Conteúdo visível ao carregar a página.</p>
  </Accordion.Item>
</Accordion>
```
