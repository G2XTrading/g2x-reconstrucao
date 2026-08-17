import { getDailyNutritionSummary } from "./nutrition.js";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function createNutritionPanel() {
  if (document.getElementById("nutrition-daily-panel")) return;

  const panel = document.createElement("section");
  panel.id = "nutrition-daily-panel";

  panel.innerHTML = `
    <style>
      #nutrition-daily-panel {
        margin: 16px 0;
        padding: 16px;
        border: 1px solid rgba(212, 168, 74, .28);
        border-radius: 16px;
        background:
          linear-gradient(
            135deg,
            rgba(212,168,74,.08),
            rgba(20,25,32,.92)
          );
        color: #fff;
      }

      #nutrition-daily-panel .nutrition-title {
        margin-bottom: 12px;
        font-size: 1rem;
        font-weight: 800;
      }

      #nutrition-daily-panel .nutrition-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
      }

      #nutrition-daily-panel .nutrition-card {
        padding: 12px;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 12px;
        background: rgba(5,10,15,.55);
      }

      #nutrition-daily-panel .nutrition-label {
        margin-bottom: 5px;
        color: #9faab7;
        font-size: .72rem;
        text-transform: uppercase;
        letter-spacing: .05em;
      }

      #nutrition-daily-panel .nutrition-value {
        font-size: 1.15rem;
        font-weight: 800;
      }

      #nutrition-daily-panel .nutrition-meta {
        margin-top: 5px;
        color: #c5ccd5;
        font-size: .75rem;
      }

      #nutrition-daily-panel .nutrition-progress {
        height: 6px;
        margin-top: 9px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255,255,255,.08);
      }

      #nutrition-daily-panel .nutrition-progress-bar {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(
          90deg,
          #d4a84a,
          #f0c76a
        );
        transition: width .3s ease;
      }

      #nutrition-daily-panel .nutrition-status {
        margin-top: 10px;
        color: #99a5b1;
        font-size: .76rem;
      }

      @media (max-width: 760px) {
        #nutrition-daily-panel .nutrition-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    </style>

    <div class="nutrition-title">
      🍽️ Placar nutricional de hoje
    </div>

    <div class="nutrition-grid">

      <div class="nutrition-card">
        <div class="nutrition-label">Calorias</div>
        <div class="nutrition-value" id="nutri-kcal">--</div>
        <div class="nutrition-meta" id="nutri-kcal-restante"></div>
        <div class="nutrition-progress">
          <div
            class="nutrition-progress-bar"
            id="nutri-kcal-bar"
          ></div>
        </div>
      </div>

      <div class="nutrition-card">
        <div class="nutrition-label">Proteína</div>
        <div class="nutrition-value" id="nutri-protein">--</div>
        <div class="nutrition-meta" id="nutri-protein-restante"></div>
        <div class="nutrition-progress">
          <div
            class="nutrition-progress-bar"
            id="nutri-protein-bar"
          ></div>
        </div>
      </div>

      <div class="nutrition-card">
        <div class="nutrition-label">Carbo</div>
        <div class="nutrition-value" id="nutri-carbs">--</div>
        <div class="nutrition-meta" id="nutri-carbs-restante"></div>
        <div class="nutrition-progress">
          <div
            class="nutrition-progress-bar"
            id="nutri-carbs-bar"
          ></div>
        </div>
      </div>

      <div class="nutrition-card">
        <div class="nutrition-label">Gordura</div>
        <div class="nutrition-value" id="nutri-fat">--</div>
        <div class="nutrition-meta" id="nutri-fat-restante"></div>
        <div class="nutrition-progress">
          <div
            class="nutrition-progress-bar"
            id="nutri-fat-bar"
          ></div>
        </div>
      </div>

    </div>

    <div class="nutrition-status" id="nutrition-status">
      Carregando dados...
    </div>
  `;

  const target =
    document.querySelector("main") ||
    document.querySelector(".app") ||
    document.body;

  target.prepend(panel);
}

function percentage(current, target) {
  if (!target || target <= 0) return 0;

  return Math.min(
    100,
    Math.max(0, (current / target) * 100)
  );
}

function updateBar(id, current, target) {
  const element = document.getElementById(id);

  if (!element) return;

  element.style.width =
    `${percentage(current, target)}%`;
}

function renderSummary(data) {
  if (!data) {
    document.getElementById("nutrition-status").textContent =
      "Nenhum consumo registrado hoje.";
    return;
  }

  document.getElementById("nutri-kcal").textContent =
    `${data.kcal_consumidas} / ${data.kcal_meta} kcal`;

  document.getElementById("nutri-kcal-restante").textContent =
    `Restam ${data.kcal_restantes} kcal`;

  document.getElementById("nutri-protein").textContent =
    `${data.proteina_consumida} / ${data.proteina_meta} g`;

  document.getElementById("nutri-protein-restante").textContent =
    `Restam ${data.proteina_restante} g`;

  document.getElementById("nutri-carbs").textContent =
    `${data.carbo_consumido} / ${data.carbo_meta} g`;

  document.getElementById("nutri-carbs-restante").textContent =
    `Restam ${data.carbo_restante} g`;

  document.getElementById("nutri-fat").textContent =
    `${data.gordura_consumida} / ${data.gordura_meta} g`;

  document.getElementById("nutri-fat-restante").textContent =
    `Restam ${data.gordura_restante} g`;

  updateBar(
    "nutri-kcal-bar",
    data.kcal_consumidas,
    data.kcal_meta
  );

  updateBar(
    "nutri-protein-bar",
    data.proteina_consumida,
    data.proteina_meta
  );

  updateBar(
    "nutri-carbs-bar",
    data.carbo_consumido,
    data.carbo_meta
  );

  updateBar(
    "nutri-fat-bar",
    data.gordura_consumida,
    data.gordura_meta
  );

  document.getElementById("nutrition-status").textContent =
    "Dados sincronizados com o Reconstrução Cloud.";
}

async function loadNutritionPanel() {
  createNutritionPanel();

  try {
    const summary =
      await getDailyNutritionSummary(todayISO());

    renderSummary(summary);
  } catch (error) {
    console.error(
      "Erro no placar nutricional:",
      error
    );

    document.getElementById("nutrition-status").textContent =
      "Não foi possível carregar o placar nutricional.";
  }
}

loadNutritionPanel();