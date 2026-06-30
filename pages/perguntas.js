// ============================================================
// PERGUNTAS.JS — Gerenciador de Banco de Perguntas Dinâmico
// Comitê de Cultura - LINKCE
// Cada usuário monta e gerencia seu próprio banco de perguntas
// ============================================================

Pages.Perguntas = {
  _filtroTipo: 'todos',
  _filtroCategoria: 'todas',
  _search: '',
  _editandoId: null,

  async render(root) {
    const banco = await DB.Perguntas.getAll();
    const categorias = await DB.Perguntas.getCategorias();
    const stats = this._calcularStats(banco);

    root.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-header-title">Banco de Perguntas</h1>
          <p class="page-header-subtitle">
            ${banco.length} pergunta${banco.length !== 1 ? 's' : ''} cadastrada${banco.length !== 1 ? 's' : ''} em ${categorias.length} categori${categorias.length !== 1 ? 'as' : 'a'}
          </p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-ghost" onclick="Pages.Perguntas._abrirModalCategoria()">
            <i data-lucide="tag"></i> Gerenciar Categorias
          </button>
          <button class="btn btn-ghost" onclick="Pages.Perguntas._importarPadrao()">
            <i data-lucide="download"></i> Importar Padrão
          </button>
          <button class="btn btn-primary" onclick="Pages.Perguntas._abrirModal()">
            <i data-lucide="plus"></i> Nova Pergunta
          </button>
        </div>
      </div>

      <!-- Stats rápidos -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px;">
        ${this._statCard('1º Encontro', stats.primeiro, '#6366f1')}
        ${this._statCard('Acompanhamento', stats.acompanhamento, '#10b981')}
        ${this._statCard('Encerramento', stats.encerramento, '#f59e0b')}
      </div>

      <!-- Filtros -->
      <div class="card mb-20" style="padding:16px;">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <div class="search-wrap" style="flex:1;min-width:200px;">
            <i data-lucide="search" class="search-icon"></i>
            <input class="search-input" type="text" placeholder="Buscar pergunta..." id="perg-search"
              oninput="Pages.Perguntas._onSearch(this.value)">
          </div>

          <!-- Filtro por tipo de encontro -->
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${['todos','primeiro','acompanhamento','encerramento'].map(t => `
              <button class="chip ${this._filtroTipo === t ? 'active' : ''}" data-ftipo="${t}"
                onclick="Pages.Perguntas._setFiltroTipo('${t}')">
                ${t === 'todos' ? 'Todos' : t === 'primeiro' ? '1º Encontro' : t === 'acompanhamento' ? 'Acompanhamento' : 'Encerramento'}
              </button>
            `).join('')}
          </div>

          <!-- Filtro por categoria — chips -->
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="chip ${this._filtroCategoria === 'todas' ? 'active' : ''}" data-fcat="todas"
              onclick="Pages.Perguntas._setFiltroCategoria('todas')">
              Todas
            </button>
            ${categorias.map(c => `
              <button class="chip ${this._filtroCategoria === c ? 'active' : ''}" data-fcat="${Utils.sanitize(c)}"
                onclick="Pages.Perguntas._setFiltroCategoria('${Utils.sanitize(c).replace(/'/g,"\\'")}')">
                ${Utils.sanitize(c)}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Lista de perguntas -->
      <div id="perguntas-list">
        ${this._renderLista(banco, categorias)}
      </div>

      ${banco.length === 0 ? '' : `
        <!-- Dica de uso -->
        <div class="card mt-24" style="background:var(--brand-soft);border-color:var(--border-brand);padding:16px 20px;">
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <i data-lucide="lightbulb" style="width:18px;height:18px;color:var(--brand);flex-shrink:0;margin-top:2px;"></i>
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--brand);margin-bottom:4px;">Como funciona</div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                As perguntas marcadas para cada tipo de encontro (1º Encontro, Acompanhamento ou Encerramento) 
                são selecionadas automaticamente e de forma aleatória durante o Modo Reunião, evitando repetição 
                com encontros anteriores do mesmo afilhado. Você pode também selecionar perguntas manualmente 
                antes de iniciar cada encontro.
              </p>
            </div>
          </div>
        </div>
      `}
    `;

    App.initLucide();
  },

  _calcularStats(banco) {
    return {
      primeiro:       banco.filter(p => p.tipos?.includes('primeiro')).length,
      acompanhamento: banco.filter(p => p.tipos?.includes('acompanhamento')).length,
      encerramento:   banco.filter(p => p.tipos?.includes('encerramento')).length,
    };
  },

  _statCard(label, value, cor) {
    return `
      <div class="card" style="padding:16px;border-top:2px solid ${cor};">
        <div style="font-size:26px;font-weight:800;color:${cor};letter-spacing:-1px;">${value}</div>
        <div style="font-size:12.5px;color:var(--text-tertiary);margin-top:4px;font-weight:500;">${label}</div>
      </div>
    `;
  },

  _onSearch: Utils.debounce(function(v) {
    Pages.Perguntas._search = v.toLowerCase();
    Pages.Perguntas._refresh();
  }, 280),

  _setFiltroTipo(t) {
    this._filtroTipo = t;
    document.querySelectorAll('[data-ftipo]').forEach(el =>
      el.classList.toggle('active', el.dataset.ftipo === t));
    this._refresh();
  },

  _setFiltroCategoria(c) {
    this._filtroCategoria = c;
    document.querySelectorAll('[data-fcat]').forEach(el =>
      el.classList.toggle('active', el.dataset.fcat === c));
    this._refresh();
  },

  async _refresh() {
    const banco = await DB.Perguntas.getAll();
    const categorias = await DB.Perguntas.getCategorias();
    const list = document.getElementById('perguntas-list');
    if (list) { list.innerHTML = this._renderLista(banco, categorias); App.initLucide(); }
  },

  _filtrar(banco) {
    return banco.filter(p => {
      if (this._search && !p.texto.toLowerCase().includes(this._search) &&
          !p.categoria?.toLowerCase().includes(this._search)) return false;
      if (this._filtroTipo !== 'todos' && !p.tipos?.includes(this._filtroTipo)) return false;
      if (this._filtroCategoria !== 'todas' && p.categoria !== this._filtroCategoria) return false;
      return true;
    });
  },

  _renderLista(banco, categorias) {
    const filtradas = this._filtrar(banco);

    if (!banco.length) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="help-circle"></i></div>
          <h3>Nenhuma pergunta cadastrada</h3>
          <p>Crie seu banco de perguntas personalizado ou importe o banco padrão para começar.</p>
          <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;justify-content:center;">
            <button class="btn btn-ghost" onclick="Pages.Perguntas._importarPadrao()">
              <i data-lucide="download"></i> Importar Padrão LINKCE
            </button>
            <button class="btn btn-primary" onclick="Pages.Perguntas._abrirModal()">
              <i data-lucide="plus"></i> Criar Primeira Pergunta
            </button>
          </div>
        </div>`;
    }

    if (!filtradas.length) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="search-x"></i></div>
          <h3>Nenhuma pergunta encontrada</h3>
          <p>Tente ajustar os filtros ou a busca.</p>
        </div>`;
    }

    // Agrupar por categoria
    const grupos = {};
    filtradas.forEach(p => {
      const cat = p.categoria || 'Sem categoria';
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(p);
    });

    const tipoLabels = {
      primeiro: { label: '1º Enc.', cor: '#6366f1' },
      acompanhamento: { label: 'Acomp.', cor: '#10b981' },
      encerramento: { label: 'Enc.Final', cor: '#f59e0b' },
    };

    return Object.entries(grupos).map(([cat, pergs]) => `
      <div class="card mb-16" style="padding:0;overflow:hidden;">
        <!-- Header da categoria -->
        <div style="padding:12px 20px;background:var(--bg-elevated);border-bottom:1px solid var(--border);
          display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:10px;">
            <i data-lucide="tag" style="width:14px;height:14px;color:var(--brand);"></i>
            <span style="font-size:13.5px;font-weight:700;color:var(--text-primary);">${Utils.sanitize(cat)}</span>
            <span class="badge badge-brand" style="font-size:10.5px;">${pergs.length}</span>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="Pages.Perguntas._abrirModal(null,'${Utils.sanitize(cat)}')">
            <i data-lucide="plus"></i> Adicionar
          </button>
        </div>

        <!-- Perguntas da categoria -->
        <div style="divide-y:1px solid var(--border);">
          ${pergs.map((p, idx) => `
            <div style="padding:14px 20px;border-bottom:${idx < pergs.length-1 ? '1px solid var(--border)' : 'none'};
              display:flex;align-items:flex-start;gap:14px;transition:background .15s;"
              onmouseenter="this.style.background='var(--bg-elevated)'"
              onmouseleave="this.style.background=''">

              <!-- Drag handle visual -->
              <div style="color:var(--text-disabled);margin-top:3px;flex-shrink:0;">
                <i data-lucide="grip-vertical" style="width:14px;height:14px;"></i>
              </div>

              <!-- Texto -->
              <div style="flex:1;min-width:0;">
                <p style="font-size:14px;color:var(--text-primary);line-height:1.6;margin-bottom:8px;">
                  ${Utils.sanitize(p.texto)}
                </p>
                <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                  <!-- Tipos de encontro -->
                  ${(p.tipos||[]).map(t => {
                    const info = tipoLabels[t] || { label: t, cor: 'var(--text-tertiary)' };
                    return `<span style="padding:2px 8px;border-radius:99px;font-size:10.5px;font-weight:700;background:${info.cor}18;color:${info.cor};border:1px solid ${info.cor}33;">${info.label}</span>`;
                  }).join('')}
                  ${!p.tipos?.length ? `<span style="font-size:11px;color:var(--text-tertiary);">Nenhum tipo</span>` : ''}

                  <!-- Valor + Chave -->
                  ${(() => {
                    if (!p.valor) return '';
                    const v = AppData.valores.find(val => val.id === p.valor);
                    if (!v) return '';
                    const chaveInfo = p.chave
                      ? AppData.chaves.find(c => c.numero === Number(p.chave))
                      : null;
                    return `
                      <span style="padding:2px 9px;border-radius:99px;font-size:10.5px;font-weight:600;background:#22c55e12;color:#22c55e;border:1px solid #22c55e28;">
                        ${v.emoji} ${v.nome}
                      </span>
                      ${chaveInfo ? `
                        <span style="padding:2px 9px;border-radius:99px;font-size:10.5px;font-weight:700;background:#22c55e20;color:#22c55e;border:1px solid #22c55e44;">
                          🔑 Chave ${chaveInfo.numero}
                        </span>
                        <span style="font-size:11px;color:var(--text-tertiary);font-style:italic;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
                          title="${Utils.sanitize(chaveInfo.texto)}">
                          ${Utils.truncate(chaveInfo.texto, 55)}
                        </span>
                      ` : ''}
                    `;
                  })()}

                  <!-- Obs interna -->
                  ${p.obs ? `<span style="font-size:10.5px;color:var(--text-tertiary);display:flex;align-items:center;gap:3px;" title="${Utils.sanitize(p.obs)}"><i data-lucide="info" style="width:11px;height:11px;"></i>${Utils.truncate(p.obs, 40)}</span>` : ''}
                </div>
              </div>

              <!-- Ações -->
              <div style="display:flex;gap:4px;flex-shrink:0;">
                <button class="btn btn-ghost btn-sm btn-icon" title="Editar"
                  onclick="Pages.Perguntas._abrirModal('${p.id}')">
                  <i data-lucide="edit-2"></i>
                </button>
                <button class="btn btn-ghost btn-sm btn-icon" title="Duplicar"
                  onclick="Pages.Perguntas._duplicar('${p.id}')">
                  <i data-lucide="copy"></i>
                </button>
                <button class="btn btn-ghost btn-sm btn-icon" title="Excluir"
                  style="color:var(--red);" onclick="Pages.Perguntas._excluir('${p.id}')">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  // ─── MODAL CRIAR/EDITAR PERGUNTA ──────────────────────────
  async _abrirModal(id = null, categoriaPreset = null) {
    const editando   = id ? await DB.Perguntas.getById(id) : null;
    const categorias = await DB.Perguntas.getCategorias();

    // Estado local do modal (guardado no próprio objeto para acesso via funções inline)
    Pages.Perguntas._modalState = {
      categoriaAtiva: editando?.categoria || categoriaPreset || null,
      valorAtivo:     editando?.valor     || null,
      chaveAtiva:     editando?.chave     || null,
    };

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-pergunta';
    overlay.innerHTML = `
      <div class="modal" style="max-width:640px;max-height:90vh;overflow-y:auto;">
        <div class="modal-header" style="position:sticky;top:0;background:var(--bg-surface);z-index:10;padding-bottom:16px;border-bottom:1px solid var(--border);">
          <div>
            <h2>${editando ? 'Editar Pergunta' : 'Nova Pergunta'}</h2>
            <p>${editando ? 'Altere o texto, categoria, valor ou encontro' : 'Monte sua pergunta personalizada'}</p>
          </div>
          <button class="modal-close" onclick="document.getElementById('modal-pergunta').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:20px;">

          <!-- ① Texto -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Texto da Pergunta <span class="required">*</span></label>
            <textarea class="form-textarea" id="mp-texto"
              placeholder="Ex: Como você tem aplicado o valor Foco no Cliente no seu dia a dia?"
              style="min-height:96px;">${editando ? Utils.sanitize(editando.texto) : ''}</textarea>
            <div class="form-hint">Escreva de forma aberta e reflexiva.</div>
          </div>

          <!-- ② Categoria — chips visuais -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Categoria <span style="color:var(--text-tertiary);font-weight:400;">(opcional)</span></label>

            ${categorias.length > 0 ? `
              <!-- Chips das categorias existentes -->
              <div id="cats-chips" style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px;">
                ${categorias.map(c => {
                  const ativa = (editando?.categoria === c) || (categoriaPreset === c);
                  return `
                    <button type="button" data-cat="${Utils.sanitize(c)}"
                      onclick="Pages.Perguntas._selecionarCategoria(this,'${Utils.sanitize(c)}')"
                      style="padding:6px 14px;border-radius:99px;font-size:12.5px;font-weight:600;
                        cursor:pointer;transition:all .18s;border:1.5px solid ${ativa ? 'var(--brand)' : 'var(--border)'};
                        background:${ativa ? 'var(--brand-soft)' : 'var(--bg-elevated)'};
                        color:${ativa ? 'var(--brand)' : 'var(--text-secondary)'};">
                      ${Utils.sanitize(c)}
                    </button>`;
                }).join('')}
              </div>
            ` : ''}

            <!-- Campo nova categoria -->
            <div style="display:flex;gap:8px;align-items:center;">
              <div style="position:relative;flex:1;">
                <i data-lucide="plus" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:var(--text-tertiary);pointer-events:none;"></i>
                <input type="text" class="form-input" id="mp-cat-nova"
                  placeholder="Criar nova categoria..."
                  style="padding-left:30px;"
                  oninput="Pages.Perguntas._onNovaCatInput(this.value)">
              </div>
              <button type="button" class="btn btn-ghost btn-sm" onclick="Pages.Perguntas._criarEselecionarCategoria()">
                Criar
              </button>
            </div>

            <!-- Indicador da selecionada -->
            <div id="cat-selecionada-label" style="margin-top:8px;font-size:12px;color:var(--text-tertiary);">
              ${Pages.Perguntas._modalState.categoriaAtiva
                ? `✓ Categoria selecionada: <strong style="color:var(--brand);">${Utils.sanitize(Pages.Perguntas._modalState.categoriaAtiva)}</strong>`
                : 'Nenhuma categoria selecionada'}
            </div>
            <!-- Campo hidden para leitura no save -->
            <input type="hidden" id="mp-categoria" value="${Utils.sanitize(editando?.categoria || categoriaPreset || '')}">
          </div>

          <!-- ③ Valor LINKCE → Chave (cascata) -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Valor e Chave LINKCE <span style="color:var(--text-tertiary);font-weight:400;">(opcional)</span></label>
            <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:10px;">
              Selecione o valor que esta pergunta trabalha. Depois escolha a chave específica.
            </div>

            <!-- Grid de valores -->
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px;">
              ${AppData.valores.map(v => {
                const ativo = Pages.Perguntas._modalState.valorAtivo === v.id;
                return `
                  <button type="button" data-valor="${v.id}"
                    onclick="Pages.Perguntas._selecionarValor('${v.id}')"
                    style="padding:10px 6px;border-radius:var(--r-md);border:1.5px solid ${ativo ? v.cor : 'var(--border)'};
                      background:${ativo ? v.cor+'14' : 'var(--bg-elevated)'};
                      cursor:pointer;transition:all .18s;text-align:center;">
                    <div style="font-size:20px;margin-bottom:4px;">${v.emoji}</div>
                    <div style="font-size:10px;font-weight:700;color:${ativo ? v.cor : 'var(--text-tertiary)'};line-height:1.3;">${v.nome}</div>
                  </button>`;
              }).join('')}
            </div>

            <!-- Chaves do valor selecionado (aparece em cascata) -->
            <div id="chaves-container" style="transition:all .25s;">
              ${Pages.Perguntas._renderChavesModal(editando?.valor, editando?.chave)}
            </div>

            <!-- Hidden fields -->
            <input type="hidden" id="mp-valor" value="${editando?.valor || ''}">
            <input type="hidden" id="mp-chave" value="${editando?.chave || ''}">
          </div>

          <!-- ④ Usar em (tipo de encontro) -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Usar em <span class="required">*</span></label>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
              ${[
                { id: 'primeiro',       label: '1º Encontro',    cor: '#6366f1', emoji: '🤝', desc: 'Acolhimento e primeiras impressões' },
                { id: 'acompanhamento', label: 'Acompanhamento', cor: '#10b981', emoji: '📅', desc: 'Encontros periódicos de evolução' },
                { id: 'encerramento',   label: 'Encerramento',   cor: '#f59e0b', emoji: '🏆', desc: 'Conclusão do ciclo' },
              ].map(t => {
                const checked = editando?.tipos?.includes(t.id) ?? false;
                return `
                  <label id="tipo-label-${t.id}"
                    style="display:flex;flex-direction:column;gap:5px;padding:12px;
                      border:2px solid ${checked ? t.cor : 'var(--border)'};
                      border-radius:var(--r-lg);cursor:pointer;transition:all .18s;
                      background:${checked ? t.cor+'10' : 'transparent'};"
                    onclick="Pages.Perguntas._toggleTipoLabel('${t.id}','${t.cor}')">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <input type="checkbox" id="mp-tipo-${t.id}" value="${t.id}"
                        ${checked ? 'checked' : ''}
                        style="accent-color:${t.cor};width:15px;height:15px;flex-shrink:0;">
                      <span style="font-size:12.5px;font-weight:700;
                        color:${checked ? t.cor : 'var(--text-primary)'};"
                        id="tipo-label-text-${t.id}">
                        ${t.emoji} ${t.label}
                      </span>
                    </div>
                    <span style="font-size:11px;color:var(--text-tertiary);line-height:1.35;">${t.desc}</span>
                  </label>`;
              }).join('')}
            </div>
          </div>

          <!-- ⑤ Observação interna -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Observação Interna <span style="color:var(--text-tertiary);font-weight:400;">(opcional)</span></label>
            <input type="text" class="form-input" id="mp-obs"
              placeholder="Ex: Boa para introvertidos, usar a partir do 2º encontro..."
              value="${editando?.obs ? Utils.sanitize(editando.obs) : ''}">
            <div class="form-hint">Lembrete só pra você — não aparece para o colaborador.</div>
          </div>

        </div>

        <div class="modal-footer" style="position:sticky;bottom:0;background:var(--bg-surface);border-top:1px solid var(--border);">
          <button class="btn btn-ghost" onclick="document.getElementById('modal-pergunta').remove()">Cancelar</button>
          <button class="btn btn-primary" onclick="Pages.Perguntas._salvar('${editando?.id || ''}')">
            <i data-lucide="${editando ? 'save' : 'plus'}"></i>
            ${editando ? 'Salvar Alterações' : 'Adicionar Pergunta'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    App.initLucide();
    requestAnimationFrame(() => overlay.classList.add('active'));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    setTimeout(() => document.getElementById('mp-texto')?.focus(), 80);
  },

  // Renderiza as chaves do valor selecionado
  _renderChavesModal(valorId, chaveAtiva = null) {
    if (!valorId) {
      return `<div style="font-size:12px;color:var(--text-tertiary);padding:10px 0;">
        ← Selecione um valor acima para ver suas chaves.
      </div>`;
    }
    const valor = AppData.valores.find(v => v.id === valorId);
    if (!valor) return '';

    return `
      <div style="background:${valor.cor}0d;border:1px solid ${valor.cor}2a;border-radius:var(--r-lg);padding:14px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;
          color:${valor.cor};margin-bottom:10px;">
          🔑 Chaves — ${valor.nome}
        </div>
        <div style="display:flex;flex-direction:column;gap:7px;">
          <!-- Opção "nenhuma chave específica" -->
          <label style="display:flex;align-items:center;gap:10px;padding:8px 12px;
            border-radius:var(--r-md);cursor:pointer;border:1.5px solid ${!chaveAtiva ? valor.cor : 'var(--border)'};
            background:${!chaveAtiva ? valor.cor+'12' : 'transparent'};transition:all .15s;"
            onclick="Pages.Perguntas._selecionarChave(null,'${valorId}')">
            <input type="radio" name="mp-chave-radio" value=""
              ${!chaveAtiva ? 'checked' : ''}
              style="accent-color:${valor.cor};" onclick="event.stopPropagation()">
            <span style="font-size:12.5px;color:${!chaveAtiva ? valor.cor : 'var(--text-secondary)'};font-weight:${!chaveAtiva?'700':'400'};">
              Valor em geral (sem chave específica)
            </span>
          </label>
          ${valor.chaves.map(c => {
            const sel = String(chaveAtiva) === String(c.numero);
            return `
              <label style="display:flex;align-items:center;gap:10px;padding:9px 12px;
                border-radius:var(--r-md);cursor:pointer;
                border:1.5px solid ${sel ? valor.cor : 'var(--border)'};
                background:${sel ? valor.cor+'12' : 'transparent'};transition:all .15s;"
                onclick="Pages.Perguntas._selecionarChave(${c.numero},'${valorId}')">
                <input type="radio" name="mp-chave-radio" value="${c.numero}"
                  ${sel ? 'checked' : ''}
                  style="accent-color:${valor.cor};" onclick="event.stopPropagation()">
                <div>
                  <div style="font-size:11px;font-weight:800;color:${sel?valor.cor:'var(--text-tertiary)'};margin-bottom:1px;">
                    CHAVE ${c.numero}
                  </div>
                  <div style="font-size:12.5px;color:${sel?valor.cor:'var(--text-secondary)'};font-weight:${sel?'700':'400'};line-height:1.4;">
                    ${c.texto}
                  </div>
                </div>
              </label>`;
          }).join('')}
        </div>
      </div>`;
  },

  // Seleciona um valor (atualiza cascata de chaves)
  _selecionarValor(valorId) {
    const ms = Pages.Perguntas._modalState;
    // Toggle: se já está ativo, desseleciona
    ms.valorAtivo = ms.valorAtivo === valorId ? null : valorId;
    ms.chaveAtiva = null;

    // Atualizar visual dos botões de valor
    document.querySelectorAll('[data-valor]').forEach(btn => {
      const v = AppData.valores.find(val => val.id === btn.dataset.valor);
      if (!v) return;
      const ativo = btn.dataset.valor === ms.valorAtivo;
      btn.style.borderColor = ativo ? v.cor : 'var(--border)';
      btn.style.background  = ativo ? v.cor+'14' : 'var(--bg-elevated)';
      btn.querySelector('div:last-child').style.color = ativo ? v.cor : 'var(--text-tertiary)';
    });

    // Atualizar campos hidden
    const hv = document.getElementById('mp-valor');
    const hc = document.getElementById('mp-chave');
    if (hv) hv.value = ms.valorAtivo || '';
    if (hc) hc.value = '';

    // Renderizar chaves em cascata
    const container = document.getElementById('chaves-container');
    if (container) {
      container.innerHTML = Pages.Perguntas._renderChavesModal(ms.valorAtivo, null);
    }
  },

  // Seleciona uma chave específica
  _selecionarChave(numero, valorId) {
    const ms = Pages.Perguntas._modalState;
    ms.chaveAtiva = numero;
    const hc = document.getElementById('mp-chave');
    if (hc) hc.value = numero !== null ? numero : '';

    // Atualizar visual de todos os labels de chave
    const valor = AppData.valores.find(v => v.id === valorId);
    if (!valor) return;
    document.querySelectorAll('label[onclick*="_selecionarChave"]').forEach(lbl => {
      const radio = lbl.querySelector('input[type=radio]');
      const isNulo = lbl.querySelector('input').value === '';
      const sel    = numero === null ? isNulo : String(radio?.value) === String(numero);
      lbl.style.borderColor = sel ? valor.cor : 'var(--border)';
      lbl.style.background  = sel ? valor.cor+'12' : 'transparent';
      const txt = lbl.querySelector('span:last-child') || lbl.querySelector('div:last-child');
      if (txt) txt.style.color    = sel ? valor.cor : 'var(--text-secondary)';
      if (txt) txt.style.fontWeight = sel ? '700' : '400';
    });
  },

  // Seleciona categoria via chip
  _selecionarCategoria(btn, nome) {
    Pages.Perguntas._modalState.categoriaAtiva = nome;
    document.getElementById('mp-categoria').value = nome;
    document.getElementById('mp-cat-nova').value  = '';

    // Atualizar chips
    document.querySelectorAll('#cats-chips button').forEach(b => {
      const ativo = b.dataset.cat === nome;
      b.style.borderColor = ativo ? 'var(--brand)' : 'var(--border)';
      b.style.background  = ativo ? 'var(--brand-soft)' : 'var(--bg-elevated)';
      b.style.color       = ativo ? 'var(--brand)' : 'var(--text-secondary)';
    });

    const label = document.getElementById('cat-selecionada-label');
    if (label) label.innerHTML = `✓ Categoria selecionada: <strong style="color:var(--brand);">${Utils.sanitize(nome)}</strong>`;
  },

  // Cria e seleciona nova categoria pelo campo de texto
  _onNovaCatInput(val) {
    // Se o user digitar, deseleciona chip
    if (val.trim()) {
      document.querySelectorAll('#cats-chips button').forEach(b => {
        b.style.borderColor = 'var(--border)';
        b.style.background  = 'var(--bg-elevated)';
        b.style.color       = 'var(--text-secondary)';
      });
      document.getElementById('mp-categoria').value = val.trim();
      Pages.Perguntas._modalState.categoriaAtiva = val.trim();
      const label = document.getElementById('cat-selecionada-label');
      if (label) label.innerHTML = `✓ Nova categoria: <strong style="color:var(--brand);">${Utils.sanitize(val.trim())}</strong>`;
    }
  },

  _criarEselecionarCategoria() {
    const val = document.getElementById('mp-cat-nova')?.value?.trim();
    if (!val) { Utils.toast('Digite um nome para a nova categoria.', 'error'); return; }
    // Simular seleção de chip mesmo sem reabrir modal
    document.getElementById('mp-categoria').value = val;
    Pages.Perguntas._modalState.categoriaAtiva = val;
    const label = document.getElementById('cat-selecionada-label');
    if (label) label.innerHTML = `✓ Nova categoria: <strong style="color:var(--brand);">${Utils.sanitize(val)}</strong>`;
    document.getElementById('mp-cat-nova').value = '';
    Utils.toast(`Categoria "${val}" será criada ao salvar.`, 'info');
  },

  _toggleTipoLabel(tipoId, cor) {
    // O click no label propaga para o checkbox, então aqui lemos o estado APÓS o clique
    setTimeout(() => {
      const cb    = document.getElementById(`mp-tipo-${tipoId}`);
      const label = document.getElementById(`tipo-label-${tipoId}`);
      const text  = document.getElementById(`tipo-label-text-${tipoId}`);
      if (!cb || !label) return;
      const checked = cb.checked;
      label.style.borderColor = checked ? cor : 'var(--border)';
      label.style.background  = checked ? cor+'10' : 'transparent';
      if (text) text.style.color = checked ? cor : 'var(--text-primary)';
    }, 0);
  },

  async _salvar(idEditando = '') {
    const texto     = document.getElementById('mp-texto')?.value?.trim();
    const categoria = document.getElementById('mp-categoria')?.value?.trim();
    const valor     = document.getElementById('mp-valor')?.value?.trim() || null;
    const chave     = document.getElementById('mp-chave')?.value?.trim() || null;
    const obs       = document.getElementById('mp-obs')?.value?.trim() || '';
    const tipos     = ['primeiro','acompanhamento','encerramento']
      .filter(t => document.getElementById(`mp-tipo-${t}`)?.checked);

    if (!texto)     { Utils.toast('O texto da pergunta é obrigatório.', 'error'); return; }
    if (!tipos.length) { Utils.toast('Selecione pelo menos um tipo de encontro.', 'error'); return; }

    const btnSalvar = document.querySelector('#modal-pergunta button[onclick*="_salvar"]');
    if (btnSalvar) { btnSalvar.disabled = true; btnSalvar.innerHTML = '<div class="loading-spinner" style="width:14px;height:14px;border-width:2px;"></div> Salvando...'; }

    try {
      await DB.Perguntas.save({
        id: idEditando || undefined,
        texto,
        categoria: categoria || null,
        valor: valor || null,
        chave: chave ? Number(chave) : null,
        tipos,
        obs,
      });
      document.getElementById('modal-pergunta')?.remove();
      Utils.toast(idEditando ? 'Pergunta atualizada!' : 'Pergunta adicionada!', 'success');
      await this.render(document.getElementById('page-root'));
    } catch(e) {
      Utils.toast('Erro ao salvar: ' + (e.message||''), 'error');
      if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.innerHTML = `<i data-lucide="${idEditando?'save':'plus'}"></i> ${idEditando?'Salvar Alterações':'Adicionar Pergunta'}`; App.initLucide(); }
    }
  },

  async _duplicar(id) {
    const p = await DB.Perguntas.getById(id);
    if (!p) return;
    const nova = { ...p, id: undefined, texto: p.texto + ' (cópia)' };
    try {
      await DB.Perguntas.save(nova);
      Utils.toast('Pergunta duplicada!', 'success');
      this._refresh();
    } catch(e) {
      Utils.toast('Erro ao duplicar: ' + (e.message||''), 'error');
    }
  },

  _excluir(id) {
    Utils.confirm(
      'Excluir Pergunta',
      'Esta pergunta será removida do banco permanentemente.',
      async () => {
        try {
          await DB.Perguntas.delete(id);
          Utils.toast('Pergunta excluída.', 'info');
          await this.render(document.getElementById('page-root'));
        } catch(e) {
          Utils.toast('Erro ao excluir: ' + (e.message||''), 'error');
        }
      },
      { tipo: 'danger', confirmText: 'Excluir' }
    );
  },

  // ─── MODAL GERENCIAR CATEGORIAS ───────────────────────────
  async _abrirModalCategoria() {
    const categorias = await DB.Perguntas.getCategorias();
    const banco = await DB.Perguntas.getAll();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-categoria';
    overlay.innerHTML = `
      <div class="modal" style="max-width:480px;">
        <div class="modal-header">
          <div>
            <h2>Gerenciar Categorias</h2>
            <p>Organize e renomeie suas categorias de perguntas</p>
          </div>
          <button class="modal-close" onclick="document.getElementById('modal-categoria').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <!-- Nova categoria -->
          <div style="display:flex;gap:8px;margin-bottom:20px;">
            <input type="text" class="form-input" id="nova-cat-input" placeholder="Nome da nova categoria..." style="flex:1;">
            <button class="btn btn-primary" onclick="Pages.Perguntas._adicionarCategoria()">
              <i data-lucide="plus"></i> Criar
            </button>
          </div>

          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-tertiary);margin-bottom:10px;">
            ${categorias.length} categori${categorias.length !== 1 ? 'as' : 'a'}
          </div>

          <div id="cats-list-modal" style="display:flex;flex-direction:column;gap:6px;">
            ${categorias.length === 0
              ? `<div style="text-align:center;padding:20px;color:var(--text-tertiary);font-size:13px;">Nenhuma categoria ainda.</div>`
              : categorias.map(cat => {
                  const count = banco.filter(p => p.categoria === cat).length;
                  return `
                    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg-elevated);border-radius:var(--r-md);">
                      <i data-lucide="tag" style="width:14px;height:14px;color:var(--brand);flex-shrink:0;"></i>
                      <span style="flex:1;font-size:13.5px;font-weight:500;">${Utils.sanitize(cat)}</span>
                      <span class="badge badge-gray" style="font-size:10.5px;">${count} pergunta${count !== 1 ? 's' : ''}</span>
                      <button class="btn btn-ghost btn-sm btn-icon" onclick="Pages.Perguntas._excluirCategoria('${Utils.sanitize(cat).replace(/'/g,"\\'")}')"
                        style="color:var(--red);" title="Excluir categoria e perguntas">
                        <i data-lucide="trash-2"></i>
                      </button>
                    </div>
                  `;
                }).join('')
            }
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="document.getElementById('modal-categoria').remove()">
            Fechar
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    App.initLucide();
    requestAnimationFrame(() => overlay.classList.add('active'));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    setTimeout(() => document.getElementById('nova-cat-input')?.focus(), 100);
  },

  async _adicionarCategoria() {
    const input = document.getElementById('nova-cat-input');
    const nome = input?.value?.trim();
    if (!nome) { Utils.toast('Digite um nome para a categoria.', 'error'); return; }
    try {
      await DB.Perguntas.addCategoria(nome);
      if (input) input.value = '';
      Utils.toast(`Categoria "${nome}" criada!`, 'success');
      document.getElementById('modal-categoria')?.remove();
      await this._abrirModalCategoria();
    } catch(e) {
      Utils.toast('Erro ao criar categoria: ' + (e.message||''), 'error');
    }
  },

  async _excluirCategoria(cat) {
    const banco = await DB.Perguntas.getAll();
    const count = banco.filter(p => p.categoria === cat).length;
    Utils.confirm(
      'Excluir Categoria',
      `Isso removerá a categoria "${cat}" e suas ${count} pergunta${count !== 1 ? 's' : ''}. Não pode ser desfeito.`,
      async () => {
        try {
          await DB.Perguntas.deleteCategoriaEPerguntas(cat);
          Utils.toast(`Categoria "${cat}" removida.`, 'info');
          document.getElementById('modal-categoria')?.remove();
          await this.render(document.getElementById('page-root'));
        } catch(e) {
          Utils.toast('Erro ao excluir: ' + (e.message||''), 'error');
        }
      },
      { tipo: 'danger', confirmText: 'Excluir tudo' }
    );
  },

  // ─── IMPORTAR BANCO PADRÃO LINKCE ─────────────────────────
  async _importarPadrao() {
    const banco = await DB.Perguntas.getAll();
    const existentes = banco.length;
    const msg = existentes > 0
      ? `Você já tem ${existentes} pergunta${existentes!==1?'s':''} cadastrada${existentes!==1?'s':''}. O banco padrão será adicionado sem apagar as suas.`
      : 'Isso irá importar o banco de perguntas padrão do Jeito LINKCE de Ser com mais de 30 perguntas organizadas por categoria, valor, chave e tipo de encontro.';

    Utils.confirm(
      'Importar Banco Padrão LINKCE',
      msg,
      async () => {
        try {
          const count = await DB.Perguntas.importarPadrao();
          Utils.toast(`${count} perguntas importadas com sucesso!`, 'success');
          await this.render(document.getElementById('page-root'));
        } catch(e) {
          Utils.toast('Erro ao importar: ' + (e.message||''), 'error');
        }
      },
      { tipo: 'info', icone: 'download', confirmText: 'Importar' }
    );
  },
};
