# 🧡 Comitê de Cultura — LINKCE
### Plataforma de Acompanhamento e Desenvolvimento Cultural

---

## 📁 Estrutura do Projeto

```
comite-cultura/
├── index.html              ← Entrada da aplicação
├── assets/
│   ├── css/
│   │   └── main.css        ← Design tokens, tema dark/light, todos os estilos
│   └── js/
│       └── app.js          ← Controlador principal + roteador SPA
├── data/
│   └── data.js             ← Banco de perguntas, valores, encontros, cartilha
├── utils/
│   ├── storage.js          ← Toda a camada de persistência (LocalStorage)
│   └── utils.js            ← Funções auxiliares, toast, confirm, avatars
└── pages/
    ├── dashboard.js        ← Dashboard com gráficos e indicadores
    ├── afilhados.js        ← Lista de colaboradores + cadastro
    ├── colaborador.js      ← Perfil completo com tabs
    ├── reuniao.js          ← Modo Reunião (tela de foco)
    ├── radar.js            ← Radar Cultural (diferencial)
    └── pages.js            ← Valores, Cartilha, Agenda, Reuniões,
                               Evolução, Relatórios, Configurações
```

---

## 🚀 Deploy no GitHub Pages

1. Faça upload de todos os arquivos para um repositório público
2. Em **Settings → Pages**, selecione a branch `main` e pasta `/` (root)
3. Acesse via `https://seuusuario.github.io/nome-do-repo/`

> ✅ Nenhuma configuração de servidor necessária — 100% client-side

---

## ✨ Funcionalidades

### Dashboard
- Cards de indicadores (colaboradores, reuniões, etapas)
- Gráfico de barras: reuniões por mês (Chart.js)
- Gráfico horizontal: valores mais percebidos
- Timeline de atividade recente
- Card de próximo acompanhamento com botão de ação rápida

### Meus Afilhados
- Grid de cards com busca e filtros por etapa
- Progresso visual do ciclo (1º, 30, 60, 90 dias)
- Avatares com cores automáticas

### Cadastro de Colaborador
- Upload de foto (base64, max 2MB)
- Campos completos: nome, email, cargo, equipe, gestor, cidade, telefone, admissão
- Data de admissão define automaticamente as etapas

### Perfil do Colaborador
- Header com progresso do ciclo de acompanhamento
- Tabs: Histórico · Indicadores · Radar Cultural · Diário
- Gráfico de evolução de indicadores (Chart.js linha)
- Gráfico Radar por encontro

### 🎯 Modo Reunião (Foco)
- Tela limpa sem distrações
- Uma pergunta por vez com animação
- Banco de perguntas por categoria (13 categorias, 50+ perguntas)
- Barra de progresso + cronômetro
- Avaliação por estrelas (indicadores)
- **Radar de Valores** — marcar intensidade de cada valor
- Diário de Evolução (observações, pontos positivos/atenção, próximos passos)
- Geração automática de **Insight** ao final
- Salvamento automático ao concluir + rascunho parcial

### 🎯 Radar Cultural (Diferencial)
- Gráfico radar (Chart.js) mostrando evolução em 5 valores
- Modos: Todos os encontros / Comparar (1º vs último) / Último
- Scores por valor com mini evolução visual
- Cálculo de delta (evolução entre encontros)
- Tabela comparativa completa
- Exportação PDF

### Valores da Cultura
- 5 valores: Foco no Cliente, Ética, Entrega Extraordinária, Simplicidade, Autorresponsabilidade
- Menu lateral de navegação
- Descrição, Objetivo, Exemplos, Boas Práticas, Como Identificar, Casos Práticos

### Cartilha Digital
- 6 seções: Quem Somos, Nossa Cultura, Como Trabalhamos, Primeiro Mês, Comportamentos, Crescimento
- Blocos dinâmicos: destaques, cards, fluxos, timelines, listas, dois-colunas
- Navegação lateral + anterior/próximo

### Agenda
- Reuniões atrasadas (alerta vermelho)
- Próximos encontros com contagem regressiva em dias
- Últimas reuniões realizadas

### Relatórios
- Geração de PDF individual (jsPDF) com dados completos
- Exportar todos os dados em JSON
- Importar backup JSON

### Configurações
- Toggle dark/light theme
- Edição de nome e cargo do usuário
- Contadores de dados
- Limpar sistema (com confirmação)

---

## 🎨 Design System

- **Fonte:** Inter (Google Fonts)
- **Ícones:** Lucide Icons
- **Gráficos:** Chart.js 4
- **PDF:** jsPDF
- **Tema:** Dark (padrão) + Light
- **Glassmorphism** leve nos modais
- **Animações:** fade-in nas páginas, pulse nos dots da timeline
- **Toast notifications** para feedback
- **Modal de confirmação** para ações destrutivas
- **Responsivo:** Desktop → Tablet → Mobile com sidebar deslizante

---

## 💾 Armazenamento

Todos os dados ficam no `localStorage` do navegador:
- `linkce_colaboradores` — Array de colaboradores
- `linkce_reunioes` — Array de reuniões
- `linkce_agenda` — Array de eventos
- `linkce_config` — Configurações do usuário
- `linkce_draft` — Rascunho de reunião em andamento

---

## 🔑 Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + Enter` | Avançar pergunta no Modo Reunião |
| `Escape` | Fechar modal aberto |

---

## 📦 Dependências (CDN)

```html
<!-- Todos carregados via CDN, sem npm/node necessário -->
lucide@latest          → Ícones
chart.js@4.4.0         → Gráficos
jspdf@2.5.1            → Geração de PDF
```

---

*Desenvolvido para o Comitê de Cultura LINKCE · 2025*
