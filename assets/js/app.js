// ============================================================
// APP.JS — Controlador principal + roteador SPA
// Comitê de Cultura - LINKCE · Com Supabase Auth
// ============================================================

const App = {
  currentPage: null,
  currentParams: {},

  // ── Inicialização ─────────────────────────────────────────
  async init() {
    // Aplicar tema salvo localmente enquanto carrega
    const temaSalvo = localStorage.getItem('linkce_tema') || 'dark';
    document.documentElement.setAttribute('data-theme', temaSalvo);

    // Renderizar loading
    document.getElementById('app').innerHTML = `
      <div class="loading-screen" id="loading-screen">
        <div class="loading-logo"><i data-lucide="heart-handshake"></i></div>
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:18px;font-weight:800;color:var(--text-primary);">Comitê de Cultura</div>
          <div style="font-size:13px;color:var(--text-tertiary);margin-top:4px;">LINKCE · Plataforma de Acompanhamento</div>
        </div>
        <div class="loading-spinner"></div>
      </div>
      <div id="toast-container"></div>
    `;
    if (window.lucide) lucide.createIcons();

    // Escutar mudanças de auth (login/logout)
    Auth.onStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this._bootApp(session);
      } else if (event === 'SIGNED_OUT') {
        this._showLogin();
      }
    });

    // Verificar sessão existente
    const session = await Auth.getSession();
    if (session) {
      await this._bootApp(session);
    } else {
      this._showLogin();
    }
  },

  // ── Boot após autenticação ────────────────────────────────
  async _bootApp(session) {
    // Carregar config do perfil para aplicar tema
    try {
      const config = await DB.Config.get();
      const tema = config.tema || 'dark';
      document.documentElement.setAttribute('data-theme', tema);
      localStorage.setItem('linkce_tema', tema);
    } catch(e) {}

    this.renderShell();
    this.navigate('dashboard');
    this.hideLoading();
  },

  // ── Mostrar login ─────────────────────────────────────────
  _showLogin() {
    document.getElementById('app').innerHTML = `
      <div id="page-root"></div>
      <div id="toast-container"></div>
    `;
    const root = document.getElementById('page-root');
    Pages.Login._modo = 'login';
    Pages.Login.render(root);
    this.hideLoading();
  },

  // ── Shell do app (sidebar + topbar + main) ────────────────
  renderShell() {
    Auth.getPerfil().then(perfil => {
      const nome  = perfil?.nome  || 'Padrinho/Madrinha';
      const cargo = perfil?.cargo || 'Comitê de Cultura';

      document.getElementById('app').innerHTML = `
        <div class="sidebar-overlay" id="sidebar-overlay" onclick="App.toggleMobileSidebar()"></div>
        <div class="app-wrapper" id="app-wrapper">

          <!-- Sidebar -->
          <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
              <div class="sidebar-logo"><i data-lucide="heart-handshake"></i></div>
              <div class="sidebar-brand">
                <h2>Comitê de Cultura</h2>
                <p>LINKCE</p>
              </div>
              <button class="sidebar-toggle" onclick="App.toggleSidebar()" title="Recolher">
                <i data-lucide="panel-left-close"></i>
              </button>
            </div>

            <nav class="sidebar-nav">
              <div class="nav-section">
                <div class="nav-section-label">Principal</div>
                ${this.renderNavItem('dashboard',  'layout-dashboard', 'Dashboard')}
                ${this.renderNavItem('afilhados',  'users',            'Meus Afilhados', true)}
                ${this.renderNavItem('novo',        'user-plus',        'Novo Acompanhamento')}
              </div>
              <div class="nav-section">
                <div class="nav-section-label">Acompanhamento</div>
                ${this.renderNavItem('agenda',     'calendar-days',    'Agenda')}
                ${this.renderNavItem('reunioes',   'message-square',   'Reuniões')}
                ${this.renderNavItem('evolucao',   'trending-up',      'Evolução')}
                ${this.renderNavItem('perguntas',  'help-circle',      'Banco de Perguntas')}
              </div>
              <div class="nav-section">
                <div class="nav-section-label">Cultura</div>
                ${this.renderNavItem('valores',    'heart',            'Valores da Cultura')}
                ${this.renderNavItem('cartilha',   'book-open',        'Cartilha')}
                ${this.renderNavItem('radar',      'radar',            'Radar Cultural')}
              </div>
              <div class="nav-section">
                <div class="nav-section-label">Gestão</div>
                ${this.renderNavItem('relatorios', 'file-bar-chart',   'Relatórios')}
                ${this.renderNavItem('configuracoes','settings',       'Configurações')}
              </div>
            </nav>

            <div class="sidebar-footer">
              <div class="sidebar-user" onclick="App.navigate('configuracoes')">
                <div class="sidebar-user-avatar">${Utils.initials(nome)}</div>
                <div class="sidebar-user-info">
                  <strong>${Utils.sanitize(nome)}</strong>
                  <small>${Utils.sanitize(cargo)}</small>
                </div>
              </div>
              <button onclick="App._logout()" title="Sair"
                style="width:100%;display:flex;align-items:center;gap:8px;padding:8px 10px;
                  background:none;border:none;border-radius:var(--r-md);cursor:pointer;
                  color:var(--text-tertiary);font-size:12.5px;font-weight:500;margin-top:4px;
                  transition:all .2s;"
                onmouseenter="this.style.background='var(--red-soft)';this.style.color='var(--red)'"
                onmouseleave="this.style.background='none';this.style.color='var(--text-tertiary)'">
                <i data-lucide="log-out" style="width:14px;height:14px;"></i>
                <span>Sair</span>
              </button>
            </div>
          </aside>

          <!-- Main -->
          <div class="main-content" id="main-content">
            <header class="topbar" id="topbar">
              <button class="mobile-menu-btn topbar-btn" onclick="App.toggleMobileSidebar()">
                <i data-lucide="menu"></i>
              </button>
              <div>
                <div class="topbar-title" id="topbar-title">Dashboard</div>
                <div class="topbar-subtitle" id="topbar-subtitle">Bem-vindo ao Comitê de Cultura</div>
              </div>
              <div class="topbar-actions">
                <button class="topbar-btn" onclick="App.toggleTheme()" title="Alternar tema">
                  <i data-lucide="sun-moon"></i>
                </button>
                <button class="topbar-btn" onclick="App.navigate('novo')" title="Novo acompanhamento">
                  <i data-lucide="user-plus"></i>
                </button>
              </div>
            </header>
            <main id="page-root" class="page-content fade-in"></main>
          </div>
        </div>
        <div id="toast-container"></div>
      `;
      if (window.lucide) lucide.createIcons();
      this.updateBadges();
    });
  },

  renderNavItem(page, icon, label, hasBadge = false) {
    return `
      <div class="nav-item" data-page="${page}" data-tooltip="${label}" onclick="App.navigate('${page}')">
        <i data-lucide="${icon}"></i>
        <span>${label}</span>
        ${hasBadge ? `<span class="nav-badge" id="badge-${page}" style="display:none;"></span>` : ''}
      </div>
    `;
  },

  // ── Roteador ─────────────────────────────────────────────
  navigate(page, params = {}) {
    this.currentPage   = page;
    this.currentParams = params;

    document.querySelectorAll('.nav-item').forEach(el =>
      el.classList.toggle('active', el.dataset.page === page));

    // Fechar sidebar mobile
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-overlay')?.classList.remove('active');

    const root = document.getElementById('page-root');
    if (!root) return;
    root.innerHTML = '';
    root.className = 'page-content fade-in';
    root.style.padding = '';
    root.style.maxWidth = '';
    root.style.margin = '';

    const pageMap = {
      dashboard:     () => Pages.Dashboard.render(root),
      afilhados:     () => Pages.Afilhados.render(root),
      novo:          () => Pages.NovoColaborador.render(root, params),
      colaborador:   () => Pages.Colaborador.render(root, params),
      reuniao:       () => Pages.Reuniao.render(root, params),
      agenda:        () => Pages.Agenda.render(root),
      reunioes:      () => Pages.Reunioes.render(root),
      evolucao:      () => Pages.Evolucao.render(root),
      perguntas:     () => Pages.Perguntas.render(root),
      valores:       () => Pages.Valores.render(root, params),
      cartilha:      () => Pages.Cartilha.render(root),
      radar:         () => Pages.Radar.render(root),
      relatorios:    () => Pages.Relatorios.render(root, params),
      configuracoes: () => Pages.Configuracoes.render(root),
    };

    const titles = {
      dashboard:     ['Dashboard',           'Visão geral dos acompanhamentos'],
      afilhados:     ['Meus Afilhados',      'Colaboradores em acompanhamento'],
      novo:          ['Novo Acompanhamento', 'Cadastrar novo colaborador'],
      colaborador:   ['Perfil',              'Histórico e evolução completos'],
      reuniao:       ['Modo Reunião',        'Acompanhamento em foco'],
      agenda:        ['Agenda',              'Próximas reuniões e compromissos'],
      reunioes:      ['Reuniões',            'Histórico de todos os encontros'],
      evolucao:      ['Evolução',            'Análise de desenvolvimento'],
      perguntas:     ['Banco de Perguntas',  'Gerencie suas perguntas personalizadas'],
      valores:       ['Valores da Cultura',  'O Jeito LINKCE de Ser'],
      cartilha:      ['Cartilha',            'O Jeito LINKCE de Ser — Digital'],
      radar:         ['Radar Cultural',      'Evolução dos valores por colaborador'],
      relatorios:    ['Relatórios',          'Exportar dados e gerar documentos'],
      configuracoes: ['Configurações',       'Personalizar a plataforma'],
    };

    const [title, subtitle] = titles[page] || ['—', '—'];
    const titleEl    = document.getElementById('topbar-title');
    const subtitleEl = document.getElementById('topbar-subtitle');
    if (titleEl)    titleEl.textContent    = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;

    // Mostrar loading breve para páginas assíncronas
    root.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:200px;">
      <div class="loading-spinner"></div>
    </div>`;

    const fn = pageMap[page];
    if (fn) {
      Promise.resolve(fn()).then(() => {
        this.initLucide();
        this.updateBadges();
      }).catch(err => {
        console.error('Erro ao renderizar página:', err);
        root.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="alert-circle"></i></div>
            <h3>Erro ao carregar</h3>
            <p>${Utils.sanitize(err.message || 'Tente novamente.')}</p>
            <button class="btn btn-primary mt-16" onclick="App.navigate('dashboard')">Voltar ao Dashboard</button>
          </div>`;
        this.initLucide();
      });
    }
  },

  // ── Badges ───────────────────────────────────────────────
  async updateBadges() {
    try {
      const stats  = await DB.Colaboradores.getStats();
      const badge  = document.getElementById('badge-afilhados');
      if (badge) {
        badge.textContent    = stats.pendentes > 0 ? stats.pendentes : '';
        badge.style.display  = stats.pendentes > 0 ? '' : 'none';
      }
    } catch(e) {}
  },

  // ── Logout ───────────────────────────────────────────────
  async _logout() {
    Utils.confirm('Sair da plataforma', 'Deseja encerrar sua sessão?', async () => {
      await Auth.logout();
    }, { tipo: 'info', icone: 'log-out', confirmText: 'Sair' });
  },

  // ── Toggle Sidebar ────────────────────────────────────────
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('main-content');
    sidebar?.classList.toggle('collapsed');
    content?.classList.toggle('sidebar-collapsed');
    const collapsed = sidebar?.classList.contains('collapsed');
    const btn = sidebar?.querySelector('.sidebar-toggle i');
    if (btn) btn.setAttribute('data-lucide', collapsed ? 'panel-left-open' : 'panel-left-close');
    this.initLucide();
  },

  toggleMobileSidebar() {
    document.getElementById('sidebar')?.classList.toggle('mobile-open');
    document.getElementById('sidebar-overlay')?.classList.toggle('active');
  },

  // ── Toggle Tema ───────────────────────────────────────────
  async toggleTheme() {
    const atual = document.documentElement.getAttribute('data-theme') || 'dark';
    const novo  = atual === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', novo);
    localStorage.setItem('linkce_tema', novo);
    try { await DB.Config.setTema(novo); } catch(e) {}
    Utils.toast(`Tema ${novo === 'dark' ? 'escuro' : 'claro'} ativado`, 'info');
  },

  // ── Lucide ───────────────────────────────────────────────
  initLucide() {
    if (window.lucide) try { lucide.createIcons(); } catch(e) {}
  },

  hideLoading() {
    const el = document.getElementById('loading-screen');
    if (el) {
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 500);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
