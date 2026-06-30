// ============================================================
// COLABORADOR.JS — Perfil completo do colaborador
// Compatível com frequência dinâmica e templates_encontro
// ============================================================

Pages.Colaborador = {
  async render(root, params = {}) {
    const colaborador = await DB.Colaboradores.getById(params.id);
    if (!colaborador) {
      root.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><i data-lucide="user-x"></i></div><h3>Colaborador não encontrado</h3><button class="btn btn-primary mt-16" onclick="App.navigate('afilhados')">Voltar</button></div>`;
      App.initLucide(); return;
    }

    const reunioes = await DB.Reunioes.getByColaborador(colaborador.id);
    const concluidas = reunioes.filter(r => r.status === 'concluida').sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt));
    const diasEmpresa = Utils.daysSince(colaborador.dataAdmissao);
    const freq = colaborador.frequenciaDias || 15;
    const hoje = new Date();
    const proxima = Utils.proximaData(colaborador, reunioes);
    const pendente = proxima <= hoje && colaborador.status !== 'concluido';

    // Determinar tipo do próximo encontro
    const tipoProximo = concluidas.length === 0 ? 'primeiro'
      : colaborador.status === 'encerrar' ? 'encerramento'
      : 'acompanhamento';
    const templateProximo = AppData.templates_encontro.find(t => t.tipo === tipoProximo) || AppData.templates_encontro[1];
    const numProximo = concluidas.length + 1;

    root.innerHTML = `
      <!-- Breadcrumb -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;font-size:13px;color:var(--text-tertiary);">
        <span onclick="App.navigate('afilhados')" style="cursor:pointer;color:var(--text-tertiary);" onmouseenter="this.style.color='var(--brand)'" onmouseleave="this.style.color='var(--text-tertiary)'">Meus Afilhados</span>
        <i data-lucide="chevron-right" style="width:14px;height:14px;"></i>
        <span style="color:var(--text-primary);font-weight:600;">${Utils.sanitize(colaborador.nome)}</span>
      </div>

      <!-- Header -->
      <div class="card mb-20" style="background:linear-gradient(135deg,var(--bg-elevated),var(--bg-surface));">
        <div style="display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap;">
          <div style="position:relative;flex-shrink:0;">
            ${Utils.avatarHtml(colaborador, 80)}
            ${pendente ? `<div style="position:absolute;bottom:0;right:0;width:22px;height:22px;border-radius:50%;background:var(--amber);border:3px solid var(--bg-surface);display:flex;align-items:center;justify-content:center;"><i data-lucide="alert-circle" style="width:11px;height:11px;color:white;"></i></div>` : ''}
          </div>

          <div style="flex:1;min-width:200px;">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px;">
              <h2 style="font-size:22px;font-weight:800;letter-spacing:-0.5px;">${Utils.sanitize(colaborador.nome)}</h2>
              ${pendente ? `<span class="badge badge-amber"><i data-lucide="clock" style="width:11px;height:11px;"></i> Acompanhamento Pendente</span>` : ''}
              ${colaborador.status === 'concluido' ? `<span class="badge badge-green">Concluído</span>` : ''}
            </div>
            <div style="font-size:14px;color:var(--text-secondary);margin-bottom:10px;">
              ${Utils.sanitize(colaborador.cargo || '—')} · ${Utils.sanitize(colaborador.equipe || '—')}
            </div>
            <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12.5px;color:var(--text-tertiary);">
              ${colaborador.padrinho ? `<div style="display:flex;align-items:center;gap:5px;"><i data-lucide="heart" style="width:13px;height:13px;color:#22c55e;"></i><strong style="color:var(--text-primary);">${Utils.sanitize(colaborador.padrinho)}</strong></div>` : ''}
              ${colaborador.gestor  ? `<div style="display:flex;align-items:center;gap:5px;"><i data-lucide="user"  style="width:13px;height:13px;"></i>${Utils.sanitize(colaborador.gestor)}</div>` : ''}
              ${colaborador.cidade  ? `<div style="display:flex;align-items:center;gap:5px;"><i data-lucide="map-pin" style="width:13px;height:13px;"></i>${Utils.sanitize(colaborador.cidade)}</div>` : ''}
              ${colaborador.email   ? `<div style="display:flex;align-items:center;gap:5px;"><i data-lucide="mail" style="width:13px;height:13px;"></i>${Utils.sanitize(colaborador.email)}</div>` : ''}
              <div style="display:flex;align-items:center;gap:5px;"><i data-lucide="calendar" style="width:13px;height:13px;"></i>${Utils.formatDate(colaborador.dataAdmissao)} · ${diasEmpresa}d na empresa</div>
              <div style="display:flex;align-items:center;gap:5px;color:var(--brand);font-weight:600;"><i data-lucide="repeat" style="width:13px;height:13px;"></i>A cada ${freq} dias</div>
            </div>
          </div>

          <div style="display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;">
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('novo',{id:'${colaborador.id}'})"><i data-lucide="edit-2"></i> Editar</button>
            <button class="btn btn-ghost btn-sm" onclick="Pages.Colaborador._gerarRelatorio('${colaborador.id}')"><i data-lucide="file-text"></i> Relatório</button>
            ${colaborador.status !== 'concluido' ? `
              <button class="btn btn-sm ${pendente?'btn-primary':'btn-ghost'}" onclick="App.navigate('reuniao',{colaboradorId:'${colaborador.id}',tipoEncontro:'${tipoProximo}',numReuniao:${numProximo}})"
                style="${pendente?'background:#22c55e;':''}">
                <i data-lucide="play"></i> ${pendente?'Iniciar Agora':'Iniciar'} — ${templateProximo.label}
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Linha do tempo de encontros -->
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <span style="font-size:12.5px;font-weight:600;color:var(--text-secondary);">Histórico de Encontros</span>
            <span style="font-size:12.5px;font-weight:700;color:var(--brand);">${concluidas.length} realizados</span>
          </div>
          <!-- Timeline dinâmica -->
          <div style="display:flex;gap:0;overflow-x:auto;padding-bottom:4px;">
            ${concluidas.length === 0
              ? `<div style="font-size:13px;color:var(--text-tertiary);padding:4px;">Nenhum encontro realizado ainda.</div>`
              : concluidas.map((r, i) => {
                  const tipo = r.tipo || (i===0?'primeiro':'acompanhamento');
                  const cores = { primeiro:'#6366f1', acompanhamento:'#10b981', encerramento:'#f59e0b' };
                  const cor = cores[tipo] || '#10b981';
                  return `
                    <div style="flex-shrink:0;text-align:center;min-width:80px;position:relative;cursor:pointer;" onclick="Pages.Colaborador._verReuniao('${r.id}')">
                      <div style="height:6px;background:${cor};margin-bottom:8px;border-radius:${i===0?'99px 0 0 99px':i===concluidas.length-1?'0 99px 99px 0':'0'};"></div>
                      <div style="width:18px;height:18px;border-radius:50%;background:${cor};margin:0 auto 6px;border:3px solid var(--bg-surface);position:relative;top:-17px;"></div>
                      <div style="font-size:10.5px;font-weight:700;color:${cor};margin-top:-8px;">#${i+1}</div>
                      <div style="font-size:10px;color:var(--text-tertiary);">${Utils.formatDate(r.createdAt)}</div>
                    </div>
                  `;
                }).join('')
            }
            ${colaborador.status !== 'concluido' ? `
              <div style="flex-shrink:0;text-align:center;min-width:80px;">
                <div style="height:6px;background:var(--bg-elevated);margin-bottom:8px;border-radius:0 99px 99px 0;border:1px dashed var(--border);"></div>
                <div style="width:18px;height:18px;border-radius:50%;background:var(--bg-elevated);border:2px dashed var(--border);margin:0 auto 6px;position:relative;top:-17px;"></div>
                <div style="font-size:10px;color:var(--text-tertiary);margin-top:-8px;">#${concluidas.length+1}</div>
                <div style="font-size:10px;color:var(--amber);font-weight:600;">${pendente?'Pendente':'Próximo'}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Grid principal -->
      <div style="display:grid;grid-template-columns:1fr 360px;gap:20px;align-items:start;">

        <!-- Tabs -->
        <div class="card" style="padding:0;">
          <div style="display:flex;border-bottom:1px solid var(--border);padding:4px 4px 0;overflow-x:auto;">
            ${['Histórico','Indicadores','Radar Cultural','Diário'].map((tab, i) => `
              <button class="collab-tab" data-tab="${i}" onclick="Pages.Colaborador._switchTab(${i},'${colaborador.id}')"
                style="padding:12px 20px;background:none;border:none;font-size:13.5px;font-weight:600;
                  color:${i===0?'var(--brand)':'var(--text-tertiary)'};
                  border-bottom:2px solid ${i===0?'var(--brand)':'transparent'};
                  transition:all .2s;cursor:pointer;margin-bottom:-1px;white-space:nowrap;">
                ${tab}
              </button>
            `).join('')}
          </div>
          <div id="collab-tab-content" style="padding:24px;">
            ${this._renderTabHistorico(colaborador, reunioes)}
          </div>
        </div>

        <!-- Sidebar -->
        <div style="display:flex;flex-direction:column;gap:16px;">

          <!-- Próximo acompanhamento -->
          <div class="card" style="border-color:${pendente?'var(--amber)':'var(--border)'};">
            <div style="font-size:13px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="calendar-clock" style="width:14px;height:14px;color:${pendente?'var(--amber)':'var(--brand)'};"></i>
              Próximo Encontro
            </div>
            <div style="font-size:22px;font-weight:800;color:${pendente?'var(--amber)':'var(--text-primary)'};">
              ${Utils.formatDate(proxima)}
            </div>
            <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;margin-bottom:12px;">
              ${pendente
                ? `⚠️ ${Math.abs(Math.ceil((proxima-hoje)/86400000))} dias de atraso`
                : `em ${Math.ceil((proxima-hoje)/86400000)} dias · A cada ${freq} dias`}
            </div>
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;">
              Tipo: <strong>${templateProximo.titulo}</strong>
            </div>
            ${colaborador.status !== 'concluido' ? `
              <button class="btn w-full ${pendente?'btn-primary':'btn-ghost'}" onclick="App.navigate('reuniao',{colaboradorId:'${colaborador.id}',tipoEncontro:'${tipoProximo}',numReuniao:${numProximo}})"
                style="${pendente?'background:#22c55e;':''}">
                <i data-lucide="play"></i> Iniciar ${templateProximo.label}
              </button>
            ` : `<span class="badge badge-green w-full" style="justify-content:center;padding:10px;">✓ Ciclo Concluído</span>`}
          </div>

          <!-- Indicadores da última reunião -->
          ${this._renderIndicadoresSidebar(concluidas)}

          <!-- Observações -->
          ${colaborador.observacoes ? `
            <div class="card">
              <div style="font-size:13px;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                <i data-lucide="sticky-note" style="width:14px;height:14px;color:var(--amber);"></i> Observações
              </div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.7;">${Utils.sanitize(colaborador.observacoes)}</p>
            </div>
          ` : ''}

          <!-- Ações rápidas -->
          <div class="card">
            <div style="font-size:13px;font-weight:700;margin-bottom:12px;">Ações Rápidas</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${colaborador.telefone ? `<a href="https://wa.me/55${colaborador.telefone.replace(/\D/g,'')}" target="_blank" class="btn btn-ghost btn-sm w-full" style="justify-content:flex-start;"><i data-lucide="message-circle"></i> WhatsApp</a>` : ''}
              ${colaborador.email ? `<a href="mailto:${Utils.sanitize(colaborador.email)}" class="btn btn-ghost btn-sm w-full" style="justify-content:flex-start;"><i data-lucide="mail"></i> Enviar E-mail</a>` : ''}
              <button class="btn btn-ghost btn-sm w-full" style="justify-content:flex-start;" onclick="App.navigate('radar')"><i data-lucide="radar"></i> Radar Cultural</button>
              <button class="btn btn-ghost btn-sm w-full" style="justify-content:flex-start;" onclick="App.navigate('novo',{id:'${colaborador.id}'})"><i data-lucide="edit-2"></i> Editar Dados</button>
              <button class="btn btn-ghost btn-sm w-full" style="justify-content:flex-start;color:var(--red);" onclick="Pages.Colaborador._excluir('${colaborador.id}')"><i data-lucide="trash-2"></i> Excluir</button>
            </div>
          </div>

        </div>
      </div>
    `;
    App.initLucide();
  },

  async _switchTab(tabIdx, colaboradorId) {
    document.querySelectorAll('.collab-tab').forEach((btn, i) => {
      btn.style.color = i === tabIdx ? 'var(--brand)' : 'var(--text-tertiary)';
      btn.style.borderBottom = i === tabIdx ? '2px solid var(--brand)' : '2px solid transparent';
    });
    const content = document.getElementById('collab-tab-content');
    if (content) content.innerHTML = `<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>`;

    const colaborador = await DB.Colaboradores.getById(colaboradorId);
    const reunioes = await DB.Reunioes.getByColaborador(colaboradorId);
    const concluidas = reunioes.filter(r => r.status === 'concluida');

    const tabs = [
      () => this._renderTabHistorico(colaborador, reunioes),
      () => this._renderTabIndicadores(concluidas),
      () => this._renderTabRadar(colaborador, concluidas),
      () => this._renderTabDiario(concluidas),
    ];
    if (content) content.innerHTML = tabs[tabIdx]?.() || '';
    App.initLucide();
    if (tabIdx === 2) setTimeout(() => this._initRadarChart(concluidas), 80);
    if (tabIdx === 1) setTimeout(() => this._initIndicadoresChart(concluidas), 80);
  },

  _renderTabHistorico(colaborador, reunioes) {
    const sorted = [...reunioes].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
    if (!sorted.length) return `
      <div class="empty-state" style="padding:40px 0;">
        <div class="empty-state-icon"><i data-lucide="message-square"></i></div>
        <h3>Nenhum encontro registrado</h3>
        <p>Inicie o primeiro acompanhamento para criar o histórico.</p>
      </div>`;

    const cores = { primeiro:'#6366f1', acompanhamento:'#10b981', encerramento:'#f59e0b' };

    return `
      <div class="timeline">
        ${sorted.map(r => {
          const tipo = r.tipo || 'acompanhamento';
          const cor = cores[tipo] || '#10b981';
          const label = tipo === 'primeiro' ? '1º Encontro' : tipo === 'encerramento' ? 'Encerramento' : `Acompanhamento #${r.numReuniao||''}`;
          return `
            <div class="timeline-item">
              <div class="timeline-dot ${r.status==='concluida'?'done':'pending'}"></div>
              <div class="timeline-content">
                <div class="timeline-date">${Utils.formatDate(r.createdAt, 'dd/mm/yyyy')}</div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                  <div class="timeline-title">${label}</div>
                  <span class="badge" style="font-size:10.5px;background:${cor}22;color:${cor};">${r.status==='concluida'?'Realizado':'Pendente'}</span>
                  ${r.duracao?`<span style="font-size:10.5px;color:var(--text-tertiary);">⏱ ${Utils.formatTimer(r.duracao)}</span>`:''}
                </div>
                ${r.insight ? `
                  <div style="background:var(--bg-elevated);border-radius:var(--r-md);padding:12px;margin-bottom:10px;border-left:3px solid ${cor};">
                    <div style="font-size:11px;font-weight:700;color:${cor};margin-bottom:4px;">💡 Insight</div>
                    <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">${Utils.sanitize(r.insight)}</p>
                  </div>` : ''}
                <button class="btn btn-ghost btn-sm" onclick="Pages.Colaborador._verReuniao('${r.id}')">
                  <i data-lucide="eye"></i> Ver detalhes
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>`;
  },

  _renderTabIndicadores(concluidas) {
    const comInd = concluidas.filter(r => r.indicadores);
    if (!comInd.length) return `<div style="text-align:center;padding:40px;color:var(--text-tertiary);">Nenhum indicador registrado ainda.</div>`;
    const labels = { integracao:'Integração', adaptacao:'Adaptação', cultura:'Cultura', equipe:'Equipe', seguranca:'Segurança' };
    return `
      <div style="margin-bottom:24px;height:240px;position:relative;">
        <canvas id="chart-indicadores-collab"></canvas>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${Object.keys(labels).map(key => {
          const vals = comInd.map(r => r.indicadores?.[key]||0);
          const media = vals.reduce((a,b)=>a+b,0)/vals.length;
          return `
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                <span style="font-size:12.5px;font-weight:600;color:var(--text-secondary);">${labels[key]}</span>
                <span style="font-size:12.5px;font-weight:700;color:var(--amber);">${media.toFixed(1)} ★</span>
              </div>
              <div class="progress"><div class="progress-bar" style="width:${(media/5)*100}%;"></div></div>
            </div>`;
        }).join('')}
      </div>`;
  },

  _renderTabRadar(colaborador, concluidas) {
    const comRadar = concluidas.filter(r => r.radarValores && Object.keys(r.radarValores).length > 0);
    return `
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:15px;font-weight:700;margin-bottom:4px;">Radar Cultural — ${Utils.sanitize(colaborador.nome.split(' ')[0])}</div>
        <div style="font-size:13px;color:var(--text-tertiary);">Evolução dos valores ao longo dos encontros</div>
      </div>
      <div style="height:280px;position:relative;">
        <canvas id="radar-collab"></canvas>
      </div>
      ${comRadar.length >= 2 ? `
        <div style="margin-top:16px;padding:12px;background:var(--green-soft);border-radius:var(--r-md);border:1px solid rgba(16,185,129,.2);">
          <div style="font-size:12.5px;font-weight:700;color:var(--green);margin-bottom:4px;">📈 Comparativo disponível</div>
          <div style="font-size:12px;color:var(--text-secondary);">Você pode comparar o 1º encontro com o último no Radar Cultural.</div>
          <button class="btn btn-sm mt-8" style="background:var(--green);color:white;" onclick="Pages.Radar._selecionarCard('${colaborador.id}');App.navigate('radar')">
            <i data-lucide="radar"></i> Abrir Radar Cultural
          </button>
        </div>
      ` : `<div style="margin-top:12px;text-align:center;color:var(--text-tertiary);font-size:12.5px;">${comRadar.length===0?'Realize ao menos 1 encontro para ver o radar.':'Com 2+ encontros, verá a evolução comparativa.'}</div>`}`;
  },

  _renderTabDiario(concluidas) {
    const comDiario = concluidas.filter(r => r.diario && Object.values(r.diario).some(v => v));
    if (!comDiario.length) return `<div style="text-align:center;padding:40px;color:var(--text-tertiary);">Nenhuma anotação no diário ainda.</div>`;
    const cores = { primeiro:'#6366f1', acompanhamento:'#10b981', encerramento:'#f59e0b' };
    return `
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${comDiario.map(r => {
          const cor = cores[r.tipo||'acompanhamento'] || '#10b981';
          const label = r.tipo === 'primeiro' ? '1º Encontro' : r.tipo === 'encerramento' ? 'Encerramento' : `Acomp. #${r.numReuniao||''}`;
          const d = r.diario;
          return `
            <div style="border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;">
              <div style="padding:12px 16px;background:var(--bg-elevated);display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:13px;font-weight:700;color:${cor};">${label}</span>
                <span style="font-size:11.5px;color:var(--text-tertiary);">${Utils.formatDate(r.updatedAt)}</span>
              </div>
              <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">
                ${d.observacoes?`<div><div style="font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Observações</div><p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">${Utils.sanitize(d.observacoes)}</p></div>`:''}
                ${d.positivos?`<div><div style="font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">✅ Pontos Positivos</div><p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">${Utils.sanitize(d.positivos)}</p></div>`:''}
                ${d.atencao?`<div><div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">⚠️ Pontos de Atenção</div><p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">${Utils.sanitize(d.atencao)}</p></div>`:''}
                ${d.proximos?`<div><div style="font-size:11px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">🎯 Próximos Passos</div><p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">${Utils.sanitize(d.proximos)}</p></div>`:''}
              </div>
            </div>`;
        }).join('')}
      </div>`;
  },

  _renderIndicadoresSidebar(concluidas) {
    const comInd = concluidas.filter(r => r.indicadores);
    if (!comInd.length) return `<div class="card"><div style="font-size:13px;color:var(--text-tertiary);text-align:center;">Indicadores disponíveis após o primeiro encontro.</div></div>`;
    const labels = { integracao:'Integração', adaptacao:'Adaptação', cultura:'Cultura', equipe:'Equipe', seguranca:'Segurança' };
    const ultima = comInd[comInd.length - 1];
    return `
      <div class="card">
        <div style="font-size:13px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:6px;">
          <i data-lucide="star" style="width:14px;height:14px;color:var(--amber);"></i> Últimos Indicadores
        </div>
        ${Object.entries(labels).map(([key, label]) => {
          const val = ultima.indicadores?.[key] || 0;
          return `
            <div style="margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                <span style="font-size:12px;color:var(--text-secondary);">${label}</span>
                <span style="font-size:12px;font-weight:700;color:var(--amber);">${'★'.repeat(val)}${'☆'.repeat(5-val)}</span>
              </div>
              <div class="progress" style="height:4px;"><div class="progress-bar" style="width:${val*20}%;background:var(--amber);"></div></div>
            </div>`;
        }).join('')}
      </div>`;
  },

  _initRadarChart(concluidas) {
    const canvas = document.getElementById('radar-collab');
    if (!canvas || !window.Chart) return;
    const comRadar = concluidas.filter(r => r.radarValores && Object.keys(r.radarValores).length > 0);
    if (!comRadar.length) return;
    const labels = AppData.valores.map(v => v.nome);
    const cores = ['#6366f1','#10b981','#f59e0b','#ef4444'];
    const isDark = DB.Config.getTema() === 'dark';
    const datasets = comRadar.slice(-2).map((r,i) => {
      const tipo = r.tipo || 'acompanhamento';
      const lbl = tipo==='primeiro'?'1º Encontro':tipo==='encerramento'?'Encerramento':`Acomp. #${r.numReuniao||i+1}`;
      return {
        label: lbl,
        data: AppData.valores.map(v => r.radarValores[v.id]||0),
        borderColor: cores[i]||cores[0], backgroundColor: (cores[i]||cores[0])+'20',
        pointBackgroundColor: cores[i]||cores[0], pointRadius: 4, borderWidth: 2,
      };
    });
    if (window._radarCollabChart) window._radarCollabChart.destroy();
    window._radarCollabChart = new Chart(canvas, {
      type: 'radar', data: { labels, datasets },
      options: {
        responsive:true, maintainAspectRatio:false,
        scales: { r: { min:0,max:5, ticks:{stepSize:1,display:false},
          grid:{color:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'},
          angleLines:{color:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'},
          pointLabels:{font:{size:11},color:isDark?'#94a3b8':'#334155'} }},
        plugins:{legend:{position:'bottom',labels:{font:{size:11},color:isDark?'#94a3b8':'#475569',padding:16,usePointStyle:true}}}
      }
    });
  },

  _initIndicadoresChart(concluidas) {
    const canvas = document.getElementById('chart-indicadores-collab');
    if (!canvas || !window.Chart) return;
    const comInd = concluidas.filter(r => r.indicadores);
    if (!comInd.length) return;
    const labels = comInd.map((r,i) => r.tipo==='primeiro'?'1º Enc.':r.tipo==='encerramento'?'Enc.Final':`#${r.numReuniao||i+1}`);
    const campos = ['integracao','adaptacao','cultura','equipe','seguranca'];
    const nomes  = ['Integração','Adaptação','Cultura','Equipe','Segurança'];
    const cores  = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6'];
    const isDark = DB.Config.getTema() === 'dark';
    if (window._indCollabChart) window._indCollabChart.destroy();
    window._indCollabChart = new Chart(canvas, {
      type:'line',
      data:{ labels, datasets: campos.map((c,i)=>({
        label:nomes[i], data:comInd.map(r=>r.indicadores?.[c]||0),
        borderColor:cores[i], tension:0.4, pointRadius:5, fill:false, borderWidth:2,
        pointBackgroundColor:cores[i],
      }))},
      options:{
        responsive:true, maintainAspectRatio:false,
        scales:{
          y:{min:0,max:5,ticks:{stepSize:1,color:isDark?'#64748b':'#94a3b8'},grid:{color:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.05)'}},
          x:{ticks:{color:isDark?'#64748b':'#94a3b8'},grid:{display:false}}
        },
        plugins:{legend:{position:'bottom',labels:{font:{size:11},color:isDark?'#94a3b8':'#475569',padding:12}}}
      }
    });
  },

  async _verReuniao(reuniaoId) {
    const r = await DB.Reunioes.getById(reuniaoId);
    if (!r) return;
    const tipo = r.tipo || 'acompanhamento';
    const cores = { primeiro:'#6366f1', acompanhamento:'#10b981', encerramento:'#f59e0b' };
    const cor = cores[tipo] || '#10b981';
    const label = tipo==='primeiro'?'1º Encontro':tipo==='encerramento'?'Encerramento do Ciclo':`Acompanhamento #${r.numReuniao||''}`;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <div>
            <h2 style="color:${cor};">${label}</h2>
            <p>${Utils.formatDate(r.createdAt, 'dd/mm/yyyy')} ${r.duracao?`· ⏱ ${Utils.formatTimer(r.duracao)}`:''}</p>
          </div>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:16px;">
          ${r.insight ? `
            <div style="background:${cor}15;border-radius:var(--r-md);padding:16px;border-left:3px solid ${cor};">
              <div style="font-size:12px;font-weight:700;color:${cor};margin-bottom:6px;">💡 INSIGHT GERADO</div>
              <p style="font-size:13.5px;color:var(--text-primary);line-height:1.7;">${Utils.sanitize(r.insight)}</p>
            </div>` : ''}
          ${r.indicadores ? `
            <div>
              <div style="font-size:13px;font-weight:700;margin-bottom:10px;">Indicadores</div>
              <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">
                ${Object.entries({integracao:'Integração',adaptacao:'Adaptação',cultura:'Cultura',equipe:'Equipe',seguranca:'Segurança'}).map(([k,l])=>`
                  <div style="background:var(--bg-elevated);border-radius:var(--r-md);padding:10px;text-align:center;">
                    <div style="font-size:18px;font-weight:800;color:var(--amber);">${r.indicadores[k]||0}</div>
                    <div style="font-size:10px;color:var(--text-tertiary);">${l}</div>
                  </div>`).join('')}
              </div>
            </div>` : ''}
          ${r.radarValores && Object.keys(r.radarValores).length > 0 ? `
            <div>
              <div style="font-size:13px;font-weight:700;margin-bottom:10px;">Radar Cultural</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${AppData.valores.map(v => {
                  const val = r.radarValores[v.id]||0;
                  return val>0?`<span style="padding:4px 10px;background:#22c55e18;border:1px solid #22c55e33;border-radius:99px;font-size:12px;color:#22c55e;font-weight:600;">${v.emoji} ${v.nome}: ${val}/5</span>`:'';
                }).join('')}
              </div>
            </div>` : ''}
          ${r.respostas?.length ? `
            <div>
              <div style="font-size:13px;font-weight:700;margin-bottom:12px;">Perguntas e Respostas</div>
              <div style="display:flex;flex-direction:column;gap:10px;">
                ${r.respostas.filter(res=>res.resposta).map(res=>`
                  <div style="padding:14px;background:var(--bg-elevated);border-radius:var(--r-md);">
                    <div style="font-size:12px;font-weight:600;color:var(--text-tertiary);margin-bottom:5px;">${Utils.sanitize(res.pergunta||'')}</div>
                    <div style="font-size:13.5px;color:var(--text-primary);line-height:1.6;">${Utils.sanitize(res.resposta||'')}</div>
                  </div>`).join('')}
              </div>
            </div>` : ''}
        </div>
      </div>`;
    document.body.appendChild(overlay);
    App.initLucide();
    requestAnimationFrame(() => overlay.classList.add('active'));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  },

  _excluir(id) {
    Utils.confirm('Excluir Colaborador', 'Esta ação irá remover o colaborador e todo o histórico de reuniões. Não pode ser desfeita.',
      async () => {
        try {
          await DB.Colaboradores.delete(id);
          Utils.toast('Colaborador excluído.','info');
          App.navigate('afilhados');
        } catch(e) {
          Utils.toast('Erro ao excluir: ' + (e.message||''), 'error');
        }
      },
      { tipo:'danger', confirmText:'Sim, excluir' });
  },

  _gerarRelatorio(id) { App.navigate('relatorios', { colaboradorId: id }); }
};
