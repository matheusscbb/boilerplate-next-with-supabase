# Checkbox

Campo de seleção booleana com label integrada e suporte a estado de erro.

## Props

| Prop        | Tipo                    | Padrão |
|-------------|-------------------------|--------|
| `label`     | `string`                | —      |
| `error`     | `string`                | —      |
| `size`      | `'sm' \| 'md' \| 'lg'` | `'md'` |

Aceita todos os atributos nativos de `<input>` (exceto `type` e `size` nativo).

## Uso

```tsx
import { Checkbox } from '@/design-system';

// Básico
<Checkbox label="Aceito os termos de uso" />

// Marcado por padrão
<Checkbox label="Lembrar de mim" defaultChecked />

// Com erro
<Checkbox
  id="terms"
  label="Aceito os termos"
  error="Você precisa aceitar os termos para continuar"
/>

// Desabilitado
<Checkbox label="Opção indisponível" disabled />

// Tamanhos
<Checkbox size="sm" label="Pequeno" />
<Checkbox size="md" label="Médio" />
<Checkbox size="lg" label="Grande" />

// Controlado
import { useState } from 'react';

const [checked, setChecked] = useState(false);
<Checkbox
  label="Receber notificações"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>
```
