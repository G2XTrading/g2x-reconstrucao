import { signIn, signOut, getCurrentSession, observeAuth } from "./auth.js";
import { supabase } from "./supabase.js";

const loginStyles = `
  #reconstrucao-login {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: grid;
    place-items: center;
    padding: 20px;
    background:
      radial-gradient(circle at top right, rgba(212, 168, 74, .16), transparent 36%),
      linear-gradient(145deg, #07090c, #10151b);
    font-family: Inter, Arial, sans-serif;
  }

  #reconstrucao-login[hidden] {
    display: none;
  }

  .login-card {
    width: min(100%, 420px);
    padding: 34px;
    border: 1px solid rgba(212, 168, 74, .35);
    border-radius: 22px;
    background: rgba(14, 18, 23, .96);
    box-shadow: 0 24px 80px rgba(0, 0, 0, .5);
    color: #f5f5f5;
  }

  .login-brand {
    margin-bottom: 8px;
    color: #d4a84a;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: .08em;
    text-align: center;
  }

  .login-subtitle {
    margin: 0 0 28px;
    color: #aeb7c2;
    text-align: center;
  }

  .login-field {
    display: grid;
    gap: 7px;
    margin-bottom: 16px;
  }

  .login-field label {
    color: #d8dde4;
    font-size: .86rem;
    font-weight: 700;
  }

  .login-field input {
    width: 100%;
    box-sizing: border-box;
    min-height: 48px;
    padding: 12px 14px;
    border: 1px solid #303945;
    border-radius: 11px;
    background: #0b1016;
    color: #fff;
    font-size: 16px;
    outline: none;
  }

  .login-field input:focus {
    border-color: #d4a84a;
  }

  #login-submit {
    width: 100%;
    min-height: 50px;
    margin-top: 4px;
    border: 0;
    border-radius: 11px;
    background: linear-gradient(135deg, #d4a84a, #f0c76a);
    color: #111;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
  }

  #login-submit:disabled {
    cursor: wait;
    opacity: .65;
  }

  #login-message {
    min-height: 22px;
    margin: 15px 0 0;
    color: #ff8585;
    font-size: .88rem;
    text-align: center;
  }

  #cloud-user-bar {
    position: fixed;
    top: 10px;
    right: 12px;
    z-index: 9000;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 7px 9px 7px 13px;
    border: 1px solid rgba(212, 168, 74, .35);
    border-radius: 999px;
    background: rgba(9, 13, 18, .94);
    color: #fff;
    box-shadow: 0 8px 25px rgba(0, 0, 0, .25);
    font: 600 .78rem Inter, Arial, sans-serif;
  }

  #cloud-user-bar[hidden] {
    display: none;
  }

  #cloud-logout {
    min-height: 34px;
    padding: 6px 11px;
    border: 1px solid #48515d;
    border-radius: 999px;
    background: transparent;
    color: #fff;
    cursor: pointer;
  }
`;

function installLoginInterface() {
  if (!document.getElementById("reconstrucao-login-styles")) {
    const style = document.createElement("style");
    style.id = "reconstrucao-login-styles";
    style.textContent = loginStyles;
    document.head.appendChild(style);
  }

  if (!document.getElementById("reconstrucao-login")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <section id="reconstrucao-login" aria-label="Login Reconstrução">
        <form id="login-form" class="login-card">
          <div class="login-brand">RECONSTRUÇÃO</div>
          <p class="login-subtitle">
            Recomece. Reconstrua. Evolua.
          </p>

          <div class="login-field">
            <label for="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              autocomplete="email"
              required
              placeholder="seu@email.com"
            >
          </div>

          <div class="login-field">
            <label for="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="Sua senha"
            >
          </div>

          <button id="login-submit" type="submit">Entrar</button>
          <p id="login-message" role="alert"></p>
        </form>
      </section>

      <aside id="cloud-user-bar" hidden>
        <span id="cloud-user-name">Usuário</span>
        <button id="cloud-logout" type="button">Sair</button>
      </aside>
      `
    );
  }
}

async function loadUserName(user) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("Não foi possível carregar o perfil:", error.message);
  }

  return data?.full_name?.trim() || user.email || "Usuário";
}

async function showApplication(session) {
  const loginScreen = document.getElementById("reconstrucao-login");
  const userBar = document.getElementById("cloud-user-bar");
  const userName = document.getElementById("cloud-user-name");

  if (!session?.user) {
    loginScreen.hidden = false;
    userBar.hidden = true;
    return;
  }

  userName.textContent = await loadUserName(session.user);
  loginScreen.hidden = true;
  userBar.hidden = false;
}

async function initializeLogin() {
  installLoginInterface();

  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const submitButton = document.getElementById("login-submit");
  const message = document.getElementById("login-message");
  const logoutButton = document.getElementById("cloud-logout");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "";
    submitButton.disabled = true;
    submitButton.textContent = "Entrando...";

    try {
      const result = await signIn(
        emailInput.value,
        passwordInput.value
      );

      await showApplication(result.session);
      passwordInput.value = "";
    } catch (error) {
      console.error(error);
      message.textContent =
        "E-mail ou senha inválidos. Confira os dados e tente novamente.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Entrar";
    }
  });

  logoutButton.addEventListener("click", async () => {
    try {
      await signOut();
      await showApplication(null);
    } catch (error) {
      console.error(error);
      alert("Não foi possível encerrar a sessão.");
    }
  });

  const session = await getCurrentSession();
  await showApplication(session);

  observeAuth(async (_event, updatedSession) => {
    await showApplication(updatedSession);
  });
}

initializeLogin().catch((error) => {
  console.error("Erro ao iniciar autenticação:", error);
  alert("Não foi possível iniciar o login do Reconstrução.");
});