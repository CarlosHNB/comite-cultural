// ============================================================
// SUPABASE.JS — Cliente e camada de dados na nuvem
// Comitê de Cultura - LINKCE
// ============================================================

const SUPABASE_URL = 'https://ggjvgeqckexoygaryxkg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnanZnZXFja2V4b3lnYXJ5eGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MDUxNjAsImV4cCI6MjA5ODI4MTE2MH0.YJhVx0Sqpjbpn3xouERFeGKe-EsbKldpg-tNkPB6BbM';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// AUTH — Autenticação
// ============================================================
const Auth = {
  _user: null,
  _perfil: null,

  async getSession() {
    const { data } = await sb.auth.getSession();
    return data?.session || null;
  },

  async getUser() {
    if (this._user) return this._user;
    const { data } = await sb.auth.getUser();
    this._user = data?.user || null;
    return this._user;
  },

  async getPerfil() {
    if (this._perfil) return this._perfil;
    const user = await this.getUser();
    if (!user) return null;
    const { data } = await sb.from('perfis').select('*').eq('id', user.id).single();
    this._perfil = data;
    return data;
  },

  async cadastrar(nome, cargo, email, senha) {
    const { data, error } = await sb.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, cargo }
      }
    });
    if (error) throw error;
    return data;
  },

  async login(email, senha) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
    this._user   = data.user;
    this._perfil = null;
    return data;
  },

  async logout() {
    await sb.auth.signOut();
    this._user   = null;
    this._perfil = null;
  },

  async atualizarPerfil(campos) {
    const user = await this.getUser();
    if (!user) return;
    const { data } = await sb.from('perfis')
      .update({ ...campos, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select().single();
    this._perfil = data;
    return data;
  },

  onStateChange(callback) {
    sb.auth.onAuthStateChange((event, session) => {
      this._user   = session?.user || null;
      this._perfil = null;
      callback(event, session);
    });
  }
};

// ============================================================
// DB — Camada de dados (substitui Storage local)
// Mesma interface do Storage para compatibilidade
// ============================================================
const DB = {

  // ── Helpers internos ──────────────────────────────────────
  async _userId() {
    const u = await Auth.getUser();
    if (!u) throw new Error('Usuário não autenticado');
    return u.id;
  },

  _toColaborador(row) {
    if (!row) return null;
    return {
      id:              row.id,
      nome:            row.nome,
      padrinho:        row.padrinho,
      email:           row.email,
      cargo:           row.cargo,
      equipe:          row.equipe,
      gestor:          row.gestor,
      cidade:          row.cidade,
      telefone:        row.telefone,
      dataAdmissao:    row.data_admissao,
      observacoes:     row.observacoes,
      status:          row.status,
      frequenciaDias:  row.frequencia_dias,
      foto:            row.foto,
      createdAt:       row.created_at,
      updatedAt:       row.updated_at,
    };
  },

  _toColaboradorRow(c, userId) {
    return {
      user_id:         userId,
      nome:            c.nome,
      padrinho:        c.padrinho        || null,
      email:           c.email           || null,
      cargo:           c.cargo           || null,
      equipe:          c.equipe          || null,
      gestor:          c.gestor          || null,
      cidade:          c.cidade          || null,
      telefone:        c.telefone        || null,
      data_admissao:   c.dataAdmissao
                         ? new Date(c.dataAdmissao).toISOString().substring(0,10)
                         : null,
      observacoes:     c.observacoes     || null,
      status:          c.status          || 'ativo',
      frequencia_dias: c.frequenciaDias  || 15,
      foto:            c.foto            || null,
      updated_at:      new Date().toISOString(),
    };
  },

  _toReuniao(row) {
    if (!row) return null;
    return {
      id:            row.id,
      colaboradorId: row.colaborador_id,
      tipo:          row.tipo,
      numReuniao:    row.num_reuniao,
      numEncontro:   row.num_encontro || row.num_reuniao,
      status:        row.status,
      respostas:     row.respostas    || [],
      indicadores:   row.indicadores  || {},
      radarValores:  row.radar_valores|| {},
      diario:        row.diario       || {},
      insight:       row.insight,
      duracao:       row.duracao      || 0,
      createdAt:     row.created_at,
      updatedAt:     row.updated_at,
    };
  },

  _toReuniaoRow(r, userId) {
    return {
      user_id:        userId,
      colaborador_id: r.colaboradorId,
      tipo:           r.tipo           || 'acompanhamento',
      num_reuniao:    r.numReuniao     || 1,
      num_encontro:   r.numEncontro    || r.numReuniao || 1,
      status:         r.status         || 'concluida',
      respostas:      r.respostas      || [],
      indicadores:    r.indicadores    || {},
      radar_valores:  r.radarValores   || {},
      diario:         r.diario         || {},
      insight:        r.insight        || null,
      duracao:        r.duracao        || 0,
      updated_at:     new Date().toISOString(),
    };
  },

  // ── COLABORADORES ─────────────────────────────────────────
  Colaboradores: {
    async getAll() {
      const uid = await DB._userId();
      const { data, error } = await sb.from('colaboradores')
        .select('*').eq('user_id', uid).order('created_at');
      if (error) throw error;
      return (data || []).map(DB._toColaborador);
    },

    async getById(id) {
      const uid = await DB._userId();
      const { data } = await sb.from('colaboradores')
        .select('*').eq('id', id).eq('user_id', uid).single();
      return DB._toColaborador(data);
    },

    async save(colaborador) {
      const uid = await DB._userId();
      const row = DB._toColaboradorRow(colaborador, uid);

      if (colaborador.id) {
        const { data, error } = await sb.from('colaboradores')
          .update(row).eq('id', colaborador.id).eq('user_id', uid)
          .select().single();
        if (error) throw error;
        return DB._toColaborador(data);
      } else {
        const { data, error } = await sb.from('colaboradores')
          .insert(row).select().single();
        if (error) throw error;
        return DB._toColaborador(data);
      }
    },

    async delete(id) {
      const uid = await DB._userId();
      const { error } = await sb.from('colaboradores')
        .delete().eq('id', id).eq('user_id', uid);
      if (error) throw error;
    },

    async getStats() {
      const todos    = await this.getAll();
      const reunioes = await DB.Reunioes.getAll();
      const hoje     = new Date();
      const stats    = { total: todos.length, ativos: 0, concluidos: 0, pendentes: 0 };
      todos.forEach(c => {
        if (c.status === 'concluido') { stats.concluidos++; return; }
        stats.ativos++;
        try {
          const rr   = reunioes.filter(r => r.colaboradorId === c.id && r.status === 'concluida');
          const freq = c.frequenciaDias || 15;
          let proxima;
          if (!rr.length) {
            proxima = new Date(c.dataAdmissao);
          } else {
            const ult = rr.sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt))[0];
            proxima   = new Date(ult.updatedAt);
            proxima.setDate(proxima.getDate() + freq);
          }
          if (proxima <= hoje) stats.pendentes++;
        } catch(e) {}
      });
      return stats;
    }
  },

  // ── REUNIÕES ─────────────────────────────────────────────
  Reunioes: {
    async getAll() {
      const uid = await DB._userId();
      const { data, error } = await sb.from('reunioes')
        .select('*').eq('user_id', uid).order('created_at');
      if (error) throw error;
      return (data || []).map(DB._toReuniao);
    },

    async getById(id) {
      const uid = await DB._userId();
      const { data } = await sb.from('reunioes')
        .select('*').eq('id', id).eq('user_id', uid).single();
      return DB._toReuniao(data);
    },

    async getByColaborador(colaboradorId) {
      const uid = await DB._userId();
      const { data, error } = await sb.from('reunioes')
        .select('*')
        .eq('colaborador_id', colaboradorId)
        .eq('user_id', uid)
        .order('created_at');
      if (error) throw error;
      return (data || []).map(DB._toReuniao);
    },

    async save(reuniao) {
      const uid = await DB._userId();
      const row = DB._toReuniaoRow(reuniao, uid);

      if (reuniao.id) {
        const { data, error } = await sb.from('reunioes')
          .update(row).eq('id', reuniao.id).eq('user_id', uid)
          .select().single();
        if (error) throw error;
        return DB._toReuniao(data);
      } else {
        const { data, error } = await sb.from('reunioes')
          .insert(row).select().single();
        if (error) throw error;
        return DB._toReuniao(data);
      }
    },

    async delete(id) {
      const uid = await DB._userId();
      const { error } = await sb.from('reunioes')
        .delete().eq('id', id).eq('user_id', uid);
      if (error) throw error;
    },

    async getStats() {
      const todas = await this.getAll();
      return {
        total:     todas.length,
        realizadas: todas.filter(r => r.status === 'concluida').length,
        pendentes:  todas.filter(r => r.status === 'pendente').length,
      };
    }
  },

  // ── PERGUNTAS ─────────────────────────────────────────────
  Perguntas: {
    async getAll() {
      const uid = await DB._userId();
      const { data } = await sb.from('perguntas')
        .select('*').eq('user_id', uid).order('created_at');
      return data || [];
    },

    async getById(id) {
      const uid = await DB._userId();
      const { data } = await sb.from('perguntas')
        .select('*').eq('id', id).eq('user_id', uid).single();
      return data;
    },

    async getByTipo(tipo) {
      const uid = await DB._userId();
      const { data } = await sb.from('perguntas')
        .select('*').eq('user_id', uid)
        .contains('tipos', [tipo]);
      return data || [];
    },

    async save(pergunta) {
      const uid = await DB._userId();
      const row = {
        user_id:    uid,
        texto:      pergunta.texto,
        categoria:  pergunta.categoria  || null,
        valor:      pergunta.valor      || null,
        chave:      pergunta.chave      || null,
        tipos:      pergunta.tipos      || [],
        obs:        pergunta.obs        || null,
        origem:     pergunta._origem    || null,
        updated_at: new Date().toISOString(),
      };

      if (pergunta.id) {
        const { data, error } = await sb.from('perguntas')
          .update(row).eq('id', pergunta.id).eq('user_id', uid)
          .select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await sb.from('perguntas')
          .insert(row).select().single();
        if (error) throw error;
        return data;
      }
    },

    async delete(id) {
      const uid = await DB._userId();
      await sb.from('perguntas').delete().eq('id', id).eq('user_id', uid);
    },

    async getCategorias() {
      const uid = await DB._userId();
      const [{ data: cats }, { data: pergs }] = await Promise.all([
        sb.from('categorias_perguntas').select('nome').eq('user_id', uid).order('nome'),
        sb.from('perguntas').select('categoria').eq('user_id', uid),
      ]);
      const fromCats = (cats || []).map(c => c.nome);
      const fromPergs = [...new Set((pergs || []).map(p => p.categoria).filter(Boolean))];
      return [...new Set([...fromCats, ...fromPergs])].sort();
    },

    async addCategoria(nome) {
      if (!nome?.trim()) return;
      const uid = await DB._userId();
      await sb.from('categorias_perguntas')
        .upsert({ user_id: uid, nome: nome.trim() }, { onConflict: 'user_id,nome' });
    },

    async deleteCategoriaEPerguntas(cat) {
      const uid = await DB._userId();
      await sb.from('perguntas').delete().eq('user_id', uid).eq('categoria', cat);
      await sb.from('categorias_perguntas').delete().eq('user_id', uid).eq('nome', cat);
    },

    async selecionarParaEncontro(tipo, usadas = [], qtd = 7) {
      const candidatas = await this.getByTipo(tipo);
      const novas  = candidatas.filter(p => !usadas.includes(p.id));
      const pool   = novas.length >= qtd ? novas : candidatas;
      return Utils.shuffle(pool).slice(0, Math.min(qtd, pool.length));
    },

    async importarPadrao() {
      const existentes = new Set((await this.getAll()).map(p => p.origem).filter(Boolean));
      const uid = await DB._userId();
      let count = 0;

      const padrao = [
        { c:'Acolhimento',           t:['primeiro'], texto:'Como você se sentiu no seu primeiro dia na LINKCE?', v:null },
        { c:'Acolhimento',           t:['primeiro'], texto:'Você se sentiu bem recebido pela equipe? O que mais chamou atenção?', v:null },
        { c:'Acolhimento',           t:['primeiro'], texto:'Houve algum momento que te deixou mais à vontade desde que chegou?', v:null },
        { c:'Acolhimento',           t:['primeiro'], texto:'Existe algo que poderia ter sido diferente no seu processo de entrada?', v:null },
        { c:'Integração',            t:['primeiro','acompanhamento'], texto:'Como está sendo a adaptação à rotina e aos processos da empresa?', v:null },
        { c:'Integração',            t:['primeiro','acompanhamento'], texto:'Você já se sente parte do time? O que contribuiu para isso?', v:null },
        { c:'Integração',            t:['acompanhamento'], texto:'O que mudou na sua percepção sobre a empresa desde que entrou?', v:null },
        { c:'Liderança',             t:['primeiro','acompanhamento'], texto:'Como é a sua relação com o seu gestor direto?', v:null },
        { c:'Liderança',             t:['primeiro','acompanhamento'], texto:'Você se sente confortável para levar dúvidas e problemas ao seu líder?', v:null },
        { c:'Foco no Cliente',       t:['acompanhamento','encerramento'], texto:'Como você tem aplicado o valor Foco no Cliente na prática?', v:'foco_cliente', k:1 },
        { c:'Foco no Cliente',       t:['acompanhamento'], texto:'"Se o cliente tem problema, o problema é nosso." Você vê isso no seu dia a dia?', v:'foco_cliente', k:1 },
        { c:'Foco no Cliente',       t:['acompanhamento','encerramento'], texto:'Como você garante que o cliente não fica sem resposta ou sem solução?', v:'foco_cliente', k:3 },
        { c:'Foco no Cliente',       t:['acompanhamento','encerramento'], texto:'Já entregou uma experiência que surpreendeu o cliente? O que fez diferente?', v:'foco_cliente', k:null },
        { c:'Ética e Integridade',   t:['acompanhamento','encerramento'], texto:'"Praticamos a verdade nua e crua." Você se sente confortável em dar feedbacks honestos?', v:'etica', k:5 },
        { c:'Ética e Integridade',   t:['acompanhamento'], texto:'"Não julgue, ajude!" Você tem conseguido aplicar esse princípio?', v:'etica', k:4 },
        { c:'Ética e Integridade',   t:['acompanhamento','encerramento'], texto:'Como você preserva o sigilo das informações dos clientes?', v:'etica', k:6 },
        { c:'Entrega Extraordinária',t:['acompanhamento','encerramento'], texto:'"Dê soluções aos problemas e gere ganhos." Como você tem feito isso?', v:'entrega', k:7 },
        { c:'Entrega Extraordinária',t:['acompanhamento'], texto:'Você tem mantido o padrão de qualidade mesmo sob pressão?', v:'entrega', k:8 },
        { c:'Entrega Extraordinária',t:['acompanhamento','encerramento'], texto:'Já fez algo além do que foi pedido? O que foi?', v:'entrega', k:9 },
        { c:'Simplicidade',          t:['acompanhamento','encerramento'], texto:'"Velocidade nos processos e soluções." O que você tem feito para ser mais ágil?', v:'simplicidade', k:10 },
        { c:'Simplicidade',          t:['acompanhamento'], texto:'Você está usando as ferramentas e tecnologias disponíveis ao máximo?', v:'simplicidade', k:11 },
        { c:'Simplicidade',          t:['acompanhamento','encerramento'], texto:'"Crescer e contribuir." O que você tem ensinado para seus colegas?', v:'simplicidade', k:12 },
        { c:'Autorresponsabilidade', t:['acompanhamento','encerramento'], texto:'"Use dados, não opiniões." Você baseia suas decisões em dados?', v:'autorresponsabilidade', k:13 },
        { c:'Autorresponsabilidade', t:['acompanhamento','encerramento'], texto:'"Prometeu, cumpra!" Como está seu senso de urgência?', v:'autorresponsabilidade', k:14 },
        { c:'Autorresponsabilidade', t:['acompanhamento','encerramento'], texto:'"Amar feedback." Como você tem recebido os feedbacks?', v:'autorresponsabilidade', k:15 },
        { c:'Equipe',                t:['primeiro','acompanhamento'], texto:'Como é o seu relacionamento com a equipe no dia a dia?', v:null },
        { c:'Equipe',                t:['acompanhamento','encerramento'], texto:'Como você descreveria o clima do seu time hoje?', v:null },
        { c:'Desenvolvimento',       t:['acompanhamento','encerramento'], texto:'Onde você se vê daqui a 6 meses na LINKCE?', v:null },
        { c:'Desenvolvimento',       t:['encerramento'], texto:'O que a LINKCE pode fazer para te ajudar a crescer?', v:null },
        { c:'Feedback',              t:['encerramento'], texto:'Que feedback você daria para a empresa sobre sua experiência?', v:null },
        { c:'Feedback',              t:['encerramento'], texto:'O que você mais aprendeu nesses primeiros meses na LINKCE?', v:null },
      ];

      const rows = padrao
        .filter(item => {
          const key = `padrao::${item.c}::${item.texto.substring(0,40)}`;
          return !existentes.has(key);
        })
        .map(item => ({
          user_id:   uid,
          texto:     item.texto,
          categoria: item.c,
          valor:     item.v || null,
          chave:     item.k || null,
          tipos:     item.t,
          obs:       null,
          origem:    `padrao::${item.c}::${item.texto.substring(0,40)}`,
          updated_at: new Date().toISOString(),
        }));

      if (rows.length > 0) {
        const { error } = await sb.from('perguntas').insert(rows);
        if (!error) count = rows.length;
      }
      return count;
    }
  },

  // ── CONFIG / PERFIL ──────────────────────────────────────
  Config: {
    async get() {
      const perfil = await Auth.getPerfil();
      return {
        nomeUsuario:  perfil?.nome  || 'Padrinho/Madrinha',
        cargoUsuario: perfil?.cargo || 'Comitê de Cultura',
        tema:         perfil?.tema  || 'dark',
      };
    },

    async set(campos) {
      const mapa = {};
      if (campos.nomeUsuario)  mapa.nome  = campos.nomeUsuario;
      if (campos.cargoUsuario) mapa.cargo = campos.cargoUsuario;
      if (campos.tema)         mapa.tema  = campos.tema;
      await Auth.atualizarPerfil(mapa);
    },

    getTema() {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    },

    async setTema(tema) {
      document.documentElement.setAttribute('data-theme', tema);
      await this.set({ tema });
    }
  },
};
