# Saitama

Estrutura base para projetos Next.js com Supabase, design system e sistema de temas.

## Estrutura do Projeto

```
saitama/
├── src/
│   ├── app/              # Next.js App Router
│   ├── core/              # Regras de negócio e abstrações (SOLID)
│   │   ├── contracts/     # Interfaces
│   │   └── domain/        # Tipos e entidades
│   ├── shared/            # Hooks, utils, constantes
│   ├── features/          # Features por domínio
│   ├── providers/         # React Providers
│   └── lib/supabase/      # Clientes Supabase (client, server, middleware)
├── themes/                # Sistema de tema portátil
├── design-system/         # Componentes base (Button, Input, Card, etc.)
├── middleware.ts          # Refresh de sessão Supabase
└── .env.example
```

## Setup

1. **Instalar dependências**

```bash
npm install
```

2. **Configurar variáveis de ambiente**

Copie `.env.example` para `.env.local` e preencha com suas credenciais Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

As credenciais estão em: Supabase Dashboard > Project Settings > API.

3. **Rodar em desenvolvimento**

```bash
npm run dev
```

4. **Build para produção**

```bash
npm run build
npm start
```

## Deploy na Vercel

1. Conecte o repositório à Vercel
2. Adicione as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Deploy automático a cada push

## Rotas

- `/` - Página inicial
- `/login` - Página de login

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (Auth, SSR)

## Temas

O sistema de temas em `themes/` é portátil. Para customizar por cliente:

1. Crie um novo preset em `themes/src/presets/`
2. Passe `config={{ overrides: { ... } }}` no `ThemeProvider`
