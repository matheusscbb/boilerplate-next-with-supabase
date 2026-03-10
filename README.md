# Boilerplate Next.js + Supabase

Boilerplate de produção com Next.js, Supabase, sistema de temas portátil e design system — pronto para deploy na Vercel.

## Stack

- **Next.js 16** — App Router, Server Components, Server Actions
- **TypeScript 5**
- **Tailwind CSS v4**
- **Supabase** — Auth SSR com `@supabase/ssr`
- **pnpm** — gerenciador de pacotes

---

## Estrutura do Projeto

```
.
├── src/
│   ├── app/                    # Next.js App Router (rotas, layout, globals.css)
│   ├── core/
│   │   ├── contracts/          # Interfaces (IAuthRepository, etc.)
│   │   └── domain/             # Tipos e entidades base
│   ├── features/               # Features por domínio (auth, dashboard, etc.)
│   ├── providers/              # React Providers (ThemeProvider, SupabaseProvider)
│   ├── shared/
│   │   ├── hooks/              # useUser, useSupabaseClient
│   │   ├── utils/              # cn() e utilitários gerais
│   │   └── constants/
│   └── lib/
│       └── supabase/
│           ├── client.ts       # createBrowserClient — Client Components
│           ├── server.ts       # createServerClient — Server Components / Actions
│           └── middleware.ts   # updateSession — refresh de tokens
├── themes/                     # Sistema de tema portátil e independente
│   └── src/
│       ├── tokens/types.ts     # Interfaces ThemeTokens, ColorPalette, TypographyScale
│       ├── presets/default.ts  # Preset padrão (única fonte de verdade dos tokens)
│       └── ThemeProvider.tsx   # Injeta tokens como CSS vars no :root via <style>
├── design-system/              # Componentes base que consomem o tema
│   └── src/
│       ├── primitives/         # Button, Input
│       ├── components/         # Card
│       └── layout/             # Stack
├── middleware.ts               # Next.js middleware — refresh de sessão Supabase
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
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
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
2. Adicione as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Deploy automático a cada push na `main`

---

## Sistema de Temas

A pasta `themes/` é independente e pode ser extraída como pacote npm ou workspace.

O arquivo `themes/src/presets/default.ts` é a **única fonte de verdade** para os tokens. O `ThemeProvider` injeta os valores como CSS variables no `:root` via `<style>` tag — funciona no SSR sem flash.

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
// Sobrescrever tokens específicos — o restante herda do preset padrão
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

Componentes base em `design-system/src/` que consomem os tokens do tema via CSS variables.

| Componente | Variants / Props |
|-----------|-----------------|
| `Button` | `primary`, `secondary`, `ghost`, `danger` · `sm`, `md`, `lg` · `isLoading`, `fullWidth` |
| `Input` | `error` |
| `Card` | `CardHeader`, `CardContent`, `CardFooter` |
| `Stack` | `direction` (vertical/horizontal) · `gap` (sm/md/lg) |

```tsx
import { Button, Input, Card, CardHeader, CardContent, CardFooter, Stack } from '@/design-system';
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

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/login` | Formulário de login |
