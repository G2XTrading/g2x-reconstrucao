import { getConsumedFoodsByDate } from "./daily-foods.js";
import {
  updateConsumedFood,
  deleteConsumedFoodEntry
} from "./daily-foods-actions.js";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function createDailyFoodsPanel() {
  if (document.getElementById("daily-foods-panel")) return;

  const panel = document.createElement("section");
  panel.id = "daily-foods-panel";

  panel.innerHTML = `
    <style>
      #daily-foods-panel {
        margin: 16px 0;
        padding: 16px;
        border: 1px solid rgba(212,168,74,.28);
        border-radius: 16px;
        background: rgba(13,18,24,.96);
        color: #fff;
      }

      #daily-foods-panel h3 {
        margin: 0 0 6px;
      }

      #daily-foods-panel .daily-foods-sub {
        margin-bottom: 14px;
        color: #9faab7;
        font-size: .8rem;
      }

      .daily-meal-group {
        margin-top: 14px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 12px;
        background: rgba(5,10,15,.5);
      }

      .daily-meal-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 12px;
        background: rgba(212,168,74,.08);
      }

      .daily-meal-time {
        color: #d4a84a;
        font-weight: 800;
      }

      .daily-food-row {
        display: grid;
        grid-template-columns:
          minmax(160px,1fr)
          80px
          75px
          75px
          75px
          75px
          auto;
        gap: 8px;
        align-items: center;
        padding: 10px 12px;
        border-top: 1px solid rgba(255,255,255,.06);
        font-size: .82rem;
      }

      .daily-food-name {
        font-weight: 700;
      }

      .daily-food-prep {
        margin-top: 3px;
        color: #8895a3;
        font-size: .72rem;
      }

      .daily-food-actions {
        display: flex;
        gap: 6px;
      }

      .daily-food-actions button {
        padding: 6px 9px;
        border-radius: 8px;
        border: 1px solid #394653;
        background: #18222d;
        color: #fff;
        cursor: pointer;
      }

      .daily-food-actions .delete {
        border-color: rgba(210,70,70,.5);
        background: rgba(120,30,30,.4);
      }

      .daily-food-total {
        margin-top: 14px;
        padding: 12px;
        border-radius: 10px;
        background: rgba(212,168,74,.08);
        font-weight: 700;
      }

      #daily-foods-status {
        margin-top: 10px;
        color: #9faab7;
        font-size: .78rem;
      }

      @media (max-width: 900px) {
        .daily-food-row {
          grid-template-columns: 1fr 1fr;
        }

        .daily-food-row > div:first-child {
          grid-column: 1 / -1;
        }

        .daily-food-actions {
          grid-column: 1 / -1;
        }
      }
    </style>

    <h3>📋 Consumido hoje</h3>

    <div class="daily-foods-sub">
      Registro real das refeições consumidas no dia.
    </div>

    <div id="daily-foods-content"></div>

    <div id="daily-foods-status">
      Carregando alimentação de hoje...
    </div>
  `;

  const foodEntryPanel =
    document.getElementById("food-entry-panel");

  const nutritionPanel =
    document.getElementById("nutrition-daily-panel");

  if (foodEntryPanel) {
    foodEntryPanel.insertAdjacentElement("afterend", panel);
  } else if (nutritionPanel) {
    nutritionPanel.insertAdjacentElement("afterend", panel);
  } else {
    document.body.prepend(panel);
  }
}

function groupByMeal(entries) {
  return entries.reduce((groups, entry) => {
    const key = entry.mealSlot || "Sem horário";

    if (!groups[key]) groups[key] = [];

    groups[key].push(entry);
    return groups;
  }, {});
}

async function handleEdit(entry) {
  const newTime = prompt(
    "Horário da refeição:",
    entry.mealSlot
  );

  if (newTime === null) return;

  const newQuantity = prompt(
    `Quantidade de ${entry.foodName} em gramas:`,
    entry.quantityG
  );

  if (newQuantity === null) return;

  try {
    await updateConsumedFood({
      entryId: entry.id,
      mealSlot: newTime,
      quantityG: newQuantity
    });

    window.location.reload();

  } catch (error) {
    alert(`Erro ao editar: ${error.message}`);
  }
}

