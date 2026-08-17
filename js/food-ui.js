import { getFoods, saveConsumedFood } from "./food-service.js";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function createFoodEntryPanel() {
  if (document.getElementById("food-entry-panel")) return;

  const panel = document.createElement("section");
  panel.id = "food-entry-panel";

  panel.innerHTML = `
    <style>
      #food-entry-panel {
        margin: 16px 0;
        padding: 16px;
        border: 1px solid rgba(212,168,74,.28);
        border-radius: 16px;
        background: rgba(15,20,27,.96);
        color: #fff;
      }

      #food-entry-panel h3 {
        margin: 0 0 14px;
      }

      .food-entry-grid {
        display: grid;
        grid-template-columns: 140px 1fr 120px auto;
        gap: 10px;
        align-items: end;
      }

      .food-entry-field {
        display: grid;
        gap: 6px;
      }

      .food-entry-field label {
        font-size: .75rem;
        color: #9faab7;
      }

      .food-entry-field input,
      .food-entry-field select {
        min-height: 42px;
        padding: 8px 10px;
        border: 1px solid #34404c;
        border-radius: 9px;
        background: #0b1016;
        color: #fff;
      }

      #food-save-button {
        min-height: 42px;
        padding: 0 18px;
        border: 0;
        border-radius: 9px;
        background: #d4a84a;
        color: #111;
        font-weight: 800;
        cursor: pointer;
      }

      #food-entry-result {
        margin-top: 10px;
        min-height: 20px;
        color: #aab5c1;
        font-size: .8rem;
      }

      @media (max-width: 760px) {
        .food-entry-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <h3>🍽️ Registrar alimento consumido</h3>

    <div class="food-entry-grid">

      <div class="food-entry-field">
        <label>Horário</label>
        <input id="food-meal-slot" type="time" value="12:30">
      </div>

      <div class="food-entry-field">
        <label>Alimento</label>
        <select id="food-selector">
          <option value="">Carregando alimentos...</option>
        </select>
      </div>

      <div class="food-entry-field">
        <label>Quantidade (g)</label>
        <input
          id="food-quantity"
          type="number"
          min="1"
          step="1"
          placeholder="150"
        >
      </div>

      <button id="food-save-button" type="button">
        Adicionar
      </button>

    </div>

    <div id="food-entry-result"></div>
  `;

  const nutritionPanel =
    document.getElementById("nutrition-daily-panel");

  if (nutritionPanel) {
    nutritionPanel.insertAdjacentElement("afterend", panel);
  } else {
    document.body.prepend(panel);
  }
}

async function loadFoodOptions() {
  const selector = document.getElementById("food-selector");

  try {
    const foods = await getFoods();

    selector.innerHTML =
      `<option value="">Selecione...</option>` +
      foods.map(food => `
        <option value="${food.id}">
          ${food.name}
          ${food.preparation ? ` — ${food.preparation}` : ""}
        </option>
      `).join("");

  } catch (error) {
    console.error("Erro ao carregar alimentos:", error);

    selector.innerHTML =
      `<option value="">Erro ao carregar alimentos</option>`;
  }
}

async function handleSaveFood() {
  const selector = document.getElementById("food-selector");
  const quantityInput = document.getElementById("food-quantity");
  const mealSlotInput = document.getElementById("food-meal-slot");
  const result = document.getElementById("food-entry-result");
  const button = document.getElementById("food-save-button");

  const foodId = selector.value;
  const quantityG = Number(quantityInput.value);
  const mealSlot = mealSlotInput.value;

  if (!foodId) {
    result.textContent = "Selecione um alimento.";
    return;
  }

  if (!quantityG || quantityG <= 0) {
    result.textContent = "Informe a quantidade em gramas.";
    return;
  }

  button.disabled = true;
  button.textContent = "Salvando...";

  try {
    await saveConsumedFood({
      date: todayISO(),
      mealSlot,
      mealLabel: "Refeição registrada",
      foodId,
      quantityG
    });

    result.textContent = "Alimento registrado com sucesso.";
    quantityInput.value = "";

    setTimeout(() => {
      window.location.reload();
    }, 700);

  } catch (error) {
    console.error("Erro ao salvar alimento:", error);
    result.textContent =
      `Erro: ${error.message}`;
  } finally {
    button.disabled = false;
    button.textContent = "Adicionar";
  }
}

async function initializeFoodUI() {
  createFoodEntryPanel();

  document
    .getElementById("food-save-button")
    .addEventListener("click", handleSaveFood);

  await loadFoodOptions();
}

initializeFoodUI();