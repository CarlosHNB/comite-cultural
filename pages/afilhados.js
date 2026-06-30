// ============================================================
// AFILHADOS.JS — Lista de colaboradores
// NOVO.JS — Cadastro com padrinho, frequência dinâmica, sem obrigação de email
// ============================================================

Pages.Afilhados = {
  _filter: 'todos',
  _search: '',

  async render(root) {
    const colaboradores = await DB.Colaboradores.getAll();
    const reunioes = await DB.Reunioes.getAll();
    const pendentes = this._calcularPendentes(colaboradores, reunioes);

    root.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-header-title">Meus Afilhados</h1>
          <p class="page-header-subtitle">${colaboradores.length} colaborador${colaboradores.length !== 1 ? 'es' : ''} cadastrado${colaboradores.length !== 1 ? 's' : ''}</p>
        </div>
        <div class="page-header-actions">
          ${pendentes > 0 ? `<span class="badge badge-amber" style="font-size:13px;padding:6px 14px;"><i data-lucide="clock" style="width:13px;height:13px;"></i> ${pendentes} acompanhamento${pendentes>1?'s':''} pendente${pendentes>1?'s':''}</span>` : ''}
          <button class="btn btn-ghost" onclick="Pages.Afilhados._exportar()"><i data-lucide="download"></i> Exportar</button>
          <button class="btn btn-primary" onclick="App.navigate('novo')"><i data-lucide="user-plus"></i> Novo Afilhado</button>
        </div>
      </div>

      <!-- Filtros e busca -->
      <div class="card mb-24" style="padding:16px;">
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <div class="search-wrap" style="flex:1;min-width:200px;">
            <i data-lucide="search" class="search-icon"></i>
            <input type="text" class="search-input" placeholder="Buscar por nome, cargo, equipe ou padrinho..." id="search-afilhados"
              oninput="Pages.Afilhados._onSearch(this.value)">
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${['todos','ativo','pendente','concluido'].map(f => `
              <button class="chip ${this._filter === f ? 'active' : ''}" onclick="Pages.Afilhados._setFilter('${f}')" data-filter="${f}">
                ${this._filterLabel(f)}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <div id="afilhados-list">
        ${this._renderList(colaboradores, reunioes)}
      </div>
    `;
    App.initLucide();
  },

  _calcularPendentes(colaboradores, reunioes) {
    // Pendente = colaborador ativo cuja próxima data de acompanhamento já passou
    const hoje = new Date();
    let count = 0;
    colaboradores.filter(c => c.status !== 'concluido').forEach(c => {
      const proxima = this._proximaDataAcompanhamento(c, reunioes);
      if (proxima && proxima <= hoje) count++;
    });
    return count;
  },

  _proximaDataAcompanhamento(colaborador, reunioes) {
    const rr = (reunioes || []).filter(r => r.colaboradorId === colaborador.id && r.status === 'concluida');
    const freq = colaborador.frequenciaDias || 15;
    if (rr.length === 0) {
      // Nunca teve reunião — pendente desde a admissão
      return new Date(colaborador.dataAdmissao);
    }
    const ultima = rr.sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt))[0];
    const proxima = new Date(ultima.updatedAt);
    proxima.setDate(proxima.getDate() + freq);
    return proxima;
  },

  _filterLabel(f) {
    const m = { todos: 'Todos', ativo: 'Ativos', pendente: 'Com Pendência', concluido: 'Concluídos' };
    return m[f] || f;
  },

  _setFilter(f) {
    this._filter = f;
    document.querySelectorAll('.chip[data-filter]').forEach(el => el.classList.toggle('active', el.dataset.filter === f));
    this._refresh();
  },

  _onSearch: Utils.debounce(function(v) {
    Pages.Afilhados._search = v.toLowerCase();
    Pages.Afilhados._refresh();
  }, 300),

  async _refresh() {
    const list = document.getElementById('afilhados-list');
    if (!list) return;
    const reunioes = await DB.Reunioes.getAll();
    const colaboradores = await DB.Colaboradores.getAll();
    list.innerHTML = this._renderList(colaboradores, reunioes);
    App.initLucide();
  },

  _filtrarColabs(colaboradores, reunioes) {
    const hoje = new Date();
    let filtered = colaboradores;

    if (this._search) {
      filtered = filtered.filter(c =>
        c.nome?.toLowerCase().includes(this._search) ||
        c.cargo?.toLowerCase().includes(this._search) ||
        c.equipe?.toLowerCase().includes(this._search) ||
        c.padrinho?.toLowerCase().includes(this._search)
      );
    }

    switch (this._filter) {
      case 'ativo':    filtered = filtered.filter(c => c.status !== 'concluido'); break;
      case 'concluido': filtered = filtered.filter(c => c.status === 'concluido'); break;
      case 'pendente': filtered = filtered.filter(c => {
        if (c.status === 'concluido') return false;
        const proxima = this._proximaDataAcompanhamento(c, reunioes);
        return proxima && proxima <= hoje;
      }); break;
    }
    return filtered;
  },

  _renderList(colaboradores, reunioes) {
    const filtered = this._filtrarColabs(colaboradores, reunioes);

    if (!filtered.length) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="users"></i></div>
          <h3>${this._search || this._filter !== 'todos' ? 'Nenhum resultado encontrado' : 'Nenhum afilhado cadastrado'}</h3>
          <p>${this._search ? 'Tente uma busca diferente.' : 'Comece cadastrando o primeiro colaborador em acompanhamento.'}</p>
          ${!this._search ? `<button class="btn btn-primary" onclick="App.navigate('novo')"><i data-lucide="user-plus"></i> Cadastrar Afilhado</button>` : ''}
        </div>
      `;
    }

    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;">
        ${filtered.map(c => this._renderCard(c, reunioes)).join('')}
      </div>
    `;
  },

  _renderCard(colaborador, reunioes) {
    const rr = reunioes.filter(r => r.colaboradorId === colaborador.id && r.status === 'concluida');
    const hoje = new Date();
    const proxima = this._proximaDataAcompanhamento(colaborador, reunioes);
    const pendente = proxima && proxima <= hoje && colaborador.status !== 'concluido';
    const diasRestantes = proxima ? Math.ceil((proxima - hoje) / 86400000) : null;
    const diasEmpresa = Utils.daysSince(colaborador.dataAdmissao);
    const freq = colaborador.frequenciaDias || 15;
    const numReuniao = rr.length + 1;
    const tipoProximo = rr.length === 0 ? 'primeiro' : (colaborador.status === 'encerrar' ? 'encerramento' : 'acompanhamento');
    const template = AppData.templates_encontro.find(t => t.tipo === tipoProximo) || AppData.templates_encontro[1];

    return `
      <div class="card card-interactive" onclick="App.navigate('colaborador',{id:'${colaborador.id}'})"
        style="border-color:${pendente ? 'var(--amber)' : 'var(--border)'};">
        ${pendente ? `<div style="position:absolute;top:-1px;left:16px;right:16px;height:2px;background:var(--amber);border-radius:0 0 2px 2px;"></div>` : ''}

        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
          ${Utils.avatarHtml(colaborador, 48)}
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${Utils.sanitize(colaborador.nome)}</div>
            <div style="font-size:12.5px;color:var(--text-secondary);margin-top:1px;">${Utils.sanitize(colaborador.cargo || '—')}</div>
            <div style="font-size:11.5px;color:var(--text-tertiary);">${Utils.sanitize(colaborador.equipe || '—')}</div>
          </div>
          ${pendente
            ? `<span class="badge badge-amber" style="flex-shrink:0;"><i data-lucide="alert-circle" style="width:11px;height:11px;"></i> Pendente</span>`
            : colaborador.status === 'concluido'
              ? `<span class="badge badge-green" style="flex-shrink:0;">Concluído</span>`
              : `<span class="badge badge-brand" style="flex-shrink:0;">Ativo</span>`}
        </div>

        <!-- Padrinho -->
        ${colaborador.padrinho ? `
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:10px;font-size:12px;color:var(--text-tertiary);">
            <i data-lucide="heart" style="width:12px;height:12px;color:var(--brand);"></i>
            <span>Padrinho: <strong style="color:var(--text-primary);">${Utils.sanitize(colaborador.padrinho)}</strong></span>
          </div>
        ` : ''}

        <!-- Próximo acompanhamento -->
        <div style="background:${pendente?'var(--amber-soft)':'var(--bg-elevated)'};border-radius:var(--r-md);padding:10px 12px;margin-bottom:12px;border:1px solid ${pendente?'rgba(245,158,11,0.2)':'var(--border)'};">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:11.5px;font-weight:600;color:${pendente?'var(--amber)':'var(--text-secondary)'};">
              ${pendente ? '⚠️ Acompanhamento em atraso' : `${template.label} #${numReuniao}`}
            </div>
            <div style="font-size:11px;color:var(--text-tertiary);">
              ${diasRestantes !== null
                ? diasRestantes < 0
                  ? `${Math.abs(diasRestantes)}d atraso`
                  : diasRestantes === 0
                    ? 'Hoje!'
                    : `em ${diasRestantes}d`
                : ''}
            </div>
          </div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px;">
            Frequência: a cada ${freq} dias · ${diasEmpresa}d na empresa · ${rr.length} realizados
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border);">
          <div style="font-size:11.5px;color:var(--text-tertiary);">
            ${proxima ? `Próximo: ${Utils.formatDate(proxima)}` : '—'}
          </div>
          ${colaborador.status !== 'concluido' ? `
            <button class="btn btn-sm ${pendente?'btn-primary':'btn-ghost'}" onclick="event.stopPropagation();App.navigate('reuniao',{colaboradorId:'${colaborador.id}',tipoEncontro:'${tipoProximo}',numReuniao:${numReuniao}})">
              <i data-lucide="play"></i> ${pendente ? 'Iniciar Agora' : 'Iniciar'}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  },

  async _exportar() {
    const colaboradores = await DB.Colaboradores.getAll();
    Utils.download(JSON.stringify(colaboradores, null, 2), `afilhados-${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.json`);
    Utils.toast('Dados exportados!', 'success');
  }
};

// ============================================================
// NOVO / EDITAR COLABORADOR
// ============================================================
Pages.NovoColaborador = {
  _foto: null,

  async render(root, params = {}) {
    const editando = params.id ? await DB.Colaboradores.getById(params.id) : null;
    this._foto = editando?.foto || null;

    // Listar padrinhos/madrinhas cadastrados (nomes únicos já usados)
    const todosColabs = await DB.Colaboradores.getAll();
    const padrinhosSugestoes = [...new Set(todosColabs.filter(c => c.padrinho).map(c => c.padrinho))];

    root.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-header-title">${editando ? 'Editar Colaborador' : 'Novo Acompanhamento'}</h1>
          <p class="page-header-subtitle">${editando ? `Editando ${editando.nome}` : 'Cadastre um novo colaborador para acompanhamento'}</p>
        </div>
        <button class="btn btn-ghost" onclick="App.navigate('afilhados')"><i data-lucide="arrow-left"></i> Voltar</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 300px;gap:24px;align-items:start;">

        <!-- Formulário principal -->
        <div style="display:flex;flex-direction:column;gap:16px;">

          <!-- Dados pessoais -->
          <div class="card">
            <div style="font-size:14px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:8px;color:var(--brand);">
              <i data-lucide="user" style="width:15px;height:15px;"></i> Dados do Colaborador
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nome Completo <span class="required">*</span></label>
                <input type="text" class="form-input" id="f-nome" placeholder="Ex: João da Silva" value="${editando?.nome || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="f-email" placeholder="joao@linkce.com.br" value="${editando?.email || ''}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Cargo / Função</label>
                <input type="text" class="form-input" id="f-cargo" placeholder="Ex: Analista de Marketing" value="${editando?.cargo || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Equipe / Área</label>
                <input type="text" class="form-input" id="f-equipe" placeholder="Ex: Marketing, Comercial..." value="${editando?.equipe || ''}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Gestor Direto</label>
                <input type="text" class="form-input" id="f-gestor" placeholder="Nome do gestor" value="${editando?.gestor || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Cidade</label>
                <input type="text" class="form-input" id="f-cidade" placeholder="Ex: Fortaleza - CE" value="${editando?.cidade || ''}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Telefone / WhatsApp</label>
                <input type="tel" class="form-input" id="f-telefone" placeholder="(85) 99999-9999" value="${editando?.telefone || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Data de Admissão <span class="required">*</span></label>
                <input type="date" class="form-input" id="f-admissao" value="${editando?.dataAdmissao ? editando.dataAdmissao.substring(0,10) : new Date().toISOString().substring(0,10)}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Observações Iniciais</label>
              <textarea class="form-textarea" id="f-obs" placeholder="Informações relevantes sobre o colaborador, contexto de contratação, pontos de atenção..." style="min-height:80px;">${editando?.observacoes || ''}</textarea>
            </div>
          </div>

          <!-- Padrinhamento -->
          <div class="card">
            <div style="font-size:14px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:8px;color:var(--brand);">
              <i data-lucide="heart" style="width:15px;height:15px;"></i> Padrinhamento
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Padrinho / Madrinha <span class="required">*</span></label>
                <input type="text" class="form-input" id="f-padrinho" placeholder="Nome do padrinho ou madrinha"
                  value="${editando?.padrinho || ''}" list="padrinhos-list">
                <datalist id="padrinhos-list">
                  ${padrinhosSugestoes.map(p => `<option value="${Utils.sanitize(p)}">`).join('')}
                </datalist>
                <div class="form-hint">Nome de quem irá conduzir o acompanhamento deste colaborador.</div>
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select form-input" id="f-status">
                  <option value="ativo" ${editando?.status === 'ativo' || !editando ? 'selected' : ''}>Ativo</option>
                  <option value="encerrar" ${editando?.status === 'encerrar' ? 'selected' : ''}>Próximo a encerrar</option>
                  <option value="concluido" ${editando?.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Frequência de acompanhamento -->
          <div class="card">
            <div style="font-size:14px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:8px;color:var(--brand);">
              <i data-lucide="calendar-clock" style="width:15px;height:15px;"></i> Frequência de Acompanhamento
            </div>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;">
              Defina com que frequência os encontros acontecerão com este colaborador. Cada pessoa pode ter um ritmo diferente.
            </p>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Frequência padrão</label>
                <select class="form-select form-input" id="f-freq-preset" onchange="Pages.NovoColaborador._onFreqPreset(this.value)">
                  <option value="7"  ${(editando?.frequenciaDias||15) == 7  ? 'selected':''}>Semanal — a cada 7 dias</option>
                  <option value="15" ${(editando?.frequenciaDias||15) == 15 ? 'selected':''}>Quinzenal — a cada 15 dias (recomendado)</option>
                  <option value="30" ${(editando?.frequenciaDias||15) == 30 ? 'selected':''}>Mensal — a cada 30 dias</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              <div class="form-group" id="freq-custom-wrap" style="display:${![7,15,30].includes(editando?.frequenciaDias||15)?'block':'none'}">
                <label class="form-label">Dias entre encontros</label>
                <input type="number" class="form-input" id="f-freq-dias" min="1" max="90" value="${editando?.frequenciaDias || 15}" placeholder="Ex: 15">
              </div>
            </div>

            <div style="background:var(--brand-soft);border:1px solid var(--border-brand);border-radius:var(--r-md);padding:14px;margin-top:8px;">
              <div style="font-size:12px;font-weight:700;color:var(--brand);margin-bottom:6px;">💡 Como funciona</div>
              <ul style="font-size:12.5px;color:var(--text-secondary);display:flex;flex-direction:column;gap:4px;">
                <li>• O <strong>1º Encontro</strong> é realizado logo após a admissão</li>
                <li>• Os <strong>Acompanhamentos</strong> seguem a frequência definida aqui</li>
                <li>• O <strong>Encerramento do Ciclo</strong> é marcado manualmente quando o padrinho decidir</li>
                <li>• A plataforma avisa quando o próximo acompanhamento estiver pendente</li>
              </ul>
            </div>
          </div>

          <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button class="btn btn-ghost" onclick="App.navigate('afilhados')">Cancelar</button>
            <button class="btn btn-primary" onclick="Pages.NovoColaborador._salvar('${editando?.id || ''}')">
              <i data-lucide="${editando ? 'save' : 'user-plus'}"></i>
              ${editando ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
            </button>
          </div>
        </div>

        <!-- Coluna lateral -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <!-- Foto -->
          <div class="card" style="text-align:center;">
            <div style="font-size:13px;font-weight:700;margin-bottom:16px;">Foto do Colaborador</div>
            <div id="foto-preview" style="width:80px;height:80px;border-radius:50%;margin:0 auto 16px;overflow:hidden;border:3px solid var(--border);cursor:pointer;position:relative;"
              onclick="document.getElementById('foto-input').click()">
              ${this._foto
                ? `<img src="${this._foto}" style="width:100%;height:100%;object-fit:cover;">`
                : `<div style="width:100%;height:100%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;">${editando ? Utils.initials(editando.nome) : '?'}</div>`}
            </div>
            <input type="file" id="foto-input" accept="image/*" style="display:none;" onchange="Pages.NovoColaborador._onFoto(event)">
            <button class="btn btn-ghost btn-sm w-full" onclick="document.getElementById('foto-input').click()">
              <i data-lucide="upload"></i> ${this._foto ? 'Trocar Foto' : 'Adicionar Foto'}
            </button>
            ${this._foto ? `<button class="btn btn-ghost btn-sm w-full mt-4" onclick="Pages.NovoColaborador._removeFoto()"><i data-lucide="trash-2"></i> Remover</button>` : ''}
          </div>

          <!-- Dicas -->
          <div class="card" style="background:var(--brand-soft);border-color:var(--border-brand);">
            <div style="font-size:13px;font-weight:700;color:var(--brand);margin-bottom:12px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="lightbulb" style="width:14px;height:14px;"></i> Dicas
            </div>
            <ul style="font-size:12.5px;color:var(--text-secondary);display:flex;flex-direction:column;gap:8px;">
              <li>❤️ O padrinho é quem conduz os encontros e será exibido no perfil do afilhado</li>
              <li>📅 A frequência quinzenal (15 dias) é a mais comum no Comitê de Cultura</li>
              <li>⚠️ Quando um acompanhamento estiver pendente, aparecerá um alerta no card</li>
              <li>🔄 Você pode alterar a frequência a qualquer momento editando o colaborador</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    App.initLucide();
  },

  _onFreqPreset(val) {
    const wrap = document.getElementById('freq-custom-wrap');
    if (wrap) wrap.style.display = val === 'custom' ? 'block' : 'none';
    if (val !== 'custom') {
      const input = document.getElementById('f-freq-dias');
      if (input) input.value = val;
    }
  },

  _onFoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { Utils.toast('Imagem muito grande. Máx: 2MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      this._foto = e.target.result;
      const preview = document.getElementById('foto-preview');
      if (preview) preview.innerHTML = `<img src="${this._foto}" style="width:100%;height:100%;object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
  },

  _removeFoto() {
    this._foto = null;
    const preview = document.getElementById('foto-preview');
    if (preview) preview.innerHTML = `<div style="width:100%;height:100%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;">?</div>`;
  },

  async _salvar(idEditando = '') {
    const nome = document.getElementById('f-nome')?.value?.trim();
    const padrinho = document.getElementById('f-padrinho')?.value?.trim();
    const dataAdmissao = document.getElementById('f-admissao')?.value;
    const freqPreset = document.getElementById('f-freq-preset')?.value;
    const freqDias = parseInt(document.getElementById('f-freq-dias')?.value) || 15;
    const frequenciaDias = freqPreset === 'custom' ? freqDias : parseInt(freqPreset) || 15;

    if (!nome) { Utils.toast('Nome é obrigatório', 'error'); return; }
    if (!padrinho) { Utils.toast('Informe o padrinho ou madrinha', 'error'); return; }
    if (!dataAdmissao) { Utils.toast('Data de admissão é obrigatória', 'error'); return; }

    const colaborador = {
      id: idEditando || undefined,
      nome,
      padrinho,
      email:        document.getElementById('f-email')?.value?.trim() || '',
      cargo:        document.getElementById('f-cargo')?.value?.trim() || '',
      equipe:       document.getElementById('f-equipe')?.value?.trim() || '',
      gestor:       document.getElementById('f-gestor')?.value?.trim() || '',
      cidade:       document.getElementById('f-cidade')?.value?.trim() || '',
      telefone:     document.getElementById('f-telefone')?.value?.trim() || '',
      dataAdmissao: new Date(dataAdmissao + 'T12:00:00').toISOString(),
      observacoes:  document.getElementById('f-obs')?.value?.trim() || '',
      status:       document.getElementById('f-status')?.value || 'ativo',
      frequenciaDias,
      foto: this._foto,
    };

    const btnSalvar = document.querySelector('button[onclick*="_salvar"]');
    if (btnSalvar) { btnSalvar.disabled = true; btnSalvar.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div> Salvando...'; }

    try {
      const salvo = await DB.Colaboradores.save(colaborador);
      Utils.toast(idEditando ? 'Colaborador atualizado!' : 'Colaborador cadastrado com sucesso!', 'success');
      App.navigate('colaborador', { id: salvo.id });
    } catch(e) {
      console.error(e);
      Utils.toast('Erro ao salvar: ' + (e.message || 'tente novamente'), 'error');
      if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.innerHTML = `<i data-lucide="${idEditando?'save':'user-plus'}"></i> ${idEditando?'Salvar Alterações':'Cadastrar Colaborador'}`; App.initLucide(); }
    }
  }
};