async function handleDelete(entry) {
  const confirmDelete = confirm(
    `Excluir ${entry.foodName} (${entry.quantityG} g)?`
  );

  if (!confirmDelete) return;

  try {
    await deleteConsumedFoodEntry(entry.id);
    window.location.reload();

  } catch (error) {
    alert(`Erro ao excluir: ${error.message}`);
  }
}

function renderDailyFoods(entries) {
  const content =
    document.getElementById("daily-foods-content");

  const status =
    document.getElementById("daily-foods-status");

  if (!entries.length) {
    content.innerHTML = "";
    status.textContent =
      "Nenhum alimento consumido registrado hoje.";
    return;
  }

  const groups = groupByMeal(entries);

  let totalKcal = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  content.innerHTML = Object.entries(groups)
    .map(([mealSlot, foods]) => {

      const mealKcal = foods.reduce(
        (sum, item) => sum + item.kcal,
        0
      );

      foods.forEach(item => {
        totalKcal += item.kcal;
        totalProtein += item.proteinG;
        totalCarbs += item.carbsG;
        totalFat += item.fatG;
      });

      return `
        <div class="daily-meal-group">

          <div class="daily-meal-head">
            <span class="daily-meal-time">
              ${mealSlot}
            </span>

            <span>
              ${mealKcal.toFixed(1)} kcal
            </span>
          </div>

          ${foods.map(item => `
            <div class="daily-food-row">

              <div>
                <div class="daily-food-name">
                  ${item.foodName}
                </div>

                ${
                  item.preparation
                    ? `
                      <div class="daily-food-prep">
                        ${item.preparation}
                      </div>
                    `
                    : ""
                }
              </div>

              <div>
                ${item.quantityG.toFixed(0)} g
              </div>

              <div>
                ${item.kcal.toFixed(1)} kcal
              </div>

              <div>
                P ${item.proteinG.toFixed(1)}
              </div>

              <div>
                C ${item.carbsG.toFixed(1)}
              </div>

              <div>
                G ${item.fatG.toFixed(1)}
              </div>

              <div class="daily-food-actions">
                <button
                  type="button"
                  data-action="edit"
                  data-entry-id="${item.id}">
                  Editar
                </button>

                <button
                  type="button"
                  class="delete"
                  data-action="delete"
                  data-entry-id="${item.id}">
                  Excluir
                </button>
              </div>

            </div>
          `).join("")}

        </div>
      `;
    })
    .join("");

  content.insertAdjacentHTML(
    "beforeend",
    `
      <div class="daily-food-total">
        Total consumido:
        ${totalKcal.toFixed(1)} kcal ·
        P ${totalProtein.toFixed(1)} g ·
        C ${totalCarbs.toFixed(1)} g ·
        G ${totalFat.toFixed(1)} g
      </div>
    `
  );

  content.querySelectorAll("[data-action]")
    .forEach(button => {

      button.addEventListener("click", async () => {
        const entryId = button.dataset.entryId;

        const entry = entries.find(
          item => item.id === entryId
        );

        if (!entry) return;

        if (button.dataset.action === "edit") {
          await handleEdit(entry);
        }

        if (button.dataset.action === "delete") {
          await handleDelete(entry);
        }
      });
    });

  status.textContent =
    "Diário alimentar sincronizado com a nuvem.";
}

async function initializeDailyFoods() {
  createDailyFoodsPanel();

  try {
    const entries =
      await getConsumedFoodsByDate(todayISO());

    renderDailyFoods(entries);

  } catch (error) {
    console.error(
      "Erro ao carregar alimentação do dia:",
      error
    );

    document.getElementById(
      "daily-foods-status"
    ).textContent =
      `Erro: ${error.message}`;
  }
}

initializeDailyFoods();