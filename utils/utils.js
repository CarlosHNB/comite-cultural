// ============================================================
// UTILS.JS — Funções utilitárias globais
// Comitê de Cultura - LINKCE
// ============================================================

const Utils = {

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  formatDate(date, format = 'dd/mm/yyyy') {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d)) return '—';
    const pad = n => String(n).padStart(2, '0');
    const map = {
      dd: pad(d.getDate()), mm: pad(d.getMonth() + 1),
      yyyy: d.getFullYear(), yy: String(d.getFullYear()).slice(-2),
      HH: pad(d.getHours()), MM: pad(d.getMinutes()), SS: pad(d.getSeconds())
    };
    return format.replace(/dd|mm|yyyy|yy|HH|MM|SS/g, m => map[m]);
  },

  timeAgo(date) {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const min = Math.floor(diff / 60000);
    const h = Math.floor(min / 60);
    const d = Math.floor(h / 24);
    if (d > 30) return this.formatDate(date);
    if (d > 1) return `há ${d} dias`;
    if (d === 1) return 'ontem';
    if (h > 1) return `há ${h} horas`;
    if (h === 1) return 'há 1 hora';
    if (min > 1) return `há ${min} minutos`;
    return 'agora mesmo';
  },

  daysSince(date) {
    if (!date) return 0;
    return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  },

  // Retorna o template correto baseado no histórico do colaborador
  getTemplateParaReuniao(numReuniaoRealizada) {
    // 1ª reunião → primeiro encontro
    if (numReuniaoRealizada === 0) return AppData.templates_encontro[0];
    // última marcada como encerramento → encerramento
    // Intermediárias → acompanhamento
    return AppData.templates_encontro[1];
  },

  getTemplateEncerramento() {
    return AppData.templates_encontro[2];
  },

  // Próxima data de acompanhamento de um colaborador
  proximaData(colaborador, todasReunioes) {
    const rr = (todasReunioes || []).filter(r => r.colaboradorId === colaborador.id && r.status === 'concluida');
    const freq = colaborador.frequenciaDias || 15;
    if (rr.length === 0) return new Date(colaborador.dataAdmissao);
    const ultima = rr.sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt))[0];
    const proxima = new Date(ultima.updatedAt);
    proxima.setDate(proxima.getDate() + freq);
    return proxima;
  },

  initials(nome = '') {
    return nome.trim().split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
  },

  avatarColor(nome = '') {
    const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];
    let hash = 0;
    for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  },

  // Seleciona perguntas de acordo com o template do encontro
  selectPerguntas(tipoTemplate, usadas = [], quantidade = 7) {
    const template = typeof tipoTemplate === 'string'
      ? AppData.templates_encontro.find(t => t.tipo === tipoTemplate)
      : tipoTemplate;
    if (!template) return [];

    let candidatas = [];
    template.categorias_foco.forEach(cat => {
      const pergs = AppData.perguntas[cat] || [];
      candidatas.push(...pergs);
    });

    const disponiveis = candidatas.filter(p => !usadas.includes(p.id));
    const pool = disponiveis.length >= quantidade ? disponiveis : candidatas;
    return this.shuffle(pool).slice(0, Math.min(quantidade, pool.length));
  },

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  generateInsight(reuniao) {
    const { indicadores, radarValores } = reuniao;
    let partes = [];

    if (indicadores) {
      const vals = Object.values(indicadores).filter(v => v > 0);
      const media = vals.length ? vals.reduce((a,b) => a+b,0) / vals.length : 0;
      if (media >= 4.5) partes.push('O colaborador demonstra excelente adaptação e engajamento com a cultura LINKCE.');
      else if (media >= 3.5) partes.push('O colaborador apresenta boa evolução no processo de integração com o Jeito LINKCE de Ser.');
      else if (media >= 2.5) partes.push('O colaborador está em processo de adaptação com alguns pontos de atenção.');
      else partes.push('O colaborador necessita de suporte adicional para melhor integração à cultura.');

      const entries = Object.entries(indicadores).filter(([,v]) => v > 0);
      const [topKey, topVal] = entries.sort(([,a],[,b]) => b-a)[0] || [];
      const [lowKey, lowVal] = entries.sort(([,a],[,b]) => a-b)[0] || [];
      const labels = { integracao:'integração', adaptacao:'adaptação', cultura:'conhecimento da cultura', equipe:'relacionamento com a equipe', seguranca:'segurança nas atividades' };
      if (topVal >= 4) partes.push(`Ponto de destaque em ${labels[topKey] || topKey}.`);
      if (lowVal <= 2 && lowKey !== topKey) partes.push(`Atenção ao indicador de ${labels[lowKey] || lowKey} — recomenda-se reforço.`);
    }

    if (radarValores) {
      const valoresMarcados = Object.entries(radarValores)
        .filter(([,v]) => v >= 3)
        .map(([k]) => AppData.valores.find(v => v.id === k)?.nome)
        .filter(Boolean);
      if (valoresMarcados.length > 0) {
        partes.push(`Os valores "${valoresMarcados.slice(0,2).join('" e "')}" foram percebidos com clareza durante a conversa.`);
      }
    }

    const sugestoes = [
      'Sugere-se reforçar a conexão com a equipe em oportunidades informais.',
      'Recomenda-se aprofundar as Chaves LINKCE nos próximos encontros.',
      'Incentivar o uso de dados para embasar decisões — Chave 13.',
      'Reforçar o conceito de "Tudo é problema de todo mundo" — Chave 3.',
      'Celebrar os avanços percebidos e manter o ritmo dos acompanhamentos.',
    ];
    partes.push(sugestoes[Math.floor(Math.random() * sugestoes.length)]);
    return partes.join(' ');
  },

  toast(mensagem, tipo = 'success', duracao = 3500) {
    const container = document.getElementById('toast-container') || (() => {
      const el = document.createElement('div');
      el.id = 'toast-container';
      document.body.appendChild(el);
      return el;
    })();
    const icons = { success:'check-circle', error:'x-circle', warning:'alert-triangle', info:'info' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `<i data-lucide="${icons[tipo]||'info'}" class="toast-icon"></i><span>${mensagem}</span><button onclick="this.parentElement.remove()" class="toast-close"><i data-lucide="x"></i></button>`;
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons({ nodes: [toast] });
    requestAnimationFrame(() => toast.classList.add('toast-show'));
    setTimeout(() => { toast.classList.remove('toast-show'); setTimeout(() => toast.remove(), 350); }, duracao);
  },

  confirm(titulo, mensagem, onConfirm, opcoes = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-confirm-overlay';
    overlay.innerHTML = `
      <div class="modal-confirm">
        <div class="modal-confirm-icon ${opcoes.tipo||'danger'}">
          <i data-lucide="${opcoes.icone||'alert-triangle'}"></i>
        </div>
        <h3>${titulo}</h3>
        <p>${mensagem}</p>
        <div class="modal-confirm-actions">
          <button class="btn btn-ghost" id="confirm-cancel">${opcoes.cancelText||'Cancelar'}</button>
          <button class="btn ${opcoes.tipo==='danger'?'btn-danger':'btn-primary'}" id="confirm-ok">${opcoes.confirmText||'Confirmar'}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons({ nodes: [overlay] });
    requestAnimationFrame(() => overlay.classList.add('active'));
    const close = () => { overlay.classList.remove('active'); setTimeout(() => overlay.remove(), 300); };
    overlay.querySelector('#confirm-cancel').onclick = close;
    overlay.querySelector('#confirm-ok').onclick = () => { close(); onConfirm(); };
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
  },

  formatTimer(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },

  capitalize(str = '') { return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(); },
  truncate(str = '', max = 80) { return str.length > max ? str.slice(0, max-3)+'...' : str; },
  sanitize(str = '') { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; },
  debounce(fn, delay = 300) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); }; },

  download(content, filename, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },

  avatarHtml(colaborador, size = 48) {
    if (colaborador.foto) {
      return `<img src="${colaborador.foto}" alt="${Utils.sanitize(colaborador.nome)}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;">`;
    }
    const initials = Utils.initials(colaborador.nome);
    const color = Utils.avatarColor(colaborador.nome);
    return `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:${Math.floor(size/3)}px;flex-shrink:0;">${initials}</div>`;
  }
};
