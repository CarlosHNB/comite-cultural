// ============================================================
// VALORES.JS — Fiel à Cartilha "O Jeito LINKCE de Ser"
// ============================================================

Pages.Valores = {
  _ativo: null,

  render(root, params = {}) {
    this._ativo = params.valorId || AppData.valores[0].id;

    root.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-header-title">Valores da Cultura</h1>
          <p class="page-header-subtitle">O Jeito LINKCE de Ser — os pilares que guiam tudo que fazemos</p>
        </div>
      </div>

      <!-- Identidade rápida no topo -->
      <div class="card mb-20" style="background:linear-gradient(135deg,#16a34a11,#22c55e08);border-color:rgba(34,197,94,.2);">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;text-align:center;">
          <div>
            <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#22c55e;margin-bottom:4px;">Propósito</div>
            <div style="font-size:13px;color:var(--text-secondary);">${AppData.identidade.proposito}</div>
          </div>
          <div style="border-left:1px solid var(--border);border-right:1px solid var(--border);padding:0 16px;">
            <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#22c55e;margin-bottom:4px;">Missão</div>
            <div style="font-size:13px;color:var(--text-secondary);">${AppData.identidade.missao}</div>
          </div>
          <div>
            <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#22c55e;margin-bottom:4px;">Visão</div>
            <div style="font-size:13px;color:var(--text-secondary);">${AppData.identidade.visao}</div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:220px 1fr;gap:20px;align-items:start;">
        <!-- Menu -->
        <div style="display:flex;flex-direction:column;gap:6px;position:sticky;top:80px;">
          ${AppData.valores.map(v => `
            <div onclick="Pages.Valores._selectValor('${v.id}')" id="val-menu-${v.id}"
              style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:var(--r-md);cursor:pointer;transition:all .2s;
                background:${this._ativo===v.id?'rgba(34,197,94,0.12)':'transparent'};
                border:1px solid ${this._ativo===v.id?'rgba(34,197,94,0.4)':'transparent'};">
              <span style="font-size:18px;">${v.emoji}</span>
              <span style="font-size:13.5px;font-weight:${this._ativo===v.id?'700':'500'};color:${this._ativo===v.id?'#22c55e':'var(--text-secondary)'};">${v.nome}</span>
            </div>
          `).join('')}
          <div style="margin-top:8px;padding:10px 14px;background:var(--bg-elevated);border-radius:var(--r-md);">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-tertiary);margin-bottom:8px;">15 Chaves LINKCE</div>
            ${AppData.chaves.map(c => `
              <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:5px;cursor:pointer;" onclick="Pages.Valores._selectValor('${c.valor}')">
                <span style="font-size:10px;font-weight:800;color:#22c55e;flex-shrink:0;margin-top:1px;">${c.numero}</span>
                <span style="font-size:11px;color:var(--text-tertiary);line-height:1.4;">${c.texto}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Conteúdo -->
        <div id="valor-content" class="fade-in">
          ${this._renderValor(this._ativo)}
        </div>
      </div>
    `;
    App.initLucide();
  },

  _selectValor(id) {
    this._ativo = id;
    document.querySelectorAll('[id^="val-menu-"]').forEach(el => {
      const isAtivo = el.id === `val-menu-${id}`;
      el.style.background = isAtivo ? 'rgba(34,197,94,0.12)' : 'transparent';
      el.style.border = `1px solid ${isAtivo ? 'rgba(34,197,94,0.4)' : 'transparent'}`;
      const span = el.querySelector('span:last-child');
      if (span) { span.style.color = isAtivo ? '#22c55e' : 'var(--text-secondary)'; span.style.fontWeight = isAtivo ? '700' : '500'; }
    });
    const content = document.getElementById('valor-content');
    content.className = 'fade-in';
    content.innerHTML = this._renderValor(id);
    App.initLucide();
  },

  _renderValor(id) {
    const v = AppData.valores.find(val => val.id === id);
    if (!v) return '';

    const corVerde = '#22c55e';

    return `
      <!-- Header -->
      <div class="card mb-16" style="background:linear-gradient(135deg,rgba(34,197,94,0.12),rgba(34,197,94,0.04));border-color:rgba(34,197,94,0.3);">
        <div style="display:flex;align-items:flex-start;gap:16px;">
          <div style="font-size:40px;flex-shrink:0;">${v.emoji}</div>
          <div>
            <h2 style="font-size:22px;font-weight:800;color:${corVerde};letter-spacing:-0.5px;">${v.nome}</h2>
            <p style="font-size:15px;color:var(--text-primary);line-height:1.6;margin-top:4px;font-weight:500;">${v.descricao}</p>
          </div>
        </div>
      </div>

      <!-- Chaves (destaque verde como na cartilha) -->
      <div class="card mb-16">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-tertiary);margin-bottom:14px;">🔑 Chaves</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${v.chaves.map(c => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#22c55e;border-radius:var(--r-md);">
              <span style="font-size:12px;font-weight:800;color:rgba(0,0,0,0.6);flex-shrink:0;background:rgba(0,0,0,0.15);width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;">CHAVE ${c.numero}</span>
              <span style="font-size:13.5px;font-weight:700;color:white;">${c.texto}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 3 colunas de comportamentos -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px;" class="comportamentos-grid">

        <!-- Aceitáveis -->
        <div class="card" style="padding:18px;">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#22c55e;margin-bottom:12px;display:flex;align-items:center;gap:5px;">
            <i data-lucide="check-circle" style="width:13px;height:13px;"></i> Comportamentos Aceitáveis
          </div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:8px;font-style:italic;">O básico esperado</div>
          <ol style="display:flex;flex-direction:column;gap:6px;padding-left:16px;list-style:decimal;">
            ${v.comportamentos_aceitaveis.map(b => `
              <li style="font-size:12.5px;color:var(--text-secondary);line-height:1.5;">${b}</li>
            `).join('')}
          </ol>
        </div>

        <!-- Puníveis -->
        <div class="card" style="padding:18px;border-color:rgba(239,68,68,0.2);">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--red);margin-bottom:12px;display:flex;align-items:center;gap:5px;">
            <i data-lucide="x-circle" style="width:13px;height:13px;"></i> Comportamentos Passíveis de Punição
          </div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:8px;font-style:italic;">O inegociável</div>
          <ol style="display:flex;flex-direction:column;gap:6px;padding-left:16px;list-style:decimal;">
            ${v.comportamentos_punitivos.map(b => `
              <li style="font-size:12.5px;color:var(--text-secondary);line-height:1.5;">${b}</li>
            `).join('')}
          </ol>
        </div>

        <!-- Extraordinárias -->
        <div class="card" style="padding:18px;border-color:rgba(245,158,11,0.2);background:rgba(245,158,11,0.03);">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--amber);margin-bottom:12px;display:flex;align-items:center;gap:5px;">
            <i data-lucide="star" style="width:13px;height:13px;"></i> Atitudes Extraordinárias Recompensadas
          </div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:8px;font-style:italic;">Vai além do esperado</div>
          <ol style="display:flex;flex-direction:column;gap:6px;padding-left:16px;list-style:decimal;">
            ${v.atitudes_extraordinarias.map(b => `
              <li style="font-size:12.5px;color:var(--text-secondary);line-height:1.5;">${b}</li>
            `).join('')}
          </ol>
        </div>

      </div>

      <!-- Perguntas relacionadas -->
      <div class="card">
        <div style="font-size:13px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:6px;color:var(--brand);">
          <i data-lucide="help-circle" style="width:14px;height:14px;"></i> Perguntas para o Acompanhamento
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${Object.values(AppData.perguntas).flat()
            .filter(p => p.valores?.includes(v.id))
            .map(p => `
              <div style="padding:10px 14px;background:var(--bg-elevated);border-radius:var(--r-md);border-left:2px solid ${corVerde};font-size:13.5px;color:var(--text-secondary);">
                ${p.texto}
              </div>
            `).join('') || `<div style="color:var(--text-tertiary);font-size:13px;">Perguntas sobre este valor aparecem automaticamente nos encontros.</div>`}
        </div>
      </div>
    `;
  }
};

// ============================================================
// CARTILHA.JS — Fiel ao documento "O Jeito LINKCE de Ser"
// ============================================================

Pages.Cartilha = {
  _secaoAtiva: null,

  render(root) {
    this._secaoAtiva = this._secaoAtiva || AppData.cartilha.secoes[0].id;

    root.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-header-title">${AppData.cartilha.titulo}</h1>
          <p class="page-header-subtitle">${AppData.cartilha.subtitulo}</p>
        </div>
      </div>

      <!-- Frase de destaque da cartilha -->
      <div class="card mb-20" style="background:linear-gradient(135deg,#16a34a,#22c55e);border:none;text-align:center;padding:20px 32px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.7);margin-bottom:6px;">O Jeito LINKCE de Ser</div>
        <div style="font-size:18px;font-weight:800;color:white;letter-spacing:-0.3px;">"${AppData.cartilha.frase}"</div>
      </div>

      <div style="display:grid;grid-template-columns:220px 1fr;gap:20px;align-items:start;">

        <!-- Sumário -->
        <div style="position:sticky;top:80px;">
          <div class="card" style="padding:12px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-tertiary);margin-bottom:10px;padding:0 4px;">Seções</div>
            ${AppData.cartilha.secoes.map(s => `
              <div onclick="Pages.Cartilha._goSecao('${s.id}')" id="cartilha-menu-${s.id}"
                style="display:flex;align-items:center;gap:8px;padding:9px 8px;border-radius:var(--r-md);cursor:pointer;transition:all .2s;
                  background:${this._secaoAtiva===s.id?'rgba(34,197,94,0.1)':'transparent'};
                  color:${this._secaoAtiva===s.id?'#22c55e':'var(--text-secondary)'};">
                <i data-lucide="${s.icone}" style="width:14px;height:14px;flex-shrink:0;"></i>
                <span style="font-size:13px;font-weight:${this._secaoAtiva===s.id?'700':'500'};">${s.titulo}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Conteúdo -->
        <div id="cartilha-content" class="fade-in">
          ${this._renderSecao(this._secaoAtiva)}
        </div>

      </div>
    `;
    App.initLucide();
  },

  _goSecao(id) {
    this._secaoAtiva = id;
    document.querySelectorAll('[id^="cartilha-menu-"]').forEach(el => {
      const ativo = el.id === `cartilha-menu-${id}`;
      el.style.background = ativo ? 'rgba(34,197,94,0.1)' : 'transparent';
      el.style.color = ativo ? '#22c55e' : 'var(--text-secondary)';
      el.querySelector('span').style.fontWeight = ativo ? '700' : '500';
    });
    const content = document.getElementById('cartilha-content');
    content.className = 'fade-in';
    content.innerHTML = this._renderSecao(id);
    App.initLucide();
  },

  _renderSecao(id) {
    const secao = AppData.cartilha.secoes.find(s => s.id === id);
    if (!secao) return '';

    // Seção de identidade
    if (id === 'identidade') return this._renderIdentidade();

    // Seções de valores — buscar valor correspondente
    const valor = AppData.valores.find(v => v.id === secao.valor_id);
    if (valor) return this._renderValorSecao(valor);

    return '';
  },

  _renderIdentidade() {
    return `
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <i data-lucide="building-2" style="width:14px;height:14px;color:#22c55e;"></i>
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#22c55e;">Identidade LINKCE</span>
        </div>
        <h2 style="font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:24px;">Quem Somos</h2>

        <!-- Propósito, Missão, Visão -->
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">
          ${[
            { label: 'Propósito', texto: AppData.identidade.proposito, cor: '#22c55e' },
            { label: 'Missão', texto: AppData.identidade.missao, cor: '#22c55e' },
            { label: 'Visão', texto: AppData.identidade.visao, cor: '#22c55e' }
          ].map(item => `
            <div class="card" style="padding:16px 20px;border-left:4px solid ${item.cor};">
              <div style="font-size:12px;font-weight:700;color:${item.cor};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${item.label}</div>
              <div style="font-size:15px;color:var(--text-primary);font-weight:500;line-height:1.6;">${item.texto}</div>
            </div>
          `).join('')}
        </div>

        <!-- Valores -->
        <div class="card mb-16">
          <div style="font-size:13px;font-weight:700;margin-bottom:16px;">Nossos 5 Valores Fundamentais</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${AppData.valores.map((v, i) => `
              <div onclick="Pages.Cartilha._goSecao('${AppData.cartilha.secoes.find(s=>s.valor_id===v.id)?.id||''}')"
                style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:var(--r-md);cursor:pointer;transition:all .2s;"
                onmouseenter="this.style.background='rgba(34,197,94,0.12)'" onmouseleave="this.style.background='rgba(34,197,94,0.06)'">
                <span style="font-size:11px;font-weight:800;color:#22c55e;background:rgba(34,197,94,0.15);padding:2px 6px;border-radius:4px;">0${i+1}</span>
                <span style="font-size:20px;">${v.emoji}</span>
                <span style="font-size:14px;font-weight:700;color:var(--text-primary);">${v.nome}</span>
                <span style="margin-left:auto;font-size:12.5px;color:var(--text-tertiary);">${v.descricao.substring(0,60)}...</span>
                <i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--text-tertiary);flex-shrink:0;"></i>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Frase sobre feedback -->
        <div class="card" style="background:linear-gradient(135deg,#16a34a,#22c55e);border:none;padding:28px;text-align:center;">
          <div style="font-size:15px;font-weight:400;color:rgba(255,255,255,0.8);margin-bottom:4px;">Lembre sempre:</div>
          <div style="font-size:20px;font-weight:800;color:white;line-height:1.5;">"${AppData.identidade.frase_cultura}"</div>
        </div>
      </div>
    `;
  },

  _renderValorSecao(v) {
    return `
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <i data-lucide="${v.icone}" style="width:14px;height:14px;color:#22c55e;"></i>
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#22c55e;">${v.nome}</span>
        </div>
        <h2 style="font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:6px;">${v.nome}</h2>
        <p style="font-size:15px;color:var(--text-secondary);font-weight:500;margin-bottom:24px;">${v.descricao}</p>

        <!-- Chaves em verde, exatamente como na cartilha -->
        <div class="card mb-16">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-tertiary);margin-bottom:14px;">🔑 Chaves</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${v.chaves.map(c => `
              <div style="padding:12px 18px;background:#22c55e;border-radius:var(--r-md);display:flex;align-items:center;gap:12px;">
                <span style="font-size:11px;font-weight:800;color:rgba(0,0,0,0.5);white-space:nowrap;">CHAVE ${c.numero}</span>
                <span style="font-size:14px;font-weight:700;color:white;">— ${c.texto}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Comportamentos Aceitáveis -->
        <div class="card mb-14">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#22c55e;margin-bottom:8px;display:flex;align-items:center;gap:5px;">
            <i data-lucide="check-circle" style="width:13px;height:13px;"></i> Comportamentos Aceitáveis — O básico esperado
          </div>
          <ol style="padding-left:20px;display:flex;flex-direction:column;gap:6px;">
            ${v.comportamentos_aceitaveis.map(b => `<li style="font-size:13.5px;color:var(--text-secondary);line-height:1.6;">${b}</li>`).join('')}
          </ol>
        </div>

        <!-- Passíveis de Punição -->
        <div class="card mb-14" style="border-color:rgba(239,68,68,0.25);">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--red);margin-bottom:8px;display:flex;align-items:center;gap:5px;">
            <i data-lucide="x-circle" style="width:13px;height:13px;"></i> Comportamentos Passíveis de Punição — O inegociável
          </div>
          <ol style="padding-left:20px;display:flex;flex-direction:column;gap:6px;">
            ${v.comportamentos_punitivos.map(b => `<li style="font-size:13.5px;color:var(--text-secondary);line-height:1.6;">${b}</li>`).join('')}
          </ol>
        </div>

        <!-- Atitudes Extraordinárias -->
        <div class="card mb-16" style="border-color:rgba(245,158,11,0.25);background:rgba(245,158,11,0.02);">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--amber);margin-bottom:8px;display:flex;align-items:center;gap:5px;">
            <i data-lucide="star" style="width:13px;height:13px;"></i> Atitudes Extraordinárias Recompensadas
          </div>
          <ol style="padding-left:20px;display:flex;flex-direction:column;gap:6px;">
            ${v.atitudes_extraordinarias.map(b => `<li style="font-size:13.5px;color:var(--text-secondary);line-height:1.6;">${b}</li>`).join('')}
          </ol>
        </div>

        <!-- Nav -->
        <div style="display:flex;justify-content:space-between;padding-top:16px;border-top:1px solid var(--border);">
          ${(() => {
            const secoes = AppData.cartilha.secoes;
            const idx = secoes.findIndex(s => s.valor_id === v.id);
            return `
              ${idx > 0 ? `<button class="btn btn-ghost" onclick="Pages.Cartilha._goSecao('${secoes[idx-1].id}')"><i data-lucide="arrow-left"></i> ${secoes[idx-1].titulo}</button>` : '<div></div>'}
              ${idx < secoes.length-1 ? `<button class="btn btn-primary" onclick="Pages.Cartilha._goSecao('${secoes[idx+1].id}')">${secoes[idx+1].titulo} <i data-lucide="arrow-right"></i></button>` : '<div></div>'}
            `;
          })()}
        </div>
      </div>
    `;
  }
};
Pages.Agenda = {
  async render(root) {
    const colaboradores = await DB.Colaboradores.getAll();
    const reunioes = await DB.Reunioes.getAll();

    // Gerar reuniões previstas (baseadas na data de admissão)
    const previstas = [];
    colaboradores.filter(c => c.status !== 'concluido').forEach(c => {
      // admissao not needed with dynamic freq

      // Dynamic: only one next meeting per collaborator
      const rr2 = reunioes.filter(r => r.colaboradorId === c.id && r.status === 'concluida');
      const tipoN = rr2.length === 0 ? 'primeiro' : c.status === 'encerrar' ? 'encerramento' : 'acompanhamento';
      const tmplN = AppData.templates_encontro.find(t => t.tipo === tipoN) || AppData.templates_encontro[1];
      const dtN = Utils.proximaData(c, reunioes);
      previstas.push({ colaborador: c, encontro: tmplN, dataPrevista: dtN, numProximo: rr2.length + 1 });
    });

    previstas.sort((a, b) => a.dataPrevista - b.dataPrevista);
    const hoje = new Date();
    const atrasadas = previstas.filter(p => p.dataPrevista < hoje);
    const proximas = previstas.filter(p => p.dataPrevista >= hoje).slice(0, 10);

    root.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-header-title">Agenda</h1>
          <p class="page-header-subtitle">Próximas reuniões e encontros previstos</p>
        </div>
      </div>

      ${atrasadas.length > 0 ? `
        <div class="card mb-20" style="border-color:var(--red);background:var(--red-soft);">
          <div style="font-size:13.5px;font-weight:700;color:var(--red);margin-bottom:12px;display:flex;align-items:center;gap:6px;">
            <i data-lucide="alert-circle" style="width:16px;height:16px;"></i>
            ${atrasadas.length} encontro${atrasadas.length>1?'s':''} atrasado${atrasadas.length>1?'s':''}
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${atrasadas.map(p => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-surface);border-radius:var(--r-md);flex-wrap:wrap;gap:8px;">
                <div style="display:flex;align-items:center;gap:10px;">
                  ${Utils.avatarHtml(p.colaborador, 32)}
                  <div>
                    <div style="font-size:13.5px;font-weight:600;">${Utils.sanitize(p.colaborador.nome)}</div>
                    <div style="font-size:12px;color:var(--red);">${p.encontro.titulo} · Previsto para ${Utils.formatDate(p.dataPrevista)}</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-danger" onclick="App.navigate('reuniao',{colaboradorId:'${p.colaborador.id}',tipoEncontro:'${p.encontro.tipo}',numReuniao:${p.numProximo}})">
                  <i data-lucide="play"></i> Iniciar Agora
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="grid-2">
        <div class="card">
          <div class="section-header">
            <div class="section-title"><i data-lucide="calendar-check"></i> Próximos Encontros</div>
          </div>
          ${proximas.length === 0 ? `
            <div class="empty-state" style="padding:30px 0;">
              <div class="empty-state-icon"><i data-lucide="calendar-check"></i></div>
              <h3>Tudo em dia!</h3>
              <p>Nenhuma reunião pendente no momento.</p>
            </div>
          ` : `
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${proximas.map(p => {
                const diasRestantes = Math.ceil((p.dataPrevista - hoje) / 86400000);
                const urgente = diasRestantes <= 5;
                const corEnc = p.encontro.tipo==='primeiro'?'#6366f1':p.encontro.tipo==='encerramento'?'#f59e0b':'#10b981';
                return `
                  <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-elevated);border-radius:var(--r-lg);border-left:3px solid ${urgente?'var(--amber)':corEnc};">
                    <div style="text-align:center;min-width:48px;">
                      <div style="font-size:18px;font-weight:800;color:${urgente?'var(--amber)':corEnc};">${diasRestantes}</div>
                      <div style="font-size:10px;color:var(--text-tertiary);">dias</div>
                    </div>
                    <div style="flex:1;min-width:0;">
                      <div style="font-size:13.5px;font-weight:600;">${Utils.sanitize(p.colaborador.nome)}</div>
                      <div style="font-size:12px;color:var(--text-tertiary);">${p.encontro.titulo} · ${Utils.formatDate(p.dataPrevista)}</div>
                      ${p.colaborador.padrinho?`<div style="font-size:11px;color:#22c55e;">❤️ ${Utils.sanitize(p.colaborador.padrinho)}</div>`:''}
                    </div>
                    <button class="btn btn-sm btn-primary" style="background:${corEnc};" onclick="App.navigate('reuniao',{colaboradorId:'${p.colaborador.id}',tipoEncontro:'${p.encontro.tipo}',numReuniao:${p.numProximo}})">
                      <i data-lucide="play"></i>
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <div class="card">
          <div class="section-header">
            <div class="section-title"><i data-lucide="check-circle-2"></i> Realizadas Recentemente</div>
          </div>
          ${(() => {
            const recentes = reunioes
              .filter(r => r.status === 'concluida')
              .sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .slice(0, 5);
            if (!recentes.length) return `<div class="empty-state" style="padding:30px 0;"><div class="empty-state-icon"><i data-lucide="check-circle"></i></div><h3>Nenhuma reunião realizada</h3></div>`;
            return recentes.map(r => {
              const col = colaboradores.find(c => c.id === r.colaboradorId);
              const tipoR = r.tipo || 'acompanhamento';
          const enc = { titulo: tipoR==='primeiro'?'1º Encontro':tipoR==='encerramento'?'Encerramento':`Acomp. #${r.numReuniao||r.numEncontro||''}`, cor: tipoR==='primeiro'?'#6366f1':tipoR==='encerramento'?'#f59e0b':'#10b981' };
              return `
                <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-elevated);border-radius:var(--r-md);margin-bottom:8px;">
                  ${col ? Utils.avatarHtml(col, 32) : ''}
                  <div style="flex:1;">
                    <div style="font-size:13px;font-weight:600;">${col ? Utils.sanitize(col.nome) : '—'}</div>
                    <div style="font-size:12px;color:var(--text-tertiary);">${enc?.titulo} · ${Utils.timeAgo(r.updatedAt)}</div>
                  </div>
                  <span class="badge badge-green" style="font-size:10.5px;">✓</span>
                </div>
              `;
            }).join('');
          })()}
        </div>
      </div>
    `;

    App.initLucide();
  }
};

// ============================================================
// REUNIOES.JS — Histórico
// ============================================================
Pages.Reunioes = {
  async render(root) {
    const reunioes = (await DB.Reunioes.getAll()).sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt));
    const colaboradores = await DB.Colaboradores.getAll();

    root.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-header-title">Histórico de Reuniões</h1>
          <p class="page-header-subtitle">${reunioes.length} reuniões registradas</p>
        </div>
      </div>

      <div class="card">
        ${reunioes.length === 0 ? `
          <div class="empty-state"><div class="empty-state-icon"><i data-lucide="message-square"></i></div><h3>Nenhuma reunião realizada</h3><p>Inicie um acompanhamento para registrar reuniões.</p></div>
        ` : `
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid var(--border);">
                <th style="text-align:left;padding:10px 12px;font-size:11.5px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;">Colaborador</th>
                <th style="text-align:left;padding:10px 12px;font-size:11.5px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;">Encontro</th>
                <th style="text-align:left;padding:10px 12px;font-size:11.5px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;">Data</th>
                <th style="text-align:left;padding:10px 12px;font-size:11.5px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;">Status</th>
                <th style="text-align:left;padding:10px 12px;font-size:11.5px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;">Duração</th>
                <th style="padding:10px 12px;"></th>
              </tr>
            </thead>
            <tbody>
              ${reunioes.map(r => {
                const col = colaboradores.find(c => c.id === r.colaboradorId);
                const tipoR = r.tipo || 'acompanhamento';
          const enc = { titulo: tipoR==='primeiro'?'1º Encontro':tipoR==='encerramento'?'Encerramento':`Acomp. #${r.numReuniao||r.numEncontro||''}`, cor: tipoR==='primeiro'?'#6366f1':tipoR==='encerramento'?'#f59e0b':'#10b981' };
                return `
                  <tr style="border-bottom:1px solid var(--border);transition:background .15s;" onmouseenter="this.style.background='var(--bg-elevated)'" onmouseleave="this.style.background=''">
                    <td style="padding:12px;">
                      <div style="display:flex;align-items:center;gap:8px;">
                        ${col ? Utils.avatarHtml(col, 32) : '<div style="width:32px;height:32px;border-radius:50%;background:var(--bg-elevated);"></div>'}
                        <span style="font-size:13.5px;font-weight:600;">${col ? Utils.sanitize(col.nome) : '—'}</span>
                      </div>
                    </td>
                    <td style="padding:12px;"><span class="badge" style="background:${enc?.cor||'var(--brand)'}22;color:${enc?.cor||'var(--brand)'};">${enc?.titulo||'—'}</span></td>
                    <td style="padding:12px;font-size:13px;color:var(--text-secondary);">${Utils.formatDate(r.updatedAt)}</td>
                    <td style="padding:12px;">${r.status==='concluida'?'<span class="badge badge-green">Concluída</span>':'<span class="badge badge-amber">Pendente</span>'}</td>
                    <td style="padding:12px;font-size:13px;color:var(--text-secondary);">${r.duracao ? Utils.formatTimer(r.duracao) : '—'}</td>
                    <td style="padding:12px;text-align:right;">
                      ${col ? `<button class="btn btn-ghost btn-sm" onclick="App.navigate('colaborador',{id:'${col.id}'})"><i data-lucide="eye"></i></button>` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
    App.initLucide();
  }
};

// ============================================================
// EVOLUCAO.JS
// ============================================================
Pages.Evolucao = {
  async render(root) {
    const colaboradores = await DB.Colaboradores.getAll();
    const todasReunioes = await DB.Reunioes.getAll();
    const reunioes = todasReunioes.filter(r => r.status === 'concluida');

    root.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-header-title">Evolução</h1>
          <p class="page-header-subtitle">Análise de desenvolvimento dos colaboradores</p>
        </div>
      </div>

      <div class="stat-grid mb-24">
        ${this._statCard('Total de Colaboradores', colaboradores.length, 'users', 'var(--brand)', 'var(--brand-soft)')}
        ${this._statCard('Reuniões Realizadas', reunioes.length, 'check-circle', 'var(--green)', 'var(--green-soft)')}
        ${this._statCard('Ciclos Completos', colaboradores.filter(c=>{const r=reunioes.filter(r=>r.colaboradorId===c.id);return r.length>=4;}).length, 'award', 'var(--amber)', 'var(--amber-soft)')}
        ${this._statCard('Média de Indicadores', (() => {
          const indAll = reunioes.filter(r=>r.indicadores).flatMap(r=>Object.values(r.indicadores));
          return indAll.length ? (indAll.reduce((a,b)=>a+b,0)/indAll.length).toFixed(1) : '—';
        })(), 'star', 'var(--purple)', 'var(--purple-soft)')}
      </div>

      <div class="grid-2 mb-20">
        <div class="card">
          <div class="section-header"><div class="section-title"><i data-lucide="bar-chart-2"></i> Encontros por Tipo</div></div>
          <div style="height:220px;position:relative;"><canvas id="chart-enc-tipo"></canvas></div>
        </div>
        <div class="card">
          <div class="section-header"><div class="section-title"><i data-lucide="trending-up"></i> Média de Indicadores por Encontro</div></div>
          <div style="height:220px;position:relative;"><canvas id="chart-ind-enc"></canvas></div>
        </div>
      </div>

      <!-- Lista de colaboradores com progresso -->
      <div class="card">
        <div class="section-header"><div class="section-title"><i data-lucide="users"></i> Progresso por Colaborador</div></div>
        ${colaboradores.length === 0 ? `<div class="empty-state" style="padding:40px 0;"><div class="empty-state-icon"><i data-lucide="users"></i></div><h3>Sem colaboradores</h3></div>` :
        colaboradores.map(c => {
          const rr = reunioes.filter(r => r.colaboradorId === c.id);
          const totalRef = Math.max(rr.length + 1, 4); // referência dinâmica
          const prog = Math.min((rr.length / totalRef) * 100, 100);
          const mediaInd = rr.filter(r=>r.indicadores).flatMap(r=>Object.values(r.indicadores).filter(v=>v>0));
          const media = mediaInd.length ? mediaInd.reduce((a,b)=>a+b,0)/mediaInd.length : 0;
          const hoje = new Date();
          const proxima = Utils.proximaData(c, todasReunioes);
          const pendente = proxima <= hoje && c.status !== 'concluido';
          return `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--r-lg);cursor:pointer;transition:background .15s;${pendente?'border-left:2px solid var(--amber);':''}"
              onclick="App.navigate('colaborador',{id:'${c.id}'})" onmouseenter="this.style.background='var(--bg-elevated)'" onmouseleave="this.style.background=''">
              ${Utils.avatarHtml(c, 36)}
              <div style="flex:1;min-width:0;">
                <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                  <div>
                    <span style="font-size:13.5px;font-weight:600;">${Utils.sanitize(c.nome)}</span>
                    ${c.padrinho?`<span style="font-size:11px;color:#22c55e;margin-left:8px;">❤️ ${Utils.sanitize(c.padrinho)}</span>`:''}
                  </div>
                  <span style="font-size:12px;color:${pendente?'var(--amber)':'var(--text-tertiary)'};">
                    ${pendente?'⚠️ Pendente · ':''}${rr.length} encontro${rr.length!==1?'s':''} · ${media>0?media.toFixed(1)+' ★':'sem indicadores'}
                  </span>
                </div>
                <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:5px;">A cada ${c.frequenciaDias||15} dias · ${Utils.sanitize(c.cargo||'—')}</div>
                <div class="progress"><div class="progress-bar" style="width:${prog}%;background:${c.status==='concluido'?'var(--green)':pendente?'var(--amber)':'var(--brand)'};"></div></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    App.initLucide();
    requestAnimationFrame(() => {
      this._renderChartTipo(reunioes);
      this._renderChartInd(reunioes);
    });
  },

  _statCard(label, value, icon, cor, soft) {
    return `<div class="stat-card" style="--stat-color:${cor};--stat-soft:${soft};"><div class="stat-icon"><i data-lucide="${icon}"></i></div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`;
  },

  _renderChartTipo(reunioes) {
    const canvas = document.getElementById('chart-enc-tipo');
    if (!canvas || !window.Chart) return;
    const tiposMap = { primeiro: '1º Encontro', acompanhamento: 'Acompanhamento', encerramento: 'Encerramento' };
    const tiposKeys = ['primeiro','acompanhamento','encerramento'];
    const dados = tiposKeys.map(t => reunioes.filter(r => (r.tipo||'acompanhamento') === t).length);
    const labels = ['1º Encontro','Acompanhamento','Encerramento'];
    const cores = ['#6366f1','#10b981','#f59e0b'];
    const isDark = DB.Config.getTema() === 'dark';
    new Chart(canvas, {
      type: 'bar', data: { labels, datasets: [{ data: dados, backgroundColor: cores.map(c=>c+'aa'), borderColor: cores, borderWidth: 2, borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: isDark?'#64748b':'#94a3b8', stepSize: 1 }, grid: { color: isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.05)' } }, x: { ticks: { color: isDark?'#64748b':'#94a3b8' }, grid: { display: false } } } }
    });
  },

  _renderChartInd(reunioes) {
    const canvas = document.getElementById('chart-ind-enc');
    if (!canvas || !window.Chart) return;
    const isDark = DB.Config.getTema() === 'dark';
    const campos = ['integracao','adaptacao','cultura','equipe','seguranca'];
    const allReunioes = reunioes.filter(r => r.indicadores);
    const labels = allReunioes.map(r => r.tipo==='primeiro'?'1º Enc.':r.tipo==='encerramento'?'Enc.':'Acomp.');
    const datasets = campos.map((c,i) => {
      const cores = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6'];
      const data = allReunioes.map(r => {
        const rr = [r].filter(x => x.indicadores);
        const vals = rr.map(x => x.indicadores[c]||0);
        return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
      });
      return { label: c, data, borderColor: cores[i], tension: 0.4, pointRadius: 4, fill: false, borderWidth: 2 };
    });
    new Chart(canvas, {
      type: 'line', data: { labels, datasets },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 5, ticks: { color: isDark?'#64748b':'#94a3b8' }, grid: { color: isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.05)' } }, x: { ticks: { color: isDark?'#64748b':'#94a3b8' }, grid: { display: false } } }, plugins: { legend: { display: false } } }
    });
  }
};

// ============================================================
// RELATORIOS.JS
// ============================================================
Pages.Relatorios = {
  async render(root, params = {}) {
    const colaboradores = await DB.Colaboradores.getAll();
    const todasReunioes = await DB.Reunioes.getAll();

    root.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-header-title">Relatórios</h1>
          <p class="page-header-subtitle">Exportar dados e gerar documentos PDF</p>
        </div>
      </div>

      <div class="grid-2 mb-24">
        <div class="card">
          <div style="font-size:15px;font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:8px;"><i data-lucide="file-text" style="width:16px;height:16px;color:var(--brand);"></i> Relatório Individual</div>
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;line-height:1.6;">Gera um PDF completo com histórico, indicadores, radar cultural e insights de um colaborador.</p>
          <div class="form-group">
            <label class="form-label">Selecionar Colaborador</label>
            <select class="form-input form-select" id="rel-colaborador">
              <option value="">— Escolha —</option>
              ${colaboradores.map(c => `<option value="${c.id}" ${params.colaboradorId===c.id?'selected':''}>${Utils.sanitize(c.nome)}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-primary w-full" onclick="Pages.Relatorios._gerarPDF()">
            <i data-lucide="download"></i> Gerar PDF
          </button>
        </div>

        <div class="card">
          <div style="font-size:15px;font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:8px;"><i data-lucide="database" style="width:16px;height:16px;color:var(--green);"></i> Backup de Dados</div>
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;line-height:1.6;">Exporte todos os dados da plataforma em JSON para backup ou importação em outro dispositivo.</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <button class="btn btn-success w-full" onclick="Pages.Relatorios._exportarTodos()">
              <i data-lucide="upload-cloud"></i> Exportar Todos os Dados
            </button>
            <label class="btn btn-ghost w-full" style="cursor:pointer;">
              <i data-lucide="download-cloud"></i> Importar Dados
              <input type="file" accept=".json" style="display:none;" onchange="Pages.Relatorios._importar(event)">
            </label>
          </div>
        </div>
      </div>

      <!-- Lista de relatórios geráveis -->
      <div class="card">
        <div class="section-header"><div class="section-title"><i data-lucide="files"></i> Relatórios por Colaborador</div></div>
        ${colaboradores.length === 0 ? `<div class="empty-state" style="padding:40px 0;"><div class="empty-state-icon"><i data-lucide="file-x"></i></div><h3>Sem colaboradores</h3></div>` :
        colaboradores.map(c => {
          const reunioes = todasReunioes.filter(r => r.colaboradorId === c.id && r.status === 'concluida');
          return `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border-radius:var(--r-md);margin-bottom:6px;background:var(--bg-elevated);">
              <div style="display:flex;align-items:center;gap:10px;">
                ${Utils.avatarHtml(c, 36)}
                <div>
                  <div style="font-size:13.5px;font-weight:600;">${Utils.sanitize(c.nome)}</div>
                  <div style="font-size:12px;color:var(--text-tertiary);">${reunioes.length} encontros · ${Utils.sanitize(c.cargo||'—')}</div>
                </div>
              </div>
              <button class="btn btn-ghost btn-sm" onclick="Pages.Relatorios._gerarPDFColaborador('${c.id}')">
                <i data-lucide="file-down"></i> PDF
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    App.initLucide();
  },

  async _gerarPDF() {
    const id = document.getElementById('rel-colaborador')?.value;
    if (!id) { Utils.toast('Selecione um colaborador', 'error'); return; }
    await this._gerarPDFColaborador(id);
  },

  async _gerarPDFColaborador(id) {
    if (!window.jspdf) { Utils.toast('jsPDF não disponível. Verifique a conexão com a internet.', 'error'); return; }
    const colaborador = await DB.Colaboradores.getById(id);
    if (!colaborador) return;

    const reunioes = (await DB.Reunioes.getByColaborador(id))
      .filter(r => r.status === 'concluida')
      .sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt));

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210; const M = 20;

    const addPage = () => { doc.addPage(); return 20; };
    const checkY = (y, needed = 20) => y + needed > 275 ? addPage() : y;

    // ─── CAPA ──────────────────────────────────────────────
    // Fundo verde LINKCE
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 0, W, 60, 'F');

    doc.setTextColor(255,255,255);
    doc.setFontSize(9);
    doc.setFont('helvetica','normal');
    doc.text('LINKCE · a internet mais amada · Comitê de Cultura', M, 14);

    doc.setFontSize(20);
    doc.setFont('helvetica','bold');
    doc.text('Relatório de Acompanhamento Cultural', M, 30);

    doc.setFontSize(10);
    doc.setFont('helvetica','normal');
    doc.text(`${AppData.identidade.missao}`, M, 42);
    doc.text(`Gerado em ${Utils.formatDate(new Date(), 'dd/mm/yyyy')}`, M, 52);

    // ─── DADOS DO COLABORADOR ──────────────────────────────
    let y = 75;
    doc.setTextColor(30,30,30);
    doc.setFontSize(14);
    doc.setFont('helvetica','bold');
    doc.text(colaborador.nome, M, y); y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica','normal');
    doc.setTextColor(80,80,80);

    const infoLine1 = [
      colaborador.cargo   ? `Cargo: ${colaborador.cargo}`   : null,
      colaborador.equipe  ? `Equipe: ${colaborador.equipe}` : null,
      colaborador.gestor  ? `Gestor: ${colaborador.gestor}` : null,
    ].filter(Boolean).join('   |   ');
    if (infoLine1) { doc.text(infoLine1, M, y); y += 6; }

    const infoLine2 = [
      colaborador.padrinho ? `Padrinho/Madrinha: ${colaborador.padrinho}` : null,
      `Admissão: ${Utils.formatDate(colaborador.dataAdmissao)}`,
      `Frequência: a cada ${colaborador.frequenciaDias||15} dias`,
    ].filter(Boolean).join('   |   ');
    if (infoLine2) { doc.text(infoLine2, M, y); y += 6; }

    if (colaborador.cidade || colaborador.email) {
      const infoLine3 = [
        colaborador.cidade ? `Cidade: ${colaborador.cidade}` : null,
        colaborador.email  ? `E-mail: ${colaborador.email}`  : null,
      ].filter(Boolean).join('   |   ');
      doc.text(infoLine3, M, y); y += 6;
    }

    y += 4;
    // Linha separadora
    doc.setDrawColor(230,230,230);
    doc.line(M, y, W-M, y); y += 8;

    // ─── PROPÓSITO, MISSÃO, VISÃO ─────────────────────────
    doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(34,197,94);
    doc.text('Identidade LINKCE', M, y); y += 7;
    doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(60,60,60);

    const identLines = [
      `Propósito: ${AppData.identidade.proposito}`,
      `Missão: ${AppData.identidade.missao}`,
      `Visão: ${AppData.identidade.visao}`,
    ];
    identLines.forEach(l => {
      const lines = doc.splitTextToSize(l, W - M*2);
      y = checkY(y, lines.length*5+2);
      doc.text(lines, M, y); y += lines.length*5 + 2;
    });
    y += 4;
    doc.line(M, y, W-M, y); y += 8;

    // ─── RESUMO DOS ENCONTROS ─────────────────────────────
    doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(30,30,30);
    doc.text(`Histórico de Encontros (${reunioes.length} realizados)`, M, y); y += 8;

    reunioes.forEach((r, idx) => {
      y = checkY(y, 30);
      const tipoRel = r.tipo || 'acompanhamento';
      const enc = tipoRel==='primeiro' ? '1º Encontro'
                : tipoRel==='encerramento' ? 'Encerramento do Ciclo'
                : `Acompanhamento #${r.numReuniao||idx+1}`;

      // Sub-header do encontro
      doc.setFillColor(245,247,250);
      doc.rect(M, y-4, W-M*2, 10, 'F');
      doc.setFontSize(9.5); doc.setFont('helvetica','bold'); doc.setTextColor(34,197,94);
      doc.text(`${enc}`, M+2, y+2);
      doc.setFont('helvetica','normal'); doc.setTextColor(120,120,120);
      doc.text(`${Utils.formatDate(r.createdAt, 'dd/mm/yyyy')}${r.duracao?'  ·  Duração: '+Utils.formatTimer(r.duracao):''}`, W-M-40, y+2);
      y += 12;

      // Insight
      if (r.insight) {
        y = checkY(y, 14);
        doc.setFontSize(8); doc.setFont('helvetica','bolditalic'); doc.setTextColor(80,80,80);
        const ilines = doc.splitTextToSize(`💡 ${r.insight}`, W-M*2-4);
        doc.text(ilines, M+2, y); y += ilines.length*4.5 + 2;
      }

      // Indicadores
      if (r.indicadores) {
        y = checkY(y, 10);
        const labels = { integracao:'Integração', adaptacao:'Adaptação', cultura:'Cultura', equipe:'Equipe', seguranca:'Segurança' };
        doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(100,100,100);
        const indStr = Object.entries(labels).map(([k,l]) => `${l}: ${r.indicadores[k]||0}/5`).join('  ·  ');
        doc.text(indStr, M+2, y); y += 6;
      }

      // Radar de valores
      if (r.radarValores && Object.keys(r.radarValores).some(k => r.radarValores[k] > 0)) {
        y = checkY(y, 8);
        doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(34,197,94);
        const radarStr = AppData.valores
          .filter(v => (r.radarValores[v.id]||0) > 0)
          .map(v => `${v.nome}: ${r.radarValores[v.id]}/5`).join('  ·  ');
        if (radarStr) { doc.text(`Radar: ${radarStr}`, M+2, y); y += 6; }
      }

      // Diário
      if (r.diario) {
        const campos = [
          r.diario.observacoes ? `Obs: ${r.diario.observacoes}` : null,
          r.diario.positivos   ? `Positivos: ${r.diario.positivos}` : null,
          r.diario.atencao     ? `Atenção: ${r.diario.atencao}` : null,
          r.diario.proximos    ? `Próximos passos: ${r.diario.proximos}` : null,
        ].filter(Boolean);
        campos.forEach(campo => {
          y = checkY(y, 8);
          doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80);
          const dlines = doc.splitTextToSize(campo, W-M*2-4);
          doc.text(dlines, M+2, y); y += dlines.length*4 + 2;
        });
      }

      // Respostas (primeiras 3 com resposta)
      if (r.respostas?.length) {
        const comResp = r.respostas.filter(res => res.resposta?.trim());
        if (comResp.length > 0) {
          y = checkY(y, 8);
          doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(80,80,80);
          doc.text('Principais respostas:', M+2, y); y += 5;
          comResp.slice(0,3).forEach(res => {
            y = checkY(y, 10);
            doc.setFont('helvetica','bolditalic'); doc.setTextColor(100,100,100);
            const qlines = doc.splitTextToSize(`P: ${res.pergunta}`, W-M*2-6);
            doc.text(qlines, M+4, y); y += qlines.length*3.8;
            doc.setFont('helvetica','normal'); doc.setTextColor(50,50,50);
            const alines = doc.splitTextToSize(`R: ${res.resposta}`, W-M*2-6);
            doc.text(alines, M+4, y); y += alines.length*3.8 + 3;
          });
        }
      }

      y += 4;
      if (idx < reunioes.length - 1) {
        doc.setDrawColor(235,235,235);
        doc.line(M, y, W-M, y);
        y += 6;
      }
    });

    // ─── RODAPÉ ───────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(34,197,94);
      doc.rect(0, 285, W, 12, 'F');
      doc.setTextColor(255,255,255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica','normal');
      doc.text(`LINKCE · Comitê de Cultura · ${AppData.identidade.proposito}`, M, 293);
      doc.text(`Página ${i} de ${pageCount}`, W-M, 293, { align:'right' });
    }

    const nomeArq = colaborador.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-');
    doc.save(`relatorio-linkce-${nomeArq}.pdf`);
    Utils.toast('Relatório PDF gerado com sucesso!', 'success');
  },

  async _exportarTodos() {
    try {
      const [colaboradores, reunioes, perguntas] = await Promise.all([
        DB.Colaboradores.getAll(),
        DB.Reunioes.getAll(),
        DB.Perguntas.getAll(),
      ]);
      const data = {
        colaboradores, reunioes, perguntas,
        _exportedAt: new Date().toISOString(),
        _version: '2.0.0-cloud',
      };
      Utils.download(JSON.stringify(data, null, 2), `backup-linkce-${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.json`);
      Utils.toast('Backup exportado!', 'success');
    } catch(e) {
      Utils.toast('Erro ao exportar: ' + (e.message||''), 'error');
    }
  },

  _importar(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        Utils.confirm('Importar Dados', 'Os colaboradores e reuniões deste arquivo serão adicionados à sua conta na nuvem. Deseja continuar?', async () => {
          try {
            let countColab = 0, countReun = 0;
            const idMap = {}; // mapeia ID antigo -> novo ID

            for (const c of (data.colaboradores || [])) {
              const { id: oldId, createdAt, updatedAt, ...rest } = c;
              const salvo = await DB.Colaboradores.save(rest);
              idMap[oldId] = salvo.id;
              countColab++;
            }
            for (const r of (data.reunioes || [])) {
              const novoColabId = idMap[r.colaboradorId];
              if (!novoColabId) continue;
              const { id: oldId, createdAt, updatedAt, ...rest } = r;
              await DB.Reunioes.save({ ...rest, colaboradorId: novoColabId });
              countReun++;
            }
            Utils.toast(`Importado: ${countColab} colaboradores, ${countReun} reuniões!`, 'success');
            App.navigate('dashboard');
          } catch(err) {
            Utils.toast('Erro durante importação: ' + (err.message||''), 'error');
          }
        }, { tipo: 'danger', confirmText: 'Sim, importar' });
      } catch (err) {
        Utils.toast('Arquivo inválido', 'error');
      }
    };
    reader.readAsText(file);
  }
};

