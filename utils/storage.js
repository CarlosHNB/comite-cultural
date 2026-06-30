// ============================================================
// STORAGE.JS — Gerenciador de LocalStorage
// Comitê de Cultura - LINKCE
// ============================================================

const Storage = {
  KEYS: {
    COLABORADORES: 'linkce_colaboradores',
    REUNIOES: 'linkce_reunioes',
    AGENDA: 'linkce_agenda',
    CONFIG: 'linkce_config',
    USUARIO: 'linkce_usuario',
    DRAFT: 'linkce_draft'
  },

  // --- Utilitários base ---
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage.get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage.set error:', e);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clear() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  },

  // --- Exportar todos os dados ---
  exportAll() {
    const data = {};
    Object.entries(this.KEYS).forEach(([name, key]) => {
      data[name] = this.get(key);
    });
    data._exportedAt = new Date().toISOString();
    data._version = '1.0.0';
    return data;
  },

  // --- Importar dados ---
  importAll(data) {
    try {
      Object.entries(this.KEYS).forEach(([name, key]) => {
        if (data[name] !== undefined) {
          this.set(key, data[name]);
        }
      });
      return true;
    } catch (e) {
      console.error('Storage.importAll error:', e);
      return false;
    }
  },

  // ============================================================
  // COLABORADORES
  // ============================================================
  Colaboradores: {
    getAll() {
      return Storage.get(Storage.KEYS.COLABORADORES) || [];
    },

    getById(id) {
      return this.getAll().find(c => c.id === id) || null;
    },

    save(colaborador) {
      const todos = this.getAll();
      const idx = todos.findIndex(c => c.id === colaborador.id);
      if (idx >= 0) {
        todos[idx] = { ...todos[idx], ...colaborador, updatedAt: new Date().toISOString() };
      } else {
        colaborador.id = colaborador.id || Utils.uid();
        colaborador.createdAt = new Date().toISOString();
        colaborador.updatedAt = new Date().toISOString();
        todos.push(colaborador);
      }
      Storage.set(Storage.KEYS.COLABORADORES, todos);
      return colaborador;
    },

    delete(id) {
      const todos = this.getAll().filter(c => c.id !== id);
      Storage.set(Storage.KEYS.COLABORADORES, todos);
      // Limpar reuniões associadas
      const reunioes = Storage.Reunioes.getAll().filter(r => r.colaboradorId !== id);
      Storage.set(Storage.KEYS.REUNIOES, reunioes);
    },

    getAtivos() {
      return this.getAll().filter(c => c.status !== 'concluido');
    },

    getStats() {
      const todos = this.getAll();
      const hoje = new Date();
      const reunioes = Storage.Reunioes.getAll();
      const stats = { total: todos.length, ativos: 0, concluidos: 0, pendentes: 0 };
      todos.forEach(c => {
        if (c.status === 'concluido') { stats.concluidos++; return; }
        stats.ativos++;
        // Pendente = próxima data já passou
        const rr = reunioes.filter(r => r.colaboradorId === c.id && r.status === 'concluida');
        const freq = c.frequenciaDias || 15;
        let proxima;
        if (rr.length === 0) {
          proxima = new Date(c.dataAdmissao);
        } else {
          const ult = rr.sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt))[0];
          proxima = new Date(ult.updatedAt);
          proxima.setDate(proxima.getDate() + freq);
        }
        if (proxima <= hoje) stats.pendentes++;
      });
      return stats;
    }
  },

  // ============================================================
  // REUNIÕES
  // ============================================================
  Reunioes: {
    getAll() {
      return Storage.get(Storage.KEYS.REUNIOES) || [];
    },

    getById(id) {
      return this.getAll().find(r => r.id === id) || null;
    },

    getByColaborador(colaboradorId) {
      return this.getAll()
        .filter(r => r.colaboradorId === colaboradorId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },

    getEcontroByColaborador(colaboradorId, numEncontro) {
      return this.getAll().find(r => r.colaboradorId === colaboradorId && r.numEncontro === numEncontro);
    },

    save(reuniao) {
      const todas = this.getAll();
      const idx = todas.findIndex(r => r.id === reuniao.id);
      if (idx >= 0) {
        todas[idx] = { ...todas[idx], ...reuniao, updatedAt: new Date().toISOString() };
      } else {
        reuniao.id = reuniao.id || Utils.uid();
        reuniao.createdAt = new Date().toISOString();
        reuniao.updatedAt = new Date().toISOString();
        todas.push(reuniao);
      }
      Storage.set(Storage.KEYS.REUNIOES, todas);
      return reuniao;
    },

    delete(id) {
      const todas = this.getAll().filter(r => r.id !== id);
      Storage.set(Storage.KEYS.REUNIOES, todas);
    },

    getStats() {
      const todas = this.getAll();
      return {
        total: todas.length,
        realizadas: todas.filter(r => r.status === 'concluida').length,
        pendentes: todas.filter(r => r.status === 'pendente').length
      };
    }
  },

  // ============================================================
  // AGENDA
  // ============================================================
  Agenda: {
    getAll() {
      return Storage.get(Storage.KEYS.AGENDA) || [];
    },

    save(evento) {
      const todos = this.getAll();
      evento.id = evento.id || Utils.uid();
      const idx = todos.findIndex(e => e.id === evento.id);
      if (idx >= 0) todos[idx] = evento;
      else todos.push(evento);
      Storage.set(Storage.KEYS.AGENDA, todos);
      return evento;
    },

    delete(id) {
      const todos = this.getAll().filter(e => e.id !== id);
      Storage.set(Storage.KEYS.AGENDA, todos);
    },

    getProximos(dias = 30) {
      const hoje = new Date();
      const limite = new Date(hoje.getTime() + dias * 86400000);
      return this.getAll()
        .filter(e => new Date(e.data) >= hoje && new Date(e.data) <= limite)
        .sort((a, b) => new Date(a.data) - new Date(b.data));
    }
  },

  // ============================================================
  // CONFIGURAÇÕES
  // ============================================================
  Config: {
    defaults: {
      tema: 'dark',
      idioma: 'pt-BR',
      nomeUsuario: 'Padrinho/Madrinha',
      cargoUsuario: 'Comitê de Cultura',
      notificacoes: true
    },

    get() {
      return { ...this.defaults, ...(Storage.get(Storage.KEYS.CONFIG) || {}) };
    },

    set(config) {
      const atual = this.get();
      Storage.set(Storage.KEYS.CONFIG, { ...atual, ...config });
    },

    getTema() {
      return this.get().tema;
    },

    setTema(tema) {
      this.set({ tema });
      document.documentElement.setAttribute('data-theme', tema);
    }
  }
};
