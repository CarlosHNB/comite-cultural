# 🚀 Comitê de Cultura LINKCE — Guia de Instalação

Projeto já integrado com **Supabase** (banco de dados na nuvem + autenticação).
Pronto para uso — basta executar o SQL e publicar.

---

## ① Configurar o banco de dados (uma única vez)

1. Acesse o painel do seu projeto Supabase: https://supabase.com/dashboard
2. Vá em **SQL Editor** (menu lateral)
3. Clique em **New query**
4. Abra o arquivo **`SUPABASE_SETUP.sql`** (está na raiz deste projeto)
5. Copie **todo o conteúdo** e cole no editor
6. Clique em **Run** (ou `Ctrl+Enter`)

Isso vai criar:
- ✅ Tabela de **perfis** (padrinhos/madrinhas)
- ✅ Tabela de **colaboradores** (afilhados)
- ✅ Tabela de **reuniões** (encontros)
- ✅ Tabela de **perguntas** (banco personalizado)
- ✅ Tabela de **categorias de perguntas**
- ✅ **Row Level Security** — cada padrinho só vê os próprios dados
- ✅ **Trigger automático** — ao criar conta, já cria o perfil

---

## ② Configurar autenticação por e-mail

No painel do Supabase:

1. Vá em **Authentication → Providers**
2. Confirme que **Email** está habilitado (vem habilitado por padrão)
3. Vá em **Authentication → URL Configuration**
4. Em **Site URL**, coloque a URL onde você vai publicar (ex: `https://seuusuario.github.io/comite-cultura`)
5. Em **Redirect URLs**, adicione a mesma URL

> 💡 Por padrão, o Supabase exige confirmação de e-mail no cadastro.
> Se quiser desabilitar (recomendado para testes internos), vá em
> **Authentication → Providers → Email** e desmarque **"Confirm email"**.

---

## ③ Publicar no GitHub Pages

1. Suba todos os arquivos deste projeto para um repositório GitHub
2. Vá em **Settings → Pages**
3. Em **Source**, selecione a branch `main` e pasta `/ (root)`
4. Aguarde alguns minutos — sua URL será algo como `https://seuusuario.github.io/nome-repo/`

---

## ④ Primeiro acesso

1. Acesse a URL publicada
2. Clique em **Criar Conta**
3. Preencha nome, cargo, e-mail e senha
4. Se a confirmação de e-mail estiver ativa, confira sua caixa de entrada
5. Faça login — pronto, sua conta está conectada à nuvem!

---

## 🔑 Credenciais já configuradas

As credenciais do Supabase já estão embutidas em `utils/supabase.js`:

```javascript
const SUPABASE_URL = 'https://ggjvgeqckexoygaryxkg.supabase.co';
const SUPABASE_KEY = 'eyJhbGci...' // anon key (pública, segura para uso no frontend)
```

> A **anon key** é uma chave pública por design — ela não dá acesso direto aos dados,
> pois o **Row Level Security (RLS)** garante que cada usuário só acesse seus próprios registros.

---

## 👥 Múltiplos padrinhos usando ao mesmo tempo

Cada pessoa que criar conta:
- Terá seu **próprio banco de afilhados** (não compartilhado com outros padrinhos)
- Terá seu **próprio banco de perguntas personalizado**
- Pode configurar **frequência de acompanhamento individual** por afilhado

Se no futuro quiser que **todos os padrinhos vejam os mesmos afilhados** (banco compartilhado da empresa),
me avise — é uma mudança simples na política de RLS (`using (true)` em vez de `using (auth.uid() = user_id)`).

---

## 🛠️ Estrutura do projeto

```
comite-cultura/
├── index.html                  ← Entrada (já com Supabase SDK)
├── SUPABASE_SETUP.sql          ← Execute isso no Supabase primeiro!
├── assets/
│   ├── css/main.css
│   └── js/app.js               ← Roteador + boot com autenticação
├── data/data.js                ← Cartilha, valores, chaves LINKCE
├── utils/
│   ├── supabase.js             ← Cliente Supabase + Auth + DB (camada principal)
│   ├── storage.js              ← Fallback local (não usado em produção)
│   └── utils.js
└── pages/
    ├── auth.js                 ← Login e Cadastro
    ├── dashboard.js
    ├── afilhados.js
    ├── colaborador.js
    ├── reuniao.js               ← Modo Reunião
    ├── radar.js                 ← Radar Cultural
    ├── perguntas.js             ← Banco de perguntas dinâmico
    └── pages.js                 ← Valores, Cartilha, Agenda, Relatórios, Config
```

---

## ❓ Problemas comuns

**"Erro ao carregar" na tela após login**
→ Confirme que rodou o `SUPABASE_SETUP.sql` completo no SQL Editor.

**Não recebo e-mail de confirmação**
→ Verifique spam, ou desabilite a confirmação em Authentication → Providers → Email.

**"Usuário não autenticado" em alguma ação**
→ A sessão pode ter expirado. Saia e faça login novamente.

**Quero resetar tudo e testar do zero**
→ No Supabase, vá em **Authentication → Users**, delete o usuário de teste.
   As tabelas relacionadas serão limpas automaticamente (cascade delete).
