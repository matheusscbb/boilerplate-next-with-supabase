# Boilerplate Next.js + Supabase

Boilerplate de produção com Next.js, Supabase, sistema de temas portátil e design system — pronto para deploy na Vercel.

> Esta é a branch **`boilerplate`**: serve como base limpa para novos projetos. Mantenha-a atualizada com melhorias de infraestrutura, novos componentes do design system e correções gerais. Para iniciar um projeto novo, branch a partir desta (`git checkout -b project/<nome> boilerplate`).

## Stack

- **Next.js 16** — App Router, Server Components, Server Actions
- **TypeScript 5**
- **Tailwind CSS v4** (variant `dark` baseada em classe)
- **Supabase** — Auth SSR com `@supabase/ssr`
- **pnpm** — gerenciador de pacotes

---

## Estrutura do Projeto

```
.
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, Register
│   │   ├── layout.tsx          # Root layout + ThemeProvider script anti-flash
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # @theme inline + cursor defaults + transições
│   ├── core/
│   │   ├── contracts/          # IAuthRepository (interface)
│   │   └── domain/             # Re-exports dos tipos User/Session do Supabase
│   ├── features/
│   │   └── auth/               # LoginForm, RegisterForm, LogoutButton
│   ├── infra/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # createBrowserClient
│   │   │   ├── server.ts                 # createServerClient (SSR)
│   │   │   ├── middleware.ts             # updateSession + redirect login
│   │   │   └── SupabaseAuthRepository.ts # Implementação concreta de IAuthRepository
│   │   ├── http/               # HttpService + adapters (axios, mock)
│   │   ├── i18n/               # getTranslation
│   │   └── context/            # createContextFactory
│   ├── providers/              # ThemeProvider + SupabaseProvider
│   ├── shared/
│   │   ├── hooks/              # useUser, useSupabaseClient
│   │   ├── utils/              # cn() e utilitários
│   │   └── constants/
│   └── hooks/                  # Hooks utilitários (useDidMountAndUpdate)
├── themes/                     # Sistema de tema portátil
│   └── src/
│       ├── tokens/types.ts     # ThemeTokens, ColorPalette, TypographyScale
│       ├── presets/default.ts  # Preset light (única fonte de verdade)
│       ├── presets/dark.ts     # Preset dark
│       └── ThemeProvider.tsx   # Injeta tokens como CSS vars no :root
├── design-system/              # Componentes que consomem o tema
│   └── src/
│       ├── primitives/         # Button, Input, Checkbox, Field, Switch,
│       │                       # Textarea, Select, Badge, NumberStepper
│       ├── components/         # Card, Accordion, List, Table, Tabs,
│       │                       # Dialog, Calendar, Chip, Header, ThemeToggle
│       └── layout/             # Stack
├── supabase/migrations/        # (vazio) adicionar migrations do projeto
├── middleware.ts               # Next.js middleware que delega para infra/supabase
└── .env.example
```

---

## Setup

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com suas credenciais do Supabase:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Credenciais em: **Supabase Dashboard → Project Settings → API**.

### 3. Rodar em desenvolvimento

```bash
pnpm dev
```

### 4. Build de produção

```bash
pnpm build
pnpm start
```

---

## Deploy na Vercel

1. Conecte o repositório à Vercel
2. Adicione as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
3. Deploy automático a cada push

---

## Sistema de Temas

A pasta `themes/` é independente e pode ser extraída como pacote npm ou workspace.

O arquivo `themes/src/presets/default.ts` é a **única fonte de verdade** dos tokens light. O `ThemeProvider` injeta `:root { ... }` e `.dark { ... }` como CSS variables via `<style>`. O script inline em `src/app/layout.tsx` aplica a classe `dark` antes da hidratação para evitar flash.

### Estrutura dos tokens

