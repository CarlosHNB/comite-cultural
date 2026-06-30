// ============================================================
// DASHBOARD.JS — Página inicial
// Comitê de Cultura - LINKCE
// ============================================================

Pages.Dashboard = {
  _charts: {},

  async render(root) {
    // — Dados base —
    const colaboradores = await DB.Colaboradores.getAll();
    const reunioes      = await DB.Reunioes.getAll();
    const config        = await DB.Config.get();
    const hoje          = new Date();
    const hora          = hoje.getHours();
    const saudacao      = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
    const nomeUsuario   = (config.nomeUsuario || 'Padrinho').split(' ')[0];

    // — Cálculos seguros —
    const ativos    = colaboradores.filter(c => c.status !== 'concluido');
    const concluidos= colaboradores.filter(c => c.status === 'concluido');
    const realizadas= reunioes.filter(r => r.status === 'concluida');

    // Pendentes: ativos cuja próxima data já passou
    const pendentes = ativos.filter(c => {
      try {
        const proxima = Utils.proximaData(c, reunioes);
        return proxima <= hoje;
      } catch(e) { return false; }
    });

    // Agrupamento por situação (substitui etapas fixas)
    const emDia     = ativos.filter(c => !pendentes.find(p => p.id === c.id));
    const primeiroEncontro = ativos.filter(c => {
      const rr = reunioes.filter(r => r.colaboradorId === c.id && r.status === 'concluida');
      return rr.length === 0;
    });

    // Próximo colaborador (mais urgente)
    const proximoColaborador = this._getProximoColaborador(ativos, reunioes, hoje);

    // Tempo médio (dias na empresa, só concluídos)
    const tempoMedio = concluidos.length > 0
      ? Math.round(concluidos.reduce((acc, c) => {
          try { return acc + Utils.daysSince(c.dataAdmissao); } catch(e) { return acc; }
        }, 0) / concluidos.length)
      : 0;

    root.innerHTML = `
      <!-- Boas-vindas -->
      <div class="card mb-24" style="background:linear-gradient(135deg,#4f46e5,#7c3aed,#ec4899);border:none;padding:24px 28px;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
              ${saudacao}, ${Utils.sanitize(nomeUsuario)}! 👋
            </div>
            <div style="color:rgba(255,255,255,0.8);font-size:14px;margin-top:5px;">
              ${ativos.length > 0
                ? `<strong style="color:#fff">${ativos.length}</strong> afilhado${ativos.length > 1 ? 's' : ''} ativo${ativos.length > 1 ? 's' : ''}`
                  + (pendentes.length > 0 ? ` · <strong style="color:#fde68a">⚠️ ${pendentes.length} pendente${pendentes.length > 1 ? 's' : ''}</strong>` : ' · tudo em dia ✓')
                : 'Comece cadastrando seu primeiro afilhado.'}
            </div>
          </div>
          <button class="btn" onclick="App.navigate('novo')"
            style="background:rgba(255,255,255,0.18);color:#fff;border:1px solid rgba(255,255,255,0.3);">
            <i data-lucide="user-plus"></i> Novo Afilhado
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stat-grid mb-24">
        ${this._statCard('Afilhados Ativos',        ativos.length,     'users',         'var(--brand)',  'var(--brand-soft)',  'Em acompanhamento')}
        ${this._statCard('Reuniões Realizadas',      realizadas.length, 'check-circle',  'var(--green)',  'var(--green-soft)',  'Total de encontros')}
        ${this._statCard('Pendentes',                pendentes.length,  'alert-circle',  'var(--amber)',  'var(--amber-soft)',  'Prazo já passou')}
        ${this._statCard('Ciclos Concluídos',        concluidos.length, 'award',         'var(--purple)', 'var(--purple-soft)', 'Acompanhamentos finalizados')}
      </div>

      <!-- Grid principal -->
      <div style="display:grid;grid-template-columns:1fr 380px;gap:20px;align-items:start;" class="dash-grid">

        <!-- Esquerda -->
        <div style="display:flex;flex-direction:column;gap:20px;">

          <!-- Situação dos afilhados -->
          <div class="card">
            <div class="section-header">
              <div class="section-title"><i data-lucide="layout-list"></i> Situação dos Afilhados</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
              ${this._situacaoCard('Aguardando 1º Enc.', primeiroEncontro, '#6366f1')}
              ${this._situacaoCard('Em Dia', emDia, '#10b981')}
              ${this._situacaoCard('Pendentes', pendentes, '#f59e0b')}
            </div>
          </div>

          <!-- Gráfico barras: reuniões por mês -->
          <div class="card">
            <div class="section-header">
              <div class="section-title"><i data-lucide="bar-chart-2"></i> Reuniões por Mês</div>
              <span class="badge badge-brand">Últimos 6 meses</span>
            </div>
            <div style="height:220px;position:relative;">
              <canvas id="chart-reunioes"></canvas>
            </div>
          </div>

          <!-- Gráfico horizontal: valores mais percebidos -->
          <div class="card">
            <div class="section-header">
              <div class="section-title"><i data-lucide="activity"></i> Valores Mais Percebidos</div>
              <span class="badge badge-green">Radar Cultural</span>
            </div>
            <div style="height:200px;position:relative;">
              <canvas id="chart-valores"></canvas>
            </div>
          </div>

        </div>

        <!-- Direita -->
        <div style="display:flex;flex-direction:column;gap:20px;">

          <!-- Card próximo / pendente -->
          ${proximoColaborador
            ? this._proximoCard(proximoColaborador, reunioes, hoje)
            : this._emptyProximo()}

          <!-- Atividade recente -->
          <div class="card">
            <div class="section-header">
              <div class="section-title"><i data-lucide="clock"></i> Atividade Recente</div>
            </div>
            ${this._renderTimeline(realizadas, colaboradores)}
          </div>

          <!-- Tempo médio -->
          ${tempoMedio > 0 ? `
            <div class="card" style="text-align:center;padding:22px;">
              <div style="font-size:34px;font-weight:800;color:var(--brand);letter-spacing:-2px;">${tempoMedio}</div>
              <div style="font-size:11.5px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">
                Dias médios de acompanhamento
              </div>
            </div>` : ''}

        </div>
      </div>
    `;

    // Gráficos depois do DOM estar pronto
    requestAnimationFrame(() => {
      App.initLucide();
      this._renderChartReunioes(reunioes);
      this._renderChartValores(reunioes);
    });
  },

  // ── Helpers de renderização ──────────────────────────────

  _statCard(label, value, icon, cor, soft, desc) {
    return `
      <div class="stat-card" style="--stat-color:${cor};--stat-soft:${soft};">
        <div class="stat-icon"><i data-lucide="${icon}"></i></div>
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
        <div class="text-xs text-muted mt-4">${desc}</div>
      </div>`;
  },

  _situacaoCard(label, lista, cor) {
    const count = lista.length;
    return `
      <div class="card-sm" style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--r-lg);
        padding:14px;cursor:${count > 0 ? 'pointer' : 'default'};"
        onclick="${count > 0 ? "App.navigate('afilhados')" : ''}">
        <div style="width:8px;height:8px;border-radius:50%;background:${cor};margin-bottom:10px;"></div>
        <div style="font-size:26px;font-weight:800;color:${cor};letter-spacing:-1px;">${count}</div>
        <div style="font-size:11.5px;color:var(--text-tertiary);font-weight:600;margin-top:3px;">${label}</div>
        ${count > 0 ? `
          <div style="display:flex;margin-top:10px;">
            ${lista.slice(0, 3).map(c => `
              <div style="width:22px;height:22px;border-radius:50%;background:${Utils.avatarColor(c.nome)};
                border:2px solid var(--bg-elevated);display:flex;align-items:center;justify-content:center;
                font-size:8px;font-weight:700;color:#fff;margin-left:-4px;flex-shrink:0;">
                ${Utils.initials(c.nome)}
              </div>`).join('')}
            ${count > 3 ? `
              <div style="width:22px;height:22px;border-radius:50%;background:var(--bg-hover);
                border:2px solid var(--bg-elevated);display:flex;align-items:center;justify-content:center;
                font-size:8px;color:var(--text-tertiary);font-weight:700;margin-left:-4px;">
                +${count - 3}
              </div>` : ''}
          </div>` : ''}
      </div>`;
  },

  _getProximoColaborador(ativos, reunioes, hoje) {
    if (!ativos.length) return null;
    try {
      return ativos
        .map(c => {
          try {
            const proxima = Utils.proximaData(c, reunioes);
            return { ...c, _proxima: proxima, _diff: proxima - hoje };
          } catch(e) {
            return { ...c, _proxima: hoje, _diff: 0 };
          }
        })
        .sort((a, b) => a._diff - b._diff)[0];
    } catch(e) {
      return ativos[0] || null;
    }
  },

  _proximoCard(colaborador, reunioes, hoje) {
    try {
      const rr = reunioes.filter(r => r.colaboradorId === colaborador.id && r.status === 'concluida');
      const numProximo   = rr.length + 1;
      const tipoProximo  = rr.length === 0 ? 'primeiro'
        : colaborador.status === 'encerrar' ? 'encerramento' : 'acompanhamento';
      const template     = AppData.templates_encontro.find(t => t.tipo === tipoProximo)
                        || AppData.templates_encontro[1];
      const diasEmpresa  = Utils.daysSince(colaborador.dataAdmissao);
      const proxima      = Utils.proximaData(colaborador, reunioes);
      const pendente     = proxima <= hoje;
      const diasDiff     = Math.ceil(Math.abs(proxima - hoje) / 86400000);
      const corMap       = { primeiro:'#6366f1', acompanhamento:'#10b981', encerramento:'#f59e0b' };
      const cor          = corMap[tipoProximo] || '#10b981';

      return `
        <div class="card" style="border:1px solid ${pendente ? 'var(--amber)' : cor+'44'};">
          <div class="section-header">
            <div class="section-title">
              <i data-lucide="${pendente ? 'alert-circle' : 'zap'}"></i>
              ${pendente ? '⚠️ Pendente' : 'Próximo Acompanhamento'}
            </div>
            <span class="badge" style="background:${cor}18;color:${cor};">
              ${template.label} #${numProximo}
            </span>
          </div>

          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
            ${Utils.avatarHtml(colaborador, 44)}
            <div>
              <div style="font-weight:700;font-size:14px;">${Utils.sanitize(colaborador.nome)}</div>
              <div style="font-size:12px;color:var(--text-tertiary);">
                ${Utils.sanitize(colaborador.cargo || '—')} · ${diasEmpresa}d · ${colaborador.frequenciaDias || 15}d/enc.
              </div>
              ${colaborador.padrinho
                ? `<div style="font-size:11.5px;color:${cor};font-weight:600;">❤️ ${Utils.sanitize(colaborador.padrinho)}</div>`
                : ''}
            </div>
          </div>

          <div style="background:var(--bg-elevated);border-radius:var(--r-md);padding:11px 14px;margin-bottom:12px;
            font-size:13px;color:var(--text-secondary);line-height:1.5;">
            <strong style="color:var(--text-primary);display:block;margin-bottom:3px;">Objetivo:</strong>
            ${template.objetivo}
          </div>

          <div style="font-size:12px;color:${pendente ? 'var(--amber)' : 'var(--text-tertiary)'};margin-bottom:12px;
            font-weight:${pendente ? '600' : '400'};">
            ${pendente
              ? `⚠️ Atrasado ${diasDiff} dia${diasDiff !== 1 ? 's' : ''}`
              : `Previsto: ${Utils.formatDate(proxima)} (em ${diasDiff}d)`}
          </div>

          <button class="btn w-full"
            style="background:${pendente ? 'var(--amber)' : cor};color:white;"
            onclick="App.navigate('reuniao',{colaboradorId:'${colaborador.id}',tipoEncontro:'${tipoProximo}',numReuniao:${numProximo}})">
            <i data-lucide="play"></i>
            ${pendente ? 'Iniciar Agora' : 'Iniciar Acompanhamento'}
          </button>
        </div>`;
    } catch(e) {
      console.error('_proximoCard error:', e);
      return this._emptyProximo();
    }
  },

  _emptyProximo() {
    return `
      <div class="card" style="text-align:center;padding:32px 20px;">
        <div style="font-size:40px;margin-bottom:12px;">🎉</div>
        <div style="font-weight:700;color:var(--text-primary);margin-bottom:6px;">Tudo em dia!</div>
        <div style="font-size:13px;color:var(--text-tertiary);">Nenhum acompanhamento pendente no momento.</div>
        <button class="btn btn-primary mt-16" onclick="App.navigate('novo')">
          <i data-lucide="user-plus"></i> Cadastrar Afilhado
        </button>
      </div>`;
  },

  _renderTimeline(realizadas, colaboradores) {
    const recentes = [...realizadas]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    if (!recentes.length) {
      return `<div style="text-align:center;padding:24px;color:var(--text-tertiary);font-size:13px;">
        Nenhuma reunião realizada ainda.
      </div>`;
    }

    const corMap = { primeiro:'#6366f1', acompanhamento:'#10b981', encerramento:'#f59e0b' };

    return `
      <div class="timeline">
        ${recentes.map(r => {
          const col    = colaboradores.find(c => c.id === r.colaboradorId);
          const tipo   = r.tipo || 'acompanhamento';
          const cor    = corMap[tipo] || '#10b981';
          const label  = tipo === 'primeiro' ? '1º Encontro'
                       : tipo === 'encerramento' ? 'Encerramento'
                       : `Acomp. #${r.numReuniao || ''}`;
          return `
            <div class="timeline-item">
              <div class="timeline-dot done" style="background:${cor};box-shadow:0 0 0 2px ${cor};"></div>
              <div class="timeline-content">
                <div class="timeline-date">${Utils.timeAgo(r.updatedAt)}</div>
                <div class="timeline-title">
                  ${label} · ${col ? Utils.sanitize(col.nome) : 'Colaborador'}
                </div>
                ${r.insight
                  ? `<div class="timeline-body">${Utils.truncate(r.insight, 90)}</div>`
                  : ''}
              </div>
            </div>`;
        }).join('')}
      </div>`;
  },

  // ── Gráficos ─────────────────────────────────────────────

  _renderChartReunioes(reunioes) {
    const canvas = document.getElementById('chart-reunioes');
    if (!canvas || !window.Chart) return;

    const meses = [], dados = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mes = d.getMonth(), ano = d.getFullYear();
      const label = d.toLocaleDateString('pt-BR', { month: 'short' });
      meses.push(label.charAt(0).toUpperCase() + label.slice(1, 3));
      dados.push(reunioes.filter(r => {
        try {
          const rd = new Date(r.createdAt);
          return rd.getMonth() === mes && rd.getFullYear() === ano && r.status === 'concluida';
        } catch(e) { return false; }
      }).length);
    }

    if (this._charts.reunioes) { try { this._charts.reunioes.destroy(); } catch(e) {} }
    const dark = DB.Config.getTema() === 'dark';

    this._charts.reunioes = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [{
          label: 'Reuniões',
          data: dados,
          backgroundColor: 'rgba(99,102,241,0.75)',
          borderColor: '#6366f1',
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: dark ? '#64748b' : '#94a3b8', stepSize: 1, font: { size: 11 } },
            grid:  { color: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)' }
          },
          x: {
            ticks: { color: dark ? '#64748b' : '#94a3b8', font: { size: 11 } },
            grid:  { display: false }
          }
        }
      }
    });
  },

  _renderChartValores(reunioes) {
    const canvas = document.getElementById('chart-valores');
    if (!canvas || !window.Chart) return;

    const contagem = {};
    AppData.valores.forEach(v => { contagem[v.id] = 0; });
    reunioes.forEach(r => {
      if (r.radarValores) {
        Object.entries(r.radarValores).forEach(([k, v]) => {
          if (contagem[k] !== undefined) contagem[k] += (v || 0);
        });
      }
    });

    const labels = AppData.valores.map(v => v.nome);
    const data   = AppData.valores.map(v => contagem[v.id] || 0);
    const colors = AppData.valores.map(v => v.cor);
    const dark   = DB.Config.getTema() === 'dark';

    if (this._charts.valores) { try { this._charts.valores.destroy(); } catch(e) {} }

    this._charts.valores = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.map(c => c + '99'),
          borderColor: colors,
          borderWidth: 2,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: dark ? '#64748b' : '#94a3b8', font: { size: 11 } },
            grid:  { color: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)' }
          },
          y: {
            ticks: { color: dark ? '#94a3b8' : '#475569', font: { size: 11 } },
            grid:  { display: false }
          }
        }
      }
    });
  }
};
