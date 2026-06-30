// ============================================================
// RADAR.JS — Radar Cultural (diferencial da plataforma)
// ============================================================

Pages.Radar = {
  _colaboradorSelecionado: null,
  _charts: {},

  async render(root) {
    const colaboradores = await DB.Colaboradores.getAll();
    const todasReunioes = await DB.Reunioes.getAll();
    this._cacheReunioes = todasReunioes;

    root.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-header-title">Radar Cultural</h1>
          <p class="page-header-subtitle">Visualize a evolução dos valores em cada colaborador ao longo do tempo</p>
        </div>
      </div>

      <!-- Explicação do recurso -->
      <div class="card mb-24" style="background:linear-gradient(135deg,#4f46e522,#7c3aed11);border-color:var(--border-brand);">
        <div style="display:flex;align-items:flex-start;gap:16px;">
          <div style="width:48px;height:48px;border-radius:var(--r-lg);background:var(--brand);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i data-lucide="radar" style="width:24px;height:24px;color:white;"></i>
          </div>
          <div>
            <div style="font-size:15px;font-weight:700;margin-bottom:6px;">Como funciona o Radar Cultural?</div>
            <p style="font-size:13.5px;color:var(--text-secondary);line-height:1.7;max-width:680px;">
              Ao final de cada reunião, você marca a intensidade com que cada valor da LINKCE apareceu naturalmente na conversa.
              O Radar gera um gráfico visual mostrando a evolução ao longo dos 4 encontros — do primeiro ao 90 dias —
              permitindo comparar claramente o crescimento cultural do colaborador.
            </p>
          </div>
        </div>
      </div>

      <!-- Seletor de colaborador -->
      <div class="card mb-24" style="padding:16px;">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <div style="flex:1;min-width:220px;">
            <label class="form-label">Selecionar Colaborador</label>
            <select class="form-input form-select" id="radar-select" onchange="Pages.Radar._onSelect(this.value)">
              <option value="">— Escolha um colaborador —</option>
              ${colaboradores.map(c => `<option value="${c.id}" ${this._colaboradorSelecionado === c.id ? 'selected' : ''}>${Utils.sanitize(c.nome)} · ${Utils.sanitize(c.cargo || '')}</option>`).join('')}
            </select>
          </div>
          ${this._colaboradorSelecionado ? `
            <div style="margin-top:20px;">
              <button class="btn btn-ghost btn-sm" onclick="Pages.Radar._exportarRadar()">
                <i data-lucide="download"></i> Exportar
              </button>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Conteúdo do radar -->
      <div id="radar-content">
        ${this._colaboradorSelecionado ? '<div style="display:flex;justify-content:center;padding:60px;"><div class="loading-spinner"></div></div>' : this._renderEmpty(colaboradores)}
      </div>
    `;

    App.initLucide();

    if (this._colaboradorSelecionado) {
      const content = document.getElementById('radar-content');
      if (content) content.innerHTML = await this._renderRadarColaborador(this._colaboradorSelecionado);
      App.initLucide();
      setTimeout(() => this._initCharts(this._colaboradorSelecionado), 100);
    }
  },

  async _onSelect(colaboradorId) {
    this._colaboradorSelecionado = colaboradorId || null;
    const content = document.getElementById('radar-content');
    if (!content) return;

    if (!colaboradorId) {
      const colaboradores = await DB.Colaboradores.getAll();
      content.innerHTML = this._renderEmpty(colaboradores);
      App.initLucide();
      return;
    }

    content.innerHTML = `<div style="display:flex;justify-content:center;padding:60px;"><div class="loading-spinner"></div></div>`;
    content.innerHTML = await this._renderRadarColaborador(colaboradorId);
    App.initLucide();
    setTimeout(() => this._initCharts(colaboradorId), 100);
  },

  _renderEmpty(colaboradores) {
    if (!colaboradores.length) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="radar"></i></div>
          <h3>Nenhum colaborador cadastrado</h3>
          <p>Cadastre e inicie acompanhamentos para ver o Radar Cultural.</p>
          <button class="btn btn-primary mt-16" onclick="App.navigate('novo')"><i data-lucide="user-plus"></i> Cadastrar Afilhado</button>
        </div>
      `;
    }

    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
        ${colaboradores.map(c => this._renderMiniCard(c)).join('')}
      </div>
    `;
  },

  _renderMiniCard(colaborador) {
    const reunioes = (this._cacheReunioes || []).filter(r => r.colaboradorId === colaborador.id && r.status === 'concluida' && r.radarValores);
    const temDados = reunioes.length > 0;

    // Calcular média por valor
    const medias = {};
    AppData.valores.forEach(v => {
      const vals = reunioes.map(r => r.radarValores[v.id] || 0);
      medias[v.id] = vals.length ? vals.reduce((a,b) => a+b,0) / vals.length : 0;
    });

    return `
      <div class="card card-interactive" onclick="Pages.Radar._selecionarCard('${colaborador.id}')">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          ${Utils.avatarHtml(colaborador, 40)}
          <div>
            <div style="font-weight:700;font-size:14px;">${Utils.sanitize(colaborador.nome)}</div>
            <div style="font-size:12px;color:var(--text-tertiary);">${reunioes.length} encontro${reunioes.length !== 1 ? 's' : ''} registrado${reunioes.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        ${temDados ? `
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${AppData.valores.map(v => `
              <div>
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                  <span style="font-size:11.5px;color:var(--text-secondary);">${v.emoji} ${v.nome}</span>
                  <span style="font-size:11.5px;font-weight:700;color:${v.cor};">${medias[v.id].toFixed(1)}</span>
                </div>
                <div class="progress" style="height:4px;">
                  <div class="progress-bar" style="width:${(medias[v.id]/5)*100}%;background:${v.cor};"></div>
                </div>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-primary btn-sm w-full mt-16">
            <i data-lucide="radar"></i> Ver Radar Completo
          </button>
        ` : `
          <div style="text-align:center;padding:16px;color:var(--text-tertiary);font-size:13px;">
            <i data-lucide="clock" style="width:20px;height:20px;margin-bottom:6px;display:block;margin-left:auto;margin-right:auto;"></i>
            Sem dados de radar ainda.<br>Realize o primeiro encontro.
          </div>
        `}
      </div>
    `;
  },

  async _selecionarCard(colaboradorId) {
    this._colaboradorSelecionado = colaboradorId;
    const select = document.getElementById('radar-select');
    if (select) select.value = colaboradorId;
    const content = document.getElementById('radar-content');
    if (content) {
      content.innerHTML = `<div style="display:flex;justify-content:center;padding:60px;"><div class="loading-spinner"></div></div>`;
      content.innerHTML = await this._renderRadarColaborador(colaboradorId);
      App.initLucide();
      setTimeout(() => this._initCharts(colaboradorId), 100);
    }
  },


  // Helper: get label from reunion object (replaces AppData.encontros lookup)
  _encLabel(r, idx) {
    const tipo = r?.tipo || 'acompanhamento';
    const num = r?.numReuniao || r?.numEncontro || (idx !== undefined ? idx+1 : '');
    if (tipo === 'primeiro') return '1º Encontro';
    if (tipo === 'encerramento') return 'Encerramento';
    return `Acomp. #${num}`;
  },

  async _renderRadarColaborador(colaboradorId) {
    const colaborador = await DB.Colaboradores.getById(colaboradorId);
    if (!colaborador) return '';

    const reunioes = (await DB.Reunioes.getByColaborador(colaboradorId))
      .filter(r => r.status === 'concluida' && r.radarValores);

    const diasEmpresa = Utils.daysSince(colaborador.dataAdmissao);

    // Calcular evolução
    const evolucao = this._calcularEvolucao(reunioes);

    return `
      <div style="display:grid;grid-template-columns:1fr 360px;gap:20px;align-items:start;" class="radar-main-grid">

        <!-- Gráfico principal -->
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
            <div style="display:flex;align-items:center;gap:12px;">
              ${Utils.avatarHtml(colaborador, 44)}
              <div>
                <div style="font-size:16px;font-weight:800;">${Utils.sanitize(colaborador.nome)}</div>
                <div style="font-size:12.5px;color:var(--text-tertiary);">${diasEmpresa} dias na empresa · ${reunioes.length} encontro${reunioes.length!==1?'s':''} · freq. ${colaborador.frequenciaDias||15}d</div>
                ${colaborador.padrinho?`<div style="font-size:12px;color:#22c55e;font-weight:600;">❤️ ${Utils.sanitize(colaborador.padrinho)}</div>`:''}
              </div>
            </div>
            <div style="display:flex;gap:6px;">
              <button class="chip ${this._viewMode === 'all' ? 'active' : ''}" onclick="Pages.Radar._setViewMode('all','${colaboradorId}')">Todos</button>
              <button class="chip ${this._viewMode === 'compare' ? 'active' : ''}" onclick="Pages.Radar._setViewMode('compare','${colaboradorId}')" ${reunioes.length < 2 ? 'disabled style="opacity:.4"' : ''}>Comparar</button>
              <button class="chip ${this._viewMode === 'last' ? 'active' : ''}" onclick="Pages.Radar._setViewMode('last','${colaboradorId}')">Último</button>
            </div>
          </div>

          ${reunioes.length === 0 ? `
            <div class="empty-state" style="padding:60px 0;">
              <div class="empty-state-icon"><i data-lucide="radar"></i></div>
              <h3>Sem dados de Radar</h3>
              <p>Realize encontros e marque os valores para ver o radar.</p>
              <button class="btn btn-primary mt-16" onclick="App.navigate('reuniao',{colaboradorId:'${colaboradorId}',tipoEncontro:'primeiro',numReuniao:1})">
                <i data-lucide="play"></i> Iniciar Primeiro Encontro
              </button>
            </div>
          ` : `
            <div style="height:380px;position:relative;">
              <canvas id="radar-chart-main"></canvas>
            </div>

            <!-- Legenda dos encontros -->
            <div style="display:flex;gap:16px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
              ${reunioes.map((r,i) => {
                const label = this._encLabel(r, i);
                const cores = ['#6366f1','#10b981','#f59e0b','#ef4444'];
                return `
                  <div style="display:flex;align-items:center;gap:6px;font-size:12.5px;">
                    <div style="width:12px;height:12px;border-radius:50%;background:${cores[i]||cores[0]};"></div>
                    <span style="color:var(--text-secondary);font-weight:500;">${label}</span>
                    <span style="color:var(--text-tertiary);">${Utils.formatDate(r.updatedAt)}</span>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Painel lateral -->
        <div style="display:flex;flex-direction:column;gap:16px;">

          <!-- Scores por valor -->
          <div class="card">
            <div style="font-size:13px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="bar-chart-3" style="width:14px;height:14px;color:var(--brand);"></i>
              Score por Valor
            </div>
            <div style="display:flex;flex-direction:column;gap:14px;">
              ${AppData.valores.map(v => {
                const vals = reunioes.map(r => r.radarValores[v.id] || 0);
                const media = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
                const primeiro = vals[0] || 0;
                const ultimo = vals[vals.length-1] || 0;
                const delta = ultimo - primeiro;
                return `
                  <div>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
                      <span style="font-size:13px;font-weight:600;color:${v.cor};display:flex;align-items:center;gap:5px;">
                        ${v.emoji} ${v.nome}
                      </span>
                      <div style="display:flex;align-items:center;gap:8px;">
                        ${reunioes.length >= 2 ? `
                          <span style="font-size:11px;font-weight:700;color:${delta > 0 ? 'var(--green)' : delta < 0 ? 'var(--red)' : 'var(--text-tertiary)'};">
                            ${delta > 0 ? '▲' : delta < 0 ? '▼' : '—'} ${Math.abs(delta).toFixed(1)}
                          </span>
                        ` : ''}
                        <span style="font-size:13px;font-weight:800;color:${v.cor};">${media.toFixed(1)}</span>
                      </div>
                    </div>
                    <div class="progress" style="height:6px;">
                      <div class="progress-bar" style="width:${(media/5)*100}%;background:${v.cor};border-radius:99px;"></div>
                    </div>
                    <!-- Mini evolução -->
                    ${vals.length > 1 ? `
                      <div style="display:flex;gap:3px;margin-top:5px;">
                        ${vals.map((val,i) => {
                          // enc replaced by _encLabel call below
                          return `<div title="${this._encLabel(reunioes[i], i)}: ${val}" style="flex:1;height:3px;border-radius:99px;background:${val > 0 ? v.cor : 'var(--bg-elevated)'};opacity:${0.4 + val*0.12};"></div>`;
                        }).join('')}
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Evolução geral -->
          ${reunioes.length >= 2 ? `
            <div class="card" style="background:${evolucao.delta >= 0 ? 'var(--green-soft)' : 'var(--red-soft)'};border-color:${evolucao.delta >= 0 ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'};">
              <div style="font-size:13px;font-weight:700;color:${evolucao.delta >= 0 ? 'var(--green)' : 'var(--red)'};margin-bottom:12px;">
                ${evolucao.delta >= 0 ? '📈 Evolução Positiva' : '📉 Ponto de Atenção'}
              </div>
              <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;">
                <span style="font-size:32px;font-weight:800;color:var(--text-primary);">${evolucao.delta >= 0 ? '+' : ''}${evolucao.delta.toFixed(1)}</span>
                <span style="font-size:13px;color:var(--text-secondary);">pontos totais</span>
              </div>
              <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;">
                Comparando o primeiro e o último encontro, a pontuação cultural ${evolucao.delta >= 0 ? 'cresceu' : 'reduziu'} em média <strong>${Math.abs(evolucao.delta).toFixed(1)} pontos</strong> por valor.
              </p>
              ${evolucao.melhor ? `
                <div style="margin-top:10px;padding:8px;background:rgba(255,255,255,0.15);border-radius:var(--r-sm);">
                  <span style="font-size:12px;color:var(--text-secondary);">Maior avanço: </span>
                  <span style="font-size:12px;font-weight:700;color:var(--text-primary);">${evolucao.melhor.nome} (+${evolucao.melhor.delta.toFixed(1)})</span>
                </div>
              ` : ''}
            </div>
          ` : reunioes.length === 1 ? `
            <div class="card" style="background:var(--brand-soft);border-color:var(--border-brand);text-align:center;padding:20px;">
              <div style="font-size:13px;font-weight:700;color:var(--brand);margin-bottom:6px;">Radar Iniciado!</div>
              <p style="font-size:12.5px;color:var(--text-secondary);">Complete mais encontros para ver a evolução comparativa.</p>
              <div style="margin-top:12px;display:flex;gap:4px;justify-content:center;">
                ${[1,2,3,4].map((n,i) => `<div style="width:8px;height:8px;border-radius:50%;background:${i===0?'var(--brand)':'var(--bg-elevated)'};"></div>`).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Gráfico de evolução linear -->
          ${reunioes.length >= 2 ? `
            <div class="card">
              <div style="font-size:13px;font-weight:700;margin-bottom:12px;">Evolução por Encontro</div>
              <div style="height:160px;position:relative;">
                <canvas id="radar-evolucao-chart"></canvas>
              </div>
            </div>
          ` : ''}

        </div>
      </div>

      <!-- Comparativo tabela -->
      ${reunioes.length >= 2 ? this._renderTabelaComparativa(reunioes) : ''}
    `;
  },

  _calcularEvolucao(reunioes) {
    if (reunioes.length < 2) return { delta: 0, melhor: null };

    const primeiro = reunioes[0].radarValores || {};
    const ultimo = reunioes[reunioes.length-1].radarValores || {};

    let totalDelta = 0;
    let melhor = null;

    AppData.valores.forEach(v => {
      const d = (ultimo[v.id] || 0) - (primeiro[v.id] || 0);
      totalDelta += d;
      if (!melhor || d > melhor.delta) melhor = { ...v, delta: d };
    });

    return { delta: totalDelta / AppData.valores.length, melhor: melhor?.delta > 0 ? melhor : null };
  },

  _renderTabelaComparativa(reunioes) {
    const cores = ['#6366f1','#10b981','#f59e0b','#ef4444'];

    return `
      <div class="card mt-24" style="overflow:auto;">
        <div class="section-header">
          <div class="section-title"><i data-lucide="table-2"></i> Tabela Comparativa de Evolução</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:500px;">
          <thead>
            <tr style="border-bottom:2px solid var(--border);">
              <th style="text-align:left;padding:10px 12px;color:var(--text-tertiary);font-weight:600;font-size:11.5px;text-transform:uppercase;letter-spacing:0.5px;">Valor</th>
              ${reunioes.map((r,i) => {
                const encLbl2 = this._encLabel(r, i);
                return `<th style="text-align:center;padding:10px 12px;color:${cores[i]||cores[0]};font-weight:700;font-size:11.5px;">${encLbl2}</th>`;
              }).join('')}
              <th style="text-align:center;padding:10px 12px;color:var(--text-tertiary);font-weight:600;font-size:11.5px;">Δ Total</th>
            </tr>
          </thead>
          <tbody>
            ${AppData.valores.map(v => {
              const vals = reunioes.map(r => r.radarValores?.[v.id] || 0);
              const delta = vals[vals.length-1] - vals[0];
              return `
                <tr style="border-bottom:1px solid var(--border);">
                  <td style="padding:12px;font-weight:600;display:flex;align-items:center;gap:6px;">
                    <span>${v.emoji}</span>
                    <span style="color:${v.cor};">${v.nome}</span>
                  </td>
                  ${vals.map((val,i) => `
                    <td style="text-align:center;padding:12px;">
                      <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${val>0?v.cor+'22':'var(--bg-elevated)'};color:${val>0?v.cor:'var(--text-tertiary)'};font-weight:700;font-size:13px;">${val}</span>
                    </td>
                  `).join('')}
                  <td style="text-align:center;padding:12px;">
                    <span style="font-size:13px;font-weight:700;color:${delta>0?'var(--green)':delta<0?'var(--red)':'var(--text-tertiary)'};">
                      ${delta>0?'+':''}${delta.toFixed(0)}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  async _initCharts(colaboradorId) {
    const reunioes = (await DB.Reunioes.getByColaborador(colaboradorId))
      .filter(r => r.status === 'concluida' && r.radarValores);

    if (!reunioes.length) return;

    this._renderRadarChart(reunioes);

    if (reunioes.length >= 2) {
      this._renderEvolucaoChart(reunioes);
    }
  },

  _viewMode: 'all',

  async _setViewMode(mode, colaboradorId) {
    this._viewMode = mode;
    const reunioes = (await DB.Reunioes.getByColaborador(colaboradorId))
      .filter(r => r.status === 'concluida' && r.radarValores);

    document.querySelectorAll('.radar-main-grid .chip').forEach(el => el.classList.remove('active'));
    event?.target?.classList?.add('active');

    this._renderRadarChart(reunioes);
  },

  _renderRadarChart(reunioes) {
    const canvas = document.getElementById('radar-chart-main');
    if (!canvas || !window.Chart) return;

    const labels = AppData.valores.map(v => v.nome);
    const cores = ['#6366f1','#10b981','#f59e0b','#ef4444'];
    const isDark = DB.Config.getTema() === 'dark';

    let datasets = [];
    const mode = this._viewMode;

    if (mode === 'last') {
      const ultimo = reunioes[reunioes.length-1];
      const encLblLast = this._encLabel(ultimo);
      datasets = [{
        label: encLblLast || 'Último',
        data: AppData.valores.map(v => ultimo.radarValores[v.id] || 0),
        borderColor: '#6366f1',
        backgroundColor: '#6366f122',
        pointBackgroundColor: '#6366f1',
        pointRadius: 5,
        borderWidth: 2,
        fill: true,
      }];
    } else if (mode === 'compare' && reunioes.length >= 2) {
      const r1 = reunioes[0];
      const r2 = reunioes[reunioes.length-1];
      datasets = [r1, r2].map((r, i) => {
        const enc = { titulo: this._encLabel(r, i) };
        return {
          label: this._encLabel(r, i),
          data: AppData.valores.map(v => r.radarValores[v.id] || 0),
          borderColor: i === 0 ? '#6366f1' : '#10b981',
          backgroundColor: i === 0 ? '#6366f111' : '#10b98111',
          pointBackgroundColor: i === 0 ? '#6366f1' : '#10b981',
          pointRadius: 5,
          borderWidth: 2,
          fill: true,
        };
      });
    } else {
      datasets = reunioes.map((r, i) => {
        const encLblAll = this._encLabel(r, i);
        return {
          label: encLblAll,
          data: AppData.valores.map(v => r.radarValores[v.id] || 0),
          borderColor: cores[i] || cores[0],
          backgroundColor: (cores[i] || cores[0]) + '18',
          pointBackgroundColor: cores[i] || cores[0],
          pointRadius: 5,
          borderWidth: 2,
          fill: true,
        };
      });
    }

    if (this._charts.main) this._charts.main.destroy();

    this._charts.main = new Chart(canvas, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 5,
            ticks: { stepSize: 1, display: false },
            grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
            angleLines: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' },
            pointLabels: {
              font: { size: 13, weight: '600' },
              color: isDark ? '#94a3b8' : '#334155',
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: { size: 12 },
              color: isDark ? '#94a3b8' : '#475569',
              padding: 20,
              usePointStyle: true,
              pointStyleWidth: 10,
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}/5`
            }
          }
        },
        animation: { duration: 800, easing: 'easeInOutQuart' }
      }
    });
  },

  _renderEvolucaoChart(reunioes) {
    const canvas = document.getElementById('radar-evolucao-chart');
    if (!canvas || !window.Chart) return;

    const labels = reunioes.map((r,i) => this._encLabel(r, i));
    const isDark = DB.Config.getTema() === 'dark';

    // Média de todos os valores por encontro
    const mediaPorEncontro = reunioes.map(r => {
      const vals = AppData.valores.map(v => r.radarValores[v.id] || 0);
      return vals.reduce((a,b)=>a+b,0) / vals.length;
    });

    if (this._charts.evolucao) this._charts.evolucao.destroy();

    this._charts.evolucao = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Score Cultural Médio',
          data: mediaPorEncontro,
          borderColor: '#6366f1',
          backgroundColor: '#6366f122',
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#6366f1',
          fill: true,
          borderWidth: 2.5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0, max: 5,
            ticks: { stepSize: 1, color: isDark ? '#64748b' : '#94a3b8', font: { size: 10 } },
            grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }
          },
          x: {
            ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 11 } },
            grid: { display: false }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  },

  async _exportarRadar() {
    if (!this._colaboradorSelecionado) return;
    const colaborador = await DB.Colaboradores.getById(this._colaboradorSelecionado);
    const reunioes = (await DB.Reunioes.getByColaborador(this._colaboradorSelecionado)).filter(r => r.status === 'concluida' && r.radarValores);

    if (!window.jspdf) { Utils.toast('jsPDF não carregado', 'error'); return; }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Radar Cultural — LINKCE', 20, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Colaborador: ${colaborador.nome}  |  Gerado em: ${Utils.formatDate(new Date())}`, 20, 24);

    let y = 48;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Evolução por Valor', 20, y);
    y += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    reunioes.forEach((r, i) => {
      const enc = { titulo: this._encLabel(r, i) };
      doc.text(`${this._encLabel(r, i)}: ${AppData.valores.map(v => `${v.nome}: ${r.radarValores[v.id]||0}/5`).join(' | ')}`, 20, y);
      y += 7;
    });

    doc.save(`radar-cultural-${colaborador.nome.toLowerCase().replace(/ /g,'-')}.pdf`);
    Utils.toast('Relatório exportado!', 'success');
  }
};