| Grupo | Sub-chaves |
|-------|-----------|
| `colors.brand` | `primary`, `secondary` |
| `colors.background` | `primary`, `secondary` |
| `colors.foreground` | `primary`, `secondary` |
| `colors.text` | `main`, `secondary` |
| `colors.border` | `default`, `ring` |
| `colors.status` | `warning`, `info`, `error`, `success`, `destructive`, `destructiveForeground` |
| `colors.commons` | `white`, `black`, `accent`, `muted`, `mutedForeground` |
| `typography.family` | `sans`, `mono`, `heading` |
| `typography.size` | `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl` |
| `typography.weight` | `normal`, `medium`, `semibold`, `bold` |
| `typography.lineHeight` | `tight`, `normal`, `relaxed` |

### Customizar por cliente

```tsx
<ThemeProvider config={{
  overrides: {
    colors: {
      brand: { primary: '#e11d48' }
    },
    typography: {
      family: { sans: 'Inter, sans-serif' }
    }
  }
}}>
```

---

## Design System

Componentes em `design-system/src/` que consomem os tokens via CSS variables.

### Primitives

| Componente | Notas |
|-----------|-------|
| `Button` | `primary`, `secondary`, `ghost`, `danger` · `sm`, `md`, `lg` · `isLoading`, `fullWidth` |
| `Input` | `error` |
| `Checkbox` | `label`, `error` · `sm`, `md`, `lg` |
| `Textarea` | `error`, `rows` |
| `Select` | Wrapper acessível em volta de `<select>` nativo |
| `Switch` | Toggle ARIA |
| `Field` | Wrapper com label + error |
| `Badge` | Indicador estático |
| `NumberStepper` | Input numérico com botões `+`/`-` |

### Components

| Componente | Notas |
|-----------|-------|
| `Card` | Compound: `Card.Header`, `Card.Content`, `Card.Footer` |
| `Accordion` | Compound: `Accordion.Item` · `title`, `defaultOpen` |
| `List` | Compound: `List.Item` · variantes unordered/ordered/none |
| `Table` | Compound: `Table.Head`, `Table.Body`, `Table.Row`, `Table.Header`, `Table.Cell` |
| `Tabs` | Compound: `Tabs.List`, `Tabs.Trigger`, `Tabs.Content` |
| `Dialog` | Modal acessível com `Dialog.Trigger`, `Dialog.Content` |
| `Calendar` | Calendário mês a mês com seleção e marcadores |
| `Chip` | Tag/etiqueta clicável |
| `Header` | Cabeçalho composto com slots |
| `ThemeToggle` | Botão com modo light/dark/system |

### Layout

| Componente | Notas |
|-----------|-------|
| `Stack` | `direction` (vertical/horizontal) · `gap` (sm/md/lg) |

```tsx
import { Button, Input, Card, Stack } from '@/design-system';

<Card>
  <Card.Header>Título</Card.Header>
  <Card.Content>Conteúdo principal</Card.Content>
  <Card.Footer>
    <Button>Confirmar</Button>
  </Card.Footer>
</Card>
```

---

## Arquitetura (SOLID)

| Princípio | Onde |
|-----------|------|
| **S**ingle Responsibility | Cada feature em sua pasta; componentes com 1 propósito |
| **O**pen/Closed | Tema extensível via `overrides` sem alterar o preset base |
| **L**iskov Substitution | `core/contracts/` com interfaces que abstraem implementações |
| **I**nterface Segregation | Interfaces pequenas e específicas por domínio |
| **D**ependency Inversion | Features dependem de abstrações (`IAuthRepository`), não do Supabase diretamente |

---

## Rotas incluídas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/login` | Formulário de login |
| `/register` | Formulário de cadastro (nome + email + senha) |

O middleware redireciona usuários autenticados para fora de `/login` e `/register`, e usuários não autenticados para `/login` quando tentam acessar rotas protegidas.

---

## Workflow

```bash
# Iniciar um novo projeto a partir do boilerplate
git checkout boilerplate
git pull
git checkout -b project/<nome>

# Atualizar o boilerplate com melhorias gerais
git checkout boilerplate
# faça as melhorias
git commit -m "feat: ..."
git push
```
