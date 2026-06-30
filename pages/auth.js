// ============================================================
// AUTH.JS — Telas de Login e Cadastro
// Comitê de Cultura - LINKCE
// ============================================================

Pages.Login = {
  _modo: 'login', // 'login' | 'cadastro' | 'reset'

  render(root) {
    document.getElementById('main-content')?.style && (document.getElementById('main-content').style.marginLeft = '0');
    document.getElementById('sidebar')?.style && (document.getElementById('sidebar').style.display = 'none');

    root.style.padding = '0';
    root.style.maxWidth = '100%';
    root.style.margin = '0';

    root.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
        background:var(--bg-base);padding:20px;position:relative;overflow:hidden;">

        <!-- Fundo decorativo -->
        <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden;">
          <div style="position:absolute;top:-20%;left:-10%;width:600px;height:600px;
            border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%);"></div>
          <div style="position:absolute;bottom:-20%;right:-10%;width:500px;height:500px;
            border-radius:50%;background:radial-gradient(circle,rgba(34,197,94,0.08),transparent 70%);"></div>
        </div>

        <!-- Card central -->
        <div style="width:100%;max-width:420px;position:relative;z-index:1;">

          <!-- Logo / Header -->
          <div style="text-align:center;margin-bottom:32px;">
            <div style="width:56px;height:56px;background:var(--brand);border-radius:var(--r-lg);
              display:flex;align-items:center;justify-content:center;margin:0 auto 16px;
              box-shadow:0 0 0 8px rgba(99,102,241,0.12);">
              <i data-lucide="heart-handshake" style="width:28px;height:28px;color:white;"></i>
            </div>
            <h1 style="font-size:22px;font-weight:800;color:var(--text-primary);letter-spacing:-0.5px;">
              Comitê de Cultura
            </h1>
            <p style="font-size:13px;color:var(--text-tertiary);margin-top:4px;">LINKCE · Plataforma de Acompanhamento</p>
          </div>

          <!-- Card do formulário -->
          <div class="card" style="padding:32px;">

            <!-- Tabs login/cadastro -->
            <div style="display:flex;background:var(--bg-elevated);border-radius:var(--r-lg);
              padding:4px;margin-bottom:28px;">
              <button id="tab-login" onclick="Pages.Login._setModo('login')"
                style="flex:1;padding:8px;border:none;border-radius:var(--r-md);font-size:13.5px;
                  font-weight:600;cursor:pointer;transition:all .2s;
                  background:${this._modo==='login'?'var(--bg-surface)':'transparent'};
                  color:${this._modo==='login'?'var(--text-primary)':'var(--text-tertiary)'};
                  box-shadow:${this._modo==='login'?'var(--shadow-sm)':'none'};">
                Entrar
              </button>
              <button id="tab-cadastro" onclick="Pages.Login._setModo('cadastro')"
                style="flex:1;padding:8px;border:none;border-radius:var(--r-md);font-size:13.5px;
                  font-weight:600;cursor:pointer;transition:all .2s;
                  background:${this._modo==='cadastro'?'var(--bg-surface)':'transparent'};
                  color:${this._modo==='cadastro'?'var(--text-primary)':'var(--text-tertiary)'};
                  box-shadow:${this._modo==='cadastro'?'var(--shadow-sm)':'none'};">
                Criar Conta
              </button>
            </div>

            <!-- Formulário dinâmico -->
            <div id="auth-form">
              ${this._modo === 'login' ? this._formLogin() : this._formCadastro()}
            </div>

          </div>

          <!-- Frase da cartilha -->
          <p style="text-align:center;font-size:12px;color:var(--text-disabled);margin-top:24px;line-height:1.6;">
            "Desenvolver pessoas é uma escolha diária."
          </p>
        </div>
      </div>
    `;

    App.initLucide();
    setTimeout(() => document.getElementById('auth-email')?.focus(), 80);
  },

  _setModo(modo) {
    this._modo = modo;
    // Atualizar tabs sem re-renderizar tudo
    const tLogin   = document.getElementById('tab-login');
    const tCadastro= document.getElementById('tab-cadastro');
    if (tLogin) {
      tLogin.style.background = modo==='login' ? 'var(--bg-surface)' : 'transparent';
      tLogin.style.color      = modo==='login' ? 'var(--text-primary)' : 'var(--text-tertiary)';
      tLogin.style.boxShadow  = modo==='login' ? 'var(--shadow-sm)' : 'none';
    }
    if (tCadastro) {
      tCadastro.style.background = modo==='cadastro' ? 'var(--bg-surface)' : 'transparent';
      tCadastro.style.color      = modo==='cadastro' ? 'var(--text-primary)' : 'var(--text-tertiary)';
      tCadastro.style.boxShadow  = modo==='cadastro' ? 'var(--shadow-sm)' : 'none';
    }
    const form = document.getElementById('auth-form');
    if (form) {
      form.innerHTML = modo === 'login' ? this._formLogin() : this._formCadastro();
      App.initLucide();
      setTimeout(() => document.getElementById('auth-email')?.focus(), 60);
    }
  },

  _formLogin() {
    return `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="form-group" style="margin:0;">
          <label class="form-label">E-mail</label>
          <div style="position:relative;">
            <i data-lucide="mail" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);
              width:15px;height:15px;color:var(--text-tertiary);pointer-events:none;"></i>
            <input type="email" class="form-input" id="auth-email"
              placeholder="seu@email.com" style="padding-left:38px;"
              onkeydown="if(event.key==='Enter')document.getElementById('auth-senha')?.focus()">
          </div>
        </div>

        <div class="form-group" style="margin:0;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <label class="form-label" style="margin:0;">Senha</label>
            <button onclick="Pages.Login._resetSenha()" type="button"
              style="font-size:12px;color:var(--brand);background:none;border:none;cursor:pointer;padding:0;">
              Esqueci a senha
            </button>
          </div>
          <div style="position:relative;">
            <i data-lucide="lock" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);
              width:15px;height:15px;color:var(--text-tertiary);pointer-events:none;"></i>
            <input type="password" class="form-input" id="auth-senha"
              placeholder="••••••••" style="padding-left:38px;"
              onkeydown="if(event.key==='Enter')Pages.Login._login()">
          </div>
        </div>

        <div id="auth-erro" style="display:none;padding:10px 14px;background:var(--red-soft);
          border:1px solid rgba(239,68,68,0.25);border-radius:var(--r-md);font-size:13px;color:var(--red);"></div>

        <button class="btn btn-primary w-full" id="btn-login" onclick="Pages.Login._login()"
          style="height:44px;font-size:14.5px;">
          <i data-lucide="log-in"></i> Entrar
        </button>
      </div>
    `;
  },

  _formCadastro() {
    return `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="form-row" style="gap:12px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Seu Nome <span class="required">*</span></label>
            <input type="text" class="form-input" id="auth-nome"
              placeholder="Ex: João Silva"
              onkeydown="if(event.key==='Enter')document.getElementById('auth-cargo')?.focus()">
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Cargo</label>
            <input type="text" class="form-input" id="auth-cargo"
              placeholder="Ex: Analista RH"
              value="Comitê de Cultura"
              onkeydown="if(event.key==='Enter')document.getElementById('auth-email')?.focus()">
          </div>
        </div>

        <div class="form-group" style="margin:0;">
          <label class="form-label">E-mail <span class="required">*</span></label>
          <div style="position:relative;">
            <i data-lucide="mail" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);
              width:15px;height:15px;color:var(--text-tertiary);pointer-events:none;"></i>
            <input type="email" class="form-input" id="auth-email"
              placeholder="seu@linkce.com.br" style="padding-left:38px;"
              onkeydown="if(event.key==='Enter')document.getElementById('auth-senha')?.focus()">
          </div>
        </div>

        <div class="form-group" style="margin:0;">
          <label class="form-label">Senha <span class="required">*</span></label>
          <div style="position:relative;">
            <i data-lucide="lock" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);
              width:15px;height:15px;color:var(--text-tertiary);pointer-events:none;"></i>
            <input type="password" class="form-input" id="auth-senha"
              placeholder="Mínimo 6 caracteres" style="padding-left:38px;"
              onkeydown="if(event.key==='Enter')document.getElementById('auth-senha2')?.focus()">
          </div>
        </div>

        <div class="form-group" style="margin:0;">
          <label class="form-label">Confirmar Senha <span class="required">*</span></label>
          <div style="position:relative;">
            <i data-lucide="lock" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);
              width:15px;height:15px;color:var(--text-tertiary);pointer-events:none;"></i>
            <input type="password" class="form-input" id="auth-senha2"
              placeholder="Repita a senha" style="padding-left:38px;"
              onkeydown="if(event.key==='Enter')Pages.Login._cadastrar()">
          </div>
        </div>

        <div id="auth-erro" style="display:none;padding:10px 14px;background:var(--red-soft);
          border:1px solid rgba(239,68,68,0.25);border-radius:var(--r-md);font-size:13px;color:var(--red);"></div>

        <button class="btn btn-primary w-full" id="btn-cadastro" onclick="Pages.Login._cadastrar()"
          style="height:44px;font-size:14.5px;">
          <i data-lucide="user-plus"></i> Criar Conta
        </button>

        <p style="font-size:11.5px;color:var(--text-tertiary);text-align:center;line-height:1.5;">
          Ao criar sua conta, você concorda com o uso dos dados conforme a política da LINKCE.
        </p>
      </div>
    `;
  },

  _setLoading(btn, loading) {
    const el = document.getElementById(btn);
    if (!el) return;
    el.disabled    = loading;
    el.innerHTML   = loading
      ? '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>'
      : btn === 'btn-login'
        ? '<i data-lucide="log-in"></i> Entrar'
        : '<i data-lucide="user-plus"></i> Criar Conta';
    if (!loading) App.initLucide();
  },

  _setErro(msg) {
    const el = document.getElementById('auth-erro');
    if (!el) return;
    if (msg) { el.textContent = msg; el.style.display = 'block'; }
    else       { el.style.display = 'none'; }
  },

  _traduzirErro(msg = '') {
    if (msg.includes('Invalid login'))        return 'E-mail ou senha incorretos.';
    if (msg.includes('Email not confirmed'))  return 'Confirme seu e-mail antes de entrar.';
    if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.';
    if (msg.includes('Password should be'))   return 'A senha deve ter pelo menos 6 caracteres.';
    if (msg.includes('Unable to validate'))   return 'E-mail inválido.';
    if (msg.includes('Network'))              return 'Erro de conexão. Verifique a internet.';
    return msg || 'Ocorreu um erro. Tente novamente.';
  },

  async _login() {
    const email = document.getElementById('auth-email')?.value?.trim();
    const senha = document.getElementById('auth-senha')?.value;
    this._setErro('');
    if (!email || !senha) { this._setErro('Preencha e-mail e senha.'); return; }
    this._setLoading('btn-login', true);
    try {
      await Auth.login(email, senha);
      // onAuthStateChange cuida do redirect
    } catch(e) {
      this._setErro(this._traduzirErro(e.message));
      this._setLoading('btn-login', false);
    }
  },

  async _cadastrar() {
    const nome  = document.getElementById('auth-nome')?.value?.trim();
    const cargo = document.getElementById('auth-cargo')?.value?.trim() || 'Comitê de Cultura';
    const email = document.getElementById('auth-email')?.value?.trim();
    const senha = document.getElementById('auth-senha')?.value;
    const senha2= document.getElementById('auth-senha2')?.value;
    this._setErro('');

    if (!nome)          { this._setErro('Informe seu nome.'); return; }
    if (!email)         { this._setErro('Informe seu e-mail.'); return; }
    if (!senha)         { this._setErro('Crie uma senha.'); return; }
    if (senha.length < 6) { this._setErro('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (senha !== senha2) { this._setErro('As senhas não coincidem.'); return; }

    this._setLoading('btn-cadastro', true);
    try {
      await Auth.cadastrar(nome, cargo, email, senha);
      // Mostrar mensagem de confirmação de e-mail
      document.getElementById('auth-form').innerHTML = `
        <div style="text-align:center;padding:20px 0;">
          <div style="font-size:40px;margin-bottom:16px;">📧</div>
          <h3 style="font-size:17px;font-weight:700;margin-bottom:8px;">Verifique seu e-mail!</h3>
          <p style="font-size:13.5px;color:var(--text-secondary);line-height:1.6;">
            Enviamos um link de confirmação para <strong>${Utils.sanitize(email)}</strong>.
            <br>Clique no link para ativar sua conta e depois volte para fazer login.
          </p>
          <button class="btn btn-primary mt-16" onclick="Pages.Login._setModo('login')">
            <i data-lucide="log-in"></i> Ir para Login
          </button>
        </div>
      `;
      App.initLucide();
    } catch(e) {
      this._setErro(this._traduzirErro(e.message));
      this._setLoading('btn-cadastro', false);
    }
  },

  async _resetSenha() {
    const email = document.getElementById('auth-email')?.value?.trim();
    if (!email) {
      this._setErro('Digite seu e-mail acima para redefinir a senha.');
      return;
    }
    try {
      await sb.auth.resetPasswordForEmail(email);
      Utils.toast('Link de redefinição enviado para ' + email, 'success', 5000);
    } catch(e) {
      Utils.toast('Erro ao enviar e-mail de redefinição.', 'error');
    }
  }
};
