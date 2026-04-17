# Input

Campo de texto primitivo com suporte a estado de erro.

## Props

| Prop    | Tipo      | Padrão |
|---------|-----------|--------|
| `error` | `string`  | —      |

Aceita todos os atributos nativos de `<input>`.

## Uso

```tsx
import { Input } from '@/design-system';

// Básico
<Input placeholder="Digite seu e-mail" type="email" />

// Com erro
<Input
  placeholder="Digite sua senha"
  type="password"
  error="Senha inválida"
/>

// Desabilitado
<Input placeholder="Somente leitura" disabled />

// Com ref
import { useRef } from 'react';

const ref = useRef<HTMLInputElement>(null);
<Input ref={ref} placeholder="Com ref" />
```
