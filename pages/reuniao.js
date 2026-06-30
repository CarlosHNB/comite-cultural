// ============================================================
// REUNIAO.JS — Modo Reunião com frequência dinâmica
// Compatível com templates_encontro (primeiro / acompanhamento / encerramento)
// ============================================================

Pages.Reuniao = {
  _state: null,
  _timerInterval: null,

  async render(root, params = {}) {
    const { colaboradorId, tipoEncontro, numReuniao } = params;
    const colaborador = await DB.Colaboradores.getById(colaboradorId);

    if (!colaborador) {
      root.innerHTML = `<div class="empty-state"><h3>Colaborador não encontrado</h3><button class="btn btn-primary mt-16" onclick="App.navigate('afilhados')">Voltar</button></div>`;
      return;
    }

    const todasReunioes = await DB.Reunioes.getByColaborador(colaboradorId);
    const concluidas = todasReunioes.filter(r => r.status === 'concluida');
    const numReuniaoAtual = numReuniao || (concluidas.length + 1);

    // Determinar tipo: se não passado, inferir pelo histórico
    let tipo = tipoEncontro;
    if (!tipo) {
      if (concluidas.length === 0) tipo = 'primeiro';
      else if (colaborador.status === 'encerrar') tipo = 'encerramento';
      else tipo = 'acompanhamento';
    }

    const template = AppData.templates_encontro.find(t => t.tipo === tipo) || AppData.templates_encontro[1];

    // IDs de perguntas já usadas neste colaborador
    const perguntasUsadas = concluidas.flatMap(r => (r.respostas||[]).map(p => p.perguntaId));

    // Usar banco dinâmico (DB.Perguntas) com fallback para o estático (utils)
    let perguntas = [];
    try {
      const bancoDinamico = await DB.Perguntas.getByTipo(tipo);
      if (bancoDinamico.length > 0) {
        perguntas = await DB.Perguntas.selecionarParaEncontro(tipo, perguntasUsadas, template.num_perguntas || 7);
      } else {
        perguntas = Utils.selectPerguntas(template, perguntasUsadas, template.num_perguntas || 7);
      }
    } catch(e) {
      perguntas = Utils.selectPerguntas(template, perguntasUsadas, template.num_perguntas || 7);
    }

    this._state = {
      colaboradorId,
      tipo,
      numReuniao: numReuniaoAtual,
      template,
      colaborador,
      perguntas,
      respostas: [],
      indicadores: { integracao: 0, adaptacao: 0, cultura: 0, equipe: 0, seguranca: 0 },
      radarValores: {},
      diario: { observacoes: '', positivos: '', atencao: '', proximos: '' },
      passo: 0,
      timerSegundos: 0,
      reuniaoId: null,
    };

    root.style.padding = '0';
    root.style.maxWidth = '100%';
    root.style.margin = '0';

    this._renderPasso(root);
    this._startTimer();
  },

  _renderPasso(root) {
    const s = this._state;
    const t = s.template;
    const total = s.perguntas.length + 4;
    const passo = s.passo;
    const progresso = Math.min((passo / (total - 1)) * 100, 100);

    const faseInd    = s.perguntas.length + 1;
    const faseRadar  = s.perguntas.length + 2;
    const faseDiario = s.perguntas.length + 3;
    const faseConc   = s.perguntas.length + 4;

    let conteudo = '';
    if (passo === 0) conteudo = this._renderIntro(t, s.colaborador);
    else if (passo <= s.perguntas.length) {
      const perg = s.perguntas[passo - 1];
      const resp = s.respostas.find(r => r.perguntaId === perg.id)?.resposta || '';
      conteudo = this._renderPergunta(perg, passo, s.perguntas.length, resp);
    } else if (passo === faseInd)    conteudo = this._renderIndicadores();
    else if (passo === faseRadar)    conteudo = this._renderRadarValores();
    else if (passo === faseDiario)   conteudo = this._renderDiario();
    else if (passo === faseConc)   { conteudo = this._renderConclusao(); this._stopTimer(); }

    // Cores por tipo
    const cores = { primeiro: '#6366f1', acompanhamento: '#10b981', encerramento: '#f59e0b' };
    const cor = cores[s.tipo] || '#6366f1';

    root.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;background:var(--bg-base);">

        <!-- Header modo foco -->
        <div style="padding:14px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:16px;background:var(--bg-surface);position:sticky;top:0;z-index:10;">
          <button class="btn btn-ghost btn-sm" onclick="Pages.Reuniao._confirmarSaida()">
            <i data-lucide="x"></i>
          </button>
          <div style="flex:1;">
            <div style="font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">
              ${t.label} #${s.numReuniao} · ${Utils.sanitize(s.colaborador.nome)}
              ${s.colaborador.padrinho ? `<span style="color:${cor};margin-left:6px;">· ${Utils.sanitize(s.colaborador.padrinho)}</span>` : ''}
            </div>
            <div style="background:var(--bg-elevated);border-radius:99px;height:5px;overflow:hidden;">
              <div style="height:100%;background:${cor};border-radius:99px;width:${progresso}%;transition:width .5s ease;"></div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
            <div style="font-size:12px;color:var(--text-tertiary);font-weight:600;">
              ${passo === 0 ? 'Início' : passo >= faseConc ? '✓ Concluído' : `${passo} / ${s.perguntas.length + 3}`}
            </div>
            <div id="reuniao-timer" style="font-size:13px;font-weight:700;color:${cor};background:${cor}18;padding:4px 10px;border-radius:99px;font-variant-numeric:tabular-nums;">
              ${Utils.formatTimer(s.timerSegundos)}
            </div>
          </div>
        </div>

        <!-- Conteúdo -->
        <div style="flex:1;display:flex;align-items:flex-start;justify-content:center;padding:48px 24px;overflow-y:auto;">
          <div style="width:100%;max-width:680px;" class="fade-in">${conteudo}</div>
        </div>

        <!-- Footer navegação -->
        ${passo < faseConc ? `
          <div style="padding:18px 24px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--bg-surface);">
            <button class="btn btn-ghost" onclick="Pages.Reuniao._anterior()" ${passo === 0 ? 'disabled' : ''}>
              <i data-lucide="arrow-left"></i> Anterior
            </button>
            <span style="font-size:12px;color:var(--text-tertiary);">
              ${passo > 0 && passo <= s.perguntas.length ? `Pergunta ${passo} de ${s.perguntas.length}` : ''}
            </span>
            <button class="btn btn-primary" id="btn-proximo" onclick="Pages.Reuniao._proximo()"
              style="background:${cor};box-shadow:0 4px 14px ${cor}44;">
              ${passo === 0 ? 'Começar' : passo >= faseDiario ? 'Finalizar' : 'Próxima'}
              <i data-lucide="${passo === 0 ? 'play' : 'arrow-right'}"></i>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    App.initLucide();
    if (passo > 0 && passo <= s.perguntas.length) {
      setTimeout(() => document.getElementById('resp-input')?.focus(), 80);
    }
  },

  _renderIntro(t, colaborador) {
    const cores = { primeiro: '#6366f1', acompanhamento: '#10b981', encerramento: '#f59e0b' };
    const cor = cores[this._state.tipo] || '#6366f1';
    const freq = colaborador.frequenciaDias || 15;
    const numRealizadas = this._state.numReuniao - 1;

    return `
      <div style="text-align:center;padding:20px 0;">
        <div style="width:80px;height:80px;border-radius:50%;background:${cor}18;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;border:2px solid ${cor}44;">
          <i data-lucide="${t.icone}" style="width:36px;height:36px;color:${cor};"></i>
        </div>
        <div style="font-size:11px;font-weight:800;letter-spacing:1.5px;color:${cor};text-transform:uppercase;margin-bottom:8px;">${t.label}</div>
        <h1 style="font-size:30px;font-weight:800;letter-spacing:-1px;margin-bottom:12px;">${t.titulo}</h1>
        <p style="font-size:15px;color:var(--text-secondary);line-height:1.7;max-width:520px;margin:0 auto 32px;">${t.descricao}</p>

        <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px;text-align:left;margin-bottom:28px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-tertiary);margin-bottom:10px;">Objetivo deste encontro</div>
          <p style="font-size:14px;color:var(--text-primary);line-height:1.7;font-weight:500;">${t.objetivo}</p>
        </div>

        <div style="display:flex;align-items:center;gap:16px;justify-content:center;flex-wrap:wrap;font-size:13px;color:var(--text-tertiary);">
          <div style="display:flex;align-items:center;gap:8px;">
            ${Utils.avatarHtml(colaborador, 30)}
            <div style="text-align:left;">
              <div style="font-weight:700;color:var(--text-primary);font-size:13.5px;">${Utils.sanitize(colaborador.nome)}</div>
              ${colaborador.padrinho ? `<div style="font-size:11px;color:${cor};">Padrinho: ${Utils.sanitize(colaborador.padrinho)}</div>` : ''}
            </div>
          </div>
          <span>·</span>
          <div><i data-lucide="help-circle" style="width:13px;height:13px;vertical-align:middle;"></i> ${this._state.perguntas.length} perguntas</div>
          <span>·</span>
          <div><i data-lucide="repeat" style="width:13px;height:13px;vertical-align:middle;"></i> A cada ${freq} dias</div>
          <span>·</span>
          <div><i data-lucide="hash" style="width:13px;height:13px;vertical-align:middle;"></i> ${numRealizadas + 1}º encontro</div>
        </div>
      </div>
    `;
  },

  _renderPergunta(pergunta, num, total, valorAtual) {
    const catIcons = {
      acolhimento:'🤝', integracao:'🏢', lideranca:'👤', equipe:'👥',
      foco_cliente:'🎯', etica:'🛡️', entrega:'⚡', simplicidade:'✨',
      autorresponsabilidade:'💪', desenvolvimento:'🚀', feedback:'💭'
    };
    const icon = catIcons[pergunta.categoria] || '💬';

    // Chave relacionada (se houver)
    const chavesRelacionadas = AppData.chaves.filter(c => c.valor === pergunta.categoria);

    return `
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:28px;">
          <span style="font-size:20px;">${icon}</span>
          <span style="font-size:12px;font-weight:600;color:var(--text-tertiary);text-transform:capitalize;">${pergunta.categoria.replace(/_/g,' ')}</span>
          <span style="margin-left:auto;font-size:11px;color:var(--text-disabled);">${num} de ${total}</span>
        </div>

        <div style="font-size:23px;font-weight:800;letter-spacing:-0.5px;line-height:1.4;margin-bottom:28px;color:var(--text-primary);">
          ${Utils.sanitize(pergunta.texto)}
        </div>

        ${chavesRelacionadas.length > 0 ? `
          <div style="margin-bottom:20px;display:flex;gap:8px;flex-wrap:wrap;">
            ${chavesRelacionadas.slice(0,2).map(c => `
              <span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:#22c55e18;border:1px solid #22c55e33;border-radius:99px;font-size:11.5px;font-weight:600;color:#22c55e;">
                🔑 Chave ${c.numero}: ${c.texto.substring(0,40)}${c.texto.length>40?'...':''}
              </span>
            `).join('')}
          </div>
        ` : ''}

        <textarea
          id="resp-input"
          class="form-textarea"
          placeholder="Escreva as observações e respostas desta pergunta..."
          style="min-height:160px;font-size:15px;line-height:1.7;resize:none;padding:20px;"
          oninput="Pages.Reuniao._autoResize(this)"
        >${Utils.sanitize(valorAtual)}</textarea>

        <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:12px;color:var(--text-tertiary);">Ctrl + Enter para avançar</div>
          <button class="btn btn-ghost btn-sm" onclick="Pages.Reuniao._pularPergunta()">
            Pular <i data-lucide="skip-forward"></i>
          </button>
        </div>
      </div>
    `;
  },

  _renderIndicadores() {
    const ind = this._state.indicadores;
    const campos = [
      { key:'integracao',   label:'Integração',           desc:'Como o colaborador está integrado à empresa e processos?',         emoji:'🏢' },
      { key:'adaptacao',    label:'Adaptação',             desc:'Nível de adaptação ao ambiente, cultura e rotina de trabalho.',    emoji:'🔄' },
      { key:'cultura',      label:'Vivência da Cultura',   desc:'Percepção e aplicação dos valores LINKCE no dia a dia.',          emoji:'❤️' },
      { key:'equipe',       label:'Relac. com Equipe',     desc:'Qualidade das relações com colegas e liderança.',                 emoji:'👥' },
      { key:'seguranca',    label:'Segurança',             desc:'Confiança para executar suas atividades com qualidade.',          emoji:'🛡️' },
    ];

    return `
      <div>
        <div style="text-align:center;margin-bottom:36px;">
          <div style="font-size:12px;font-weight:800;color:var(--amber);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Indicadores</div>
          <h2 style="font-size:26px;font-weight:800;letter-spacing:-0.5px;">Como você avalia este encontro?</h2>
          <p style="font-size:14px;color:var(--text-secondary);margin-top:8px;">Avalie de 1 a 5 estrelas em cada dimensão</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${campos.map(c => `
            <div style="padding:18px 20px;background:var(--bg-elevated);border-radius:var(--r-lg);border:1px solid var(--border);">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
                <div>
                  <div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:6px;">${c.emoji} ${c.label}</div>
                  <div style="font-size:12.5px;color:var(--text-tertiary);margin-top:3px;">${c.desc}</div>
                </div>
                <div id="stars-${c.key}" style="display:flex;gap:5px;flex-shrink:0;">
                  ${[1,2,3,4,5].map(n => `
                    <button onclick="Pages.Reuniao._setIndicador('${c.key}',${n})"
                      style="width:38px;height:38px;border:none;background:none;cursor:pointer;font-size:24px;transition:transform .15s;color:${n<=(ind[c.key]||0)?'#f59e0b':'#334155'};"
                      onmouseenter="this.style.transform='scale(1.2)'" onmouseleave="this.style.transform=''">★</button>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  _renderRadarValores() {
    const radar = this._state.radarValores;
    return `
      <div>
        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-size:12px;font-weight:800;color:var(--brand);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">🎯 Radar Cultural</div>
          <h2 style="font-size:26px;font-weight:800;letter-spacing:-0.5px;">Quais valores apareceram?</h2>
          <p style="font-size:14px;color:var(--text-secondary);margin-top:8px;max-width:480px;margin-left:auto;margin-right:auto;">
            Marque a intensidade com que cada valor do Jeito LINKCE de Ser apareceu naturalmente durante a conversa.
          </p>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${AppData.valores.map(v => {
            const atual = radar[v.id] || 0;
            return `
              <div style="padding:16px 20px;background:var(--bg-elevated);border-radius:var(--r-lg);border:1px solid var(--border);border-left:3px solid #22c55e;">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
                  <div style="flex:1;min-width:0;">
                    <div style="font-weight:700;font-size:14px;color:#22c55e;display:flex;align-items:center;gap:6px;">
                      ${v.emoji} ${v.nome}
                    </div>
                    <div style="font-size:12px;color:var(--text-tertiary);margin-top:3px;">${v.descricao.substring(0,70)}...</div>
                    <!-- Chaves rápidas -->
                    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;">
                      ${v.chaves.map(c => `
                        <span style="font-size:10px;padding:2px 6px;background:#22c55e14;border-radius:4px;color:#22c55e;font-weight:600;">🔑${c.numero}</span>
                      `).join('')}
                    </div>
                  </div>
                  <div style="flex-shrink:0;">
                    <div style="font-size:10px;color:var(--text-tertiary);text-align:center;margin-bottom:5px;">Intensidade</div>
                    <div style="display:flex;gap:4px;" id="radar-btns-${v.id}">
                      ${[1,2,3,4,5].map(n => `
                        <button onclick="Pages.Reuniao._setRadar('${v.id}',${n},'#22c55e')"
                          style="width:32px;height:32px;border-radius:6px;border:1px solid ${n<=atual?'#22c55e':'var(--border)'};background:${n<=atual?'#22c55e22':'transparent'};color:${n<=atual?'#22c55e':'var(--text-tertiary)'};font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;">
                          ${n}
                        </button>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="margin-top:16px;padding:12px 16px;background:var(--brand-soft);border-radius:var(--r-md);border:1px solid var(--border-brand);font-size:12.5px;color:var(--text-secondary);">
          💡 <strong style="color:var(--brand);">Dica:</strong> Deixe em 0 (não clique) valores que não apareceram. Esses dados formam o Radar Cultural ao longo do tempo.
        </div>
      </div>
    `;
  },

  _renderDiario() {
    const d = this._state.diario;
    return `
      <div>
        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-size:12px;font-weight:800;color:var(--purple);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">📓 Diário de Evolução</div>
          <h2 style="font-size:26px;font-weight:800;letter-spacing:-0.5px;">Suas percepções</h2>
          <p style="font-size:14px;color:var(--text-secondary);margin-top:8px;">Registre o que você observou durante este encontro.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div>
            <label class="form-label" style="display:flex;align-items:center;gap:6px;"><span>📝</span> Observações Gerais</label>
            <textarea class="form-textarea" id="d-obs" placeholder="O que chamou atenção nesta conversa?" style="min-height:80px;">${d.observacoes||''}</textarea>
          </div>
          <div>
            <label class="form-label" style="display:flex;align-items:center;gap:6px;"><span>✅</span> Pontos Positivos</label>
            <textarea class="form-textarea" id="d-pos" placeholder="O que o colaborador está fazendo bem?" style="min-height:80px;">${d.positivos||''}</textarea>
          </div>
          <div>
            <label class="form-label" style="display:flex;align-items:center;gap:6px;"><span>⚠️</span> Pontos de Atenção</label>
            <textarea class="form-textarea" id="d-atc" placeholder="O que precisa de acompanhamento ou reforço?" style="min-height:80px;">${d.atencao||''}</textarea>
          </div>
          <div>
            <label class="form-label" style="display:flex;align-items:center;gap:6px;"><span>🎯</span> Próximos Passos</label>
            <textarea class="form-textarea" id="d-prx" placeholder="O que combinar para o próximo encontro?" style="min-height:80px;">${d.proximos||''}</textarea>
          </div>
        </div>
      </div>
    `;
  },

  _renderConclusao() {
    const s = this._state;
    const insight = Utils.generateInsight(s);
    const cores = { primeiro:'#6366f1', acompanhamento:'#10b981', encerramento:'#f59e0b' };
    const cor = cores[s.tipo] || '#6366f1';

    return `
      <div style="text-align:center;">
        <div style="width:88px;height:88px;border-radius:50%;background:var(--green-soft);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;border:2px solid var(--green);">
          <i data-lucide="check-circle-2" style="width:40px;height:40px;color:var(--green);"></i>
        </div>
        <h2 style="font-size:28px;font-weight:800;letter-spacing:-1px;margin-bottom:8px;">Encontro concluído! 🎉</h2>
        <p style="font-size:15px;color:var(--text-secondary);margin-bottom:32px;">
          ${s.template.label} #${s.numReuniao} de <strong>${Utils.sanitize(s.colaborador.nome)}</strong> registrado.
        </p>

        <!-- Insight -->
        <div style="background:linear-gradient(135deg,${cor}15,${cor}05);border:1px solid ${cor}33;border-radius:var(--r-xl);padding:24px;margin-bottom:28px;text-align:left;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <div style="width:34px;height:34px;border-radius:50%;background:${cor};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i data-lucide="sparkles" style="width:16px;height:16px;color:white;"></i>
            </div>
            <div>
              <div style="font-size:13px;font-weight:700;color:${cor};">Insight do Encontro</div>
              <div style="font-size:11px;color:var(--text-tertiary);">Gerado automaticamente</div>
            </div>
          </div>
          <p style="font-size:14px;color:var(--text-primary);line-height:1.8;" id="insight-text">${Utils.sanitize(insight)}</p>
        </div>

        <!-- Resumo indicadores -->
        ${this._renderResumoIndicadores()}

        <!-- Próximo acompanhamento -->
        <div style="margin-bottom:24px;padding:16px;background:var(--bg-elevated);border-radius:var(--r-lg);text-align:left;">
          <div style="font-size:12px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Próximo Acompanhamento Previsto</div>
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);">
            ${(() => {
              const freq = s.colaborador.frequenciaDias || 15;
              const proxima = new Date();
              proxima.setDate(proxima.getDate() + freq);
              return `${Utils.formatDate(proxima)} (daqui a ${freq} dias)`;
            })()}
          </div>
          <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;">Frequência configurada: a cada ${s.colaborador.frequenciaDias||15} dias</div>
        </div>

        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-ghost" onclick="App.navigate('colaborador',{id:'${s.colaboradorId}'})">
            <i data-lucide="user"></i> Ver Perfil
          </button>
          <button class="btn btn-primary btn-lg" onclick="Pages.Reuniao._salvarFinal()" style="background:${cor};box-shadow:0 4px 20px ${cor}44;">
            <i data-lucide="save"></i> Salvar Reunião
          </button>
        </div>
      </div>
    `;
  },

  _renderResumoIndicadores() {
    const ind = this._state.indicadores;
    const labels = { integracao:'Integração', adaptacao:'Adaptação', cultura:'Cultura', equipe:'Equipe', seguranca:'Segurança' };
    const vals = Object.values(ind).filter(v => v > 0);
    const media = vals.length ? vals.reduce((a,b) => a+b,0)/vals.length : 0;
    return `
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:24px;">
        ${Object.entries(labels).map(([key,label]) => `
          <div style="background:var(--bg-elevated);border-radius:var(--r-md);padding:12px 6px;text-align:center;">
            <div style="font-size:20px;font-weight:800;color:var(--amber);">${ind[key]||0}</div>
            <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px;">${label}</div>
          </div>
        `).join('')}
      </div>
      <div style="font-size:13px;color:var(--text-tertiary);margin-bottom:20px;">
        Média geral: <strong style="color:var(--amber);font-size:16px;">${media.toFixed(1)} ★</strong>
      </div>
    `;
  },

  // --- Navegação ---
  _proximo() {
    const s = this._state;
    const faseDiario = s.perguntas.length + 3;
    const faseConc   = s.perguntas.length + 4;

    // Salvar resposta de pergunta
    if (s.passo > 0 && s.passo <= s.perguntas.length) {
      const resposta = document.getElementById('resp-input')?.value?.trim() || '';
      const perg = s.perguntas[s.passo - 1];
      const idx = s.respostas.findIndex(r => r.perguntaId === perg.id);
      const item = { perguntaId: perg.id, pergunta: perg.texto, resposta, categoria: perg.categoria };
      if (idx >= 0) s.respostas[idx] = item; else s.respostas.push(item);
    }

    // Salvar diário
    if (s.passo === faseDiario) {
      s.diario = {
        observacoes: document.getElementById('d-obs')?.value?.trim() || '',
        positivos:   document.getElementById('d-pos')?.value?.trim() || '',
        atencao:     document.getElementById('d-atc')?.value?.trim() || '',
        proximos:    document.getElementById('d-prx')?.value?.trim() || '',
      };
    }

    s.passo++;
    const root = document.getElementById('page-root');
    root.style.padding = '0'; root.style.maxWidth = '100%';
    this._renderPasso(root);

    // Auto salvar ao chegar na conclusão
    if (s.passo === faseConc) this._salvarFinal();
  },

  _anterior() {
    if (this._state.passo > 0) {
      this._state.passo--;
      const root = document.getElementById('page-root');
      root.style.padding = '0'; root.style.maxWidth = '100%';
      this._renderPasso(root);
    }
  },

  _pularPergunta() {
    const s = this._state;
    const perg = s.perguntas[s.passo - 1];
    if (!s.respostas.find(r => r.perguntaId === perg.id)) {
      s.respostas.push({ perguntaId: perg.id, pergunta: perg.texto, resposta: '', categoria: perg.categoria });
    }
    s.passo++;
    const root = document.getElementById('page-root');
    root.style.padding = '0'; root.style.maxWidth = '100%';
    this._renderPasso(root);
  },

  _setIndicador(key, valor) {
    this._state.indicadores[key] = valor;
    document.querySelectorAll(`#stars-${key} button`).forEach((btn, i) => {
      btn.style.color = i < valor ? '#f59e0b' : '#334155';
    });
  },

  _setRadar(valorId, intensidade, cor = '#22c55e') {
    this._state.radarValores[valorId] = intensidade;
    const wrap = document.getElementById(`radar-btns-${valorId}`);
    if (wrap) {
      wrap.querySelectorAll('button').forEach((btn, i) => {
        const n = i + 1;
        btn.style.border = `1px solid ${n <= intensidade ? cor : 'var(--border)'}`;
        btn.style.background = n <= intensidade ? cor + '22' : 'transparent';
        btn.style.color = n <= intensidade ? cor : 'var(--text-tertiary)';
      });
    }
  },

  _autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.max(160, el.scrollHeight) + 'px';
  },

  _startTimer() {
    this._stopTimer();
    this._timerInterval = setInterval(() => {
      this._state.timerSegundos++;
      const el = document.getElementById('reuniao-timer');
      if (el) el.textContent = Utils.formatTimer(this._state.timerSegundos);
    }, 1000);
  },

  _stopTimer() {
    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
  },

  async _salvarFinal() {
    const s = this._state;
    const insight = document.getElementById('insight-text')?.textContent || Utils.generateInsight(s);

    const reuniao = {
      id: s.reuniaoId || undefined,
      colaboradorId: s.colaboradorId,
      tipo: s.tipo,
      numReuniao: s.numReuniao,
      numEncontro: s.numReuniao,
      status: 'concluida',
      respostas: s.respostas,
      indicadores: s.indicadores,
      radarValores: s.radarValores,
      diario: s.diario,
      insight,
      duracao: s.timerSegundos,
    };

    const btnSalvar = document.querySelector('button[onclick*="_salvarFinal"]');
    if (btnSalvar) { btnSalvar.disabled = true; btnSalvar.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div> Salvando...'; }

    try {
      const salva = await DB.Reunioes.save(reuniao);
      s.reuniaoId = salva.id;
      Utils.toast('Reunião salva com sucesso!', 'success');
      if (btnSalvar) { btnSalvar.innerHTML = '<i data-lucide="check"></i> Salvo!'; App.initLucide(); }
    } catch(e) {
      console.error(e);
      Utils.toast('Erro ao salvar: ' + (e.message || 'tente novamente'), 'error');
      if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.innerHTML = '<i data-lucide="save"></i> Salvar Reunião'; App.initLucide(); }
    }
  },

  _confirmarSaida() {
    Utils.confirm(
      'Sair do Modo Reunião',
      'Seu progresso parcial será perdido. Deseja sair mesmo assim?',
      () => { this._stopTimer(); App.navigate('afilhados'); },
      { tipo: 'danger', icone: 'log-out', confirmText: 'Sair' }
    );
  }
};