// ============================================================
// CONFIGURACOES.JS
// ============================================================
Pages.Configuracoes = {
  async render(root) {
    const config = await DB.Config.get();
    const user = await Auth.getUser();
    const colaboradores = await DB.Colaboradores.getAll();
    const reunioes = await DB.Reunioes.getAll();

    root.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-header-title">Configurações</h1>
          <p class="page-header-subtitle">Personalize sua experiência na plataforma</p>
        </div>
      </div>

      <div style="max-width:640px;display:flex;flex-direction:column;gap:20px;">

        <!-- Conta -->
        <div class="card" style="background:var(--brand-soft);border-color:var(--border-brand);">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;flex-shrink:0;">
              ${Utils.initials(config.nomeUsuario)}
            </div>
            <div>
              <div style="font-size:14px;font-weight:700;">${Utils.sanitize(config.nomeUsuario)}</div>
              <div style="font-size:12.5px;color:var(--text-tertiary);">${Utils.sanitize(user?.email || '')}</div>
            </div>
            <span class="badge badge-green" style="margin-left:auto;"><i data-lucide="cloud" style="width:11px;height:11px;"></i> Conectado</span>
          </div>
        </div>

        <!-- Perfil -->
        <div class="card">
          <div style="font-size:15px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:8px;"><i data-lucide="user-cog" style="width:16px;height:16px;color:var(--brand);"></i> Meu Perfil</div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Seu Nome</label>
              <input type="text" class="form-input" id="cfg-nome" value="${Utils.sanitize(config.nomeUsuario)}">
            </div>
            <div class="form-group">
              <label class="form-label">Cargo / Função</label>
              <input type="text" class="form-input" id="cfg-cargo" value="${Utils.sanitize(config.cargoUsuario)}">
            </div>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-salvar-perfil" onclick="Pages.Configuracoes._salvarPerfil()">
            <i data-lucide="save"></i> Salvar Perfil
          </button>
        </div>

        <!-- Aparência -->
        <div class="card">
          <div style="font-size:15px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:8px;"><i data-lucide="palette" style="width:16px;height:16px;color:var(--purple);"></i> Aparência</div>
          <div style="display:flex;gap:12px;">
            <div onclick="Pages.Configuracoes._setTema('dark')"
              id="tema-dark"
              style="flex:1;padding:16px;border:2px solid ${config.tema==='dark'?'var(--brand)':'var(--border)'};border-radius:var(--r-lg);cursor:pointer;text-align:center;transition:all .2s;">
              <div style="font-size:24px;margin-bottom:6px;">🌙</div>
              <div style="font-size:13.5px;font-weight:600;">Escuro</div>
            </div>
            <div onclick="Pages.Configuracoes._setTema('light')"
              id="tema-light"
              style="flex:1;padding:16px;border:2px solid ${config.tema==='light'?'var(--brand)':'var(--border)'};border-radius:var(--r-lg);cursor:pointer;text-align:center;transition:all .2s;">
              <div style="font-size:24px;margin-bottom:6px;">☀️</div>
              <div style="font-size:13.5px;font-weight:600;">Claro</div>
            </div>
          </div>
        </div>

        <!-- Dados -->
        <div class="card">
          <div style="font-size:15px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:8px;"><i data-lucide="database" style="width:16px;height:16px;color:var(--green);"></i> Dados na Nuvem</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg-elevated);border-radius:var(--r-md);">
              <div>
                <div style="font-size:13.5px;font-weight:600;">Colaboradores</div>
                <div style="font-size:12px;color:var(--text-tertiary);">${colaboradores.length} registros</div>
              </div>
              <span class="badge badge-green">${colaboradores.length}</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg-elevated);border-radius:var(--r-md);">
              <div>
                <div style="font-size:13.5px;font-weight:600;">Reuniões</div>
                <div style="font-size:12px;color:var(--text-tertiary);">${reunioes.length} registros</div>
              </div>
              <span class="badge badge-brand">${reunioes.length}</span>
            </div>
          </div>
          <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('relatorios')">
              <i data-lucide="download"></i> Exportar Backup
            </button>
            <button class="btn btn-danger btn-sm" onclick="Pages.Configuracoes._limparSistema()">
              <i data-lucide="trash-2"></i> Limpar Todos os Dados
            </button>
          </div>
        </div>

        <!-- Sessão -->
        <div class="card">
          <div style="font-size:15px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:8px;"><i data-lucide="shield" style="width:16px;height:16px;color:var(--amber);"></i> Sessão</div>
          <button class="btn btn-ghost btn-sm w-full" style="justify-content:flex-start;color:var(--red);" onclick="App._logout()">
            <i data-lucide="log-out"></i> Sair da Plataforma
          </button>
        </div>

        <!-- Sobre -->
        <div class="card" style="text-align:center;padding:24px;">
          <div style="font-size:28px;margin-bottom:8px;">🧡</div>
          <div style="font-size:15px;font-weight:800;margin-bottom:4px;">Comitê de Cultura</div>
          <div style="font-size:12.5px;color:var(--text-tertiary);">LINKCE · Plataforma de Acompanhamento Cultural · v2.0.0 Cloud</div>
          <div style="font-size:12px;color:var(--text-disabled);margin-top:8px;">Dados sincronizados com Supabase</div>
        </div>

      </div>
    `;

    App.initLucide();
  },

  async _salvarPerfil() {
    const nome = document.getElementById('cfg-nome')?.value?.trim();
    const cargo = document.getElementById('cfg-cargo')?.value?.trim();
    if (!nome) { Utils.toast('Nome é obrigatório', 'error'); return; }

    const btn = document.getElementById('btn-salvar-perfil');
    if (btn) { btn.disabled = true; btn.innerHTML = '<div class="loading-spinner" style="width:14px;height:14px;border-width:2px;"></div> Salvando...'; }

    try {
      await DB.Config.set({ nomeUsuario: nome, cargoUsuario: cargo });
      // Atualizar sidebar
      const strongEl = document.querySelector('.sidebar-user-info strong');
      const smallEl  = document.querySelector('.sidebar-user-info small');
      const avatarEl = document.querySelector('.sidebar-user-avatar');
      if (strongEl) strongEl.textContent = nome;
      if (smallEl)  smallEl.textContent  = cargo;
      if (avatarEl) avatarEl.textContent = Utils.initials(nome);
      Utils.toast('Perfil salvo!', 'success');
    } catch(e) {
      Utils.toast('Erro ao salvar perfil: ' + (e.message||''), 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="save"></i> Salvar Perfil'; App.initLucide(); }
    }
  },

  async _setTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('linkce_tema', tema);
    this._updateTemaUI(tema);
    try { await DB.Config.setTema(tema); } catch(e) {}
    Utils.toast(`Tema ${tema === 'dark' ? 'escuro' : 'claro'} ativado`, 'info');
  },

  _updateTemaUI(tema) {
    ['dark','light'].forEach(t => {
      const el = document.getElementById(`tema-${t}`);
      if (el) el.style.borderColor = t === tema ? 'var(--brand)' : 'var(--border)';
    });
  },

  _limparSistema() {
    Utils.confirm(
      'Limpar Todos os Dados',
      'Esta ação é irreversível. Todos os colaboradores, reuniões e histórico serão apagados permanentemente da nuvem.',
      async () => {
        try {
          const colaboradores = await DB.Colaboradores.getAll();
          for (const c of colaboradores) {
            await DB.Colaboradores.delete(c.id);
          }
          Utils.toast('Sistema limpo.', 'info');
          App.navigate('dashboard');
        } catch(e) {
          Utils.toast('Erro ao limpar dados: ' + (e.message||''), 'error');
        }
      },
      { tipo: 'danger', confirmText: 'Sim, limpar tudo' }
    );
  }
};
