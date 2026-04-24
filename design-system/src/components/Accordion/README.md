# Accordion

Compound component de acordeão com animação suave via `grid-template-rows`, acessibilidade completa (aria-expanded/controls/labelledby) e suporte a single/multiple open.

## Sub-componentes

| Sub-componente        | Papel                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| `Accordion`           | Raiz; gerencia estado dos itens abertos (single ou multiple)          |
| `Accordion.Item`      | Item individual; fornece contexto e `data-state="open \| closed"`     |
| `Accordion.Header`    | Wrapper semântico do cabeçalho (qualquer children, inclui inputs)     |
| `Accordion.Trigger`   | Botão que alterna o item; pode envolver apenas um ícone ou tudo       |
| `Accordion.Content`   | Painel animado que expande/recolhe com transição CSS                  |

## Props — `Accordion` (root)

### Modo single (padrão)

| Prop            | Tipo                                  | Padrão     |
|-----------------|---------------------------------------|------------|
| `type`          | `'single'`                            | `'single'` |
| `collapsible`   | `boolean`                             | `true`     |
| `value`         | `string \| null`                      | —          |
| `defaultValue`  | `string \| null`                      | —          |
| `onValueChange` | `(value: string \| null) => void`     | —          |
| `unstyled`      | `boolean`                             | `false`    |

### Modo multiple

| Prop            | Tipo                          | Padrão |
|-----------------|-------------------------------|--------|
| `type`          | `'multiple'`                  | —      |
| `value`         | `string[]`                    | —      |
| `defaultValue`  | `string[]`                    | —      |
| `onValueChange` | `(value: string[]) => void`   | —      |
| `unstyled`      | `boolean`                     | `false`|

> `unstyled` remove a borda/divisores do contêiner — útil quando cada item já é um card (ex.: lista com drag-and-drop).

## Props — `Accordion.Item`

| Prop       | Tipo      | Padrão  |
|------------|-----------|---------|
| `value`    | `string`  | — (obrigatório) |
| `disabled` | `boolean` | `false` |

## Props — `Accordion.Content`

| Prop             | Tipo      | Padrão  |
|------------------|-----------|---------|
| `unmountOnClose` | `boolean` | `false` |

> Por padrão o conteúdo permanece montado quando fechado (preserva estado de formulários). Passe `unmountOnClose` quando o conteúdo é pesado.

## Estilização via `data-state`

Todos os sub-componentes expõem `data-state="open" | "closed"`, permitindo estilizar via Tailwind:

```tsx
<Accordion.Trigger className="data-[state=open]:text-primary">
  <ChevronIcon className="data-[state=open]:rotate-180 transition-transform" />
</Accordion.Trigger>
```

## Uso básico (FAQ)

```tsx
import { Accordion } from '@/design-system';

<Accordion defaultValue="item-1">
  <Accordion.Item value="item-1">
    <Accordion.Header className="flex items-center justify-between px-4 py-3">
      <span className="font-medium">O que é este produto?</span>
      <Accordion.Trigger aria-label="Expandir" className="h-8 w-8 rounded-md hover:bg-muted">
        <ChevronIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      <p className="px-4 pb-4">Uma solução completa para...</p>
    </Accordion.Content>
  </Accordion.Item>

  <Accordion.Item value="item-2">
    {/* ... */}
  </Accordion.Item>
</Accordion>
```

## Uso avançado — header com inputs e múltiplos botões

Como `Accordion.Header` é um `<div>` (sem `<button>` por fora), é seguro colocar `<input>`, outros `<button>` e ícones dentro dele. O `Accordion.Trigger` fica apenas em volta da área de toggle:

```tsx
<Accordion type="multiple" unstyled>
  <Accordion.Item value={day.id}>
    <Accordion.Header className="flex items-center gap-2 px-3 py-2">
      <GripHandle />
      <Input value={day.name} onChange={...} />
      <button type="button" onClick={removeDay}>Remover</button>
      <Accordion.Trigger aria-label="Expandir" className="h-8 w-8 rounded-md hover:bg-muted">
        <ChevronIcon className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content className="border-t border-border">
      <div className="p-4">{/* ...exercícios... */}</div>
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

## Controlado

```tsx
const [openValue, setOpenValue] = useState<string | null>('a');

<Accordion value={openValue} onValueChange={setOpenValue}>
  <Accordion.Item value="a">{/* ... */}</Accordion.Item>
  <Accordion.Item value="b">{/* ... */}</Accordion.Item>
</Accordion>
```
