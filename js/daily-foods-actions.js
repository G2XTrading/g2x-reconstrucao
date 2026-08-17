import { supabase } from "./supabase.js";

export async function updateConsumedFood({
  entryId,
  mealSlot,
  quantityG
}) {
  const quantity = Number(quantityG);

  if (!entryId) {
    throw new Error("Registro inválido.");
  }

  if (!mealSlot) {
    throw new Error("Informe o horário.");
  }

  if (!quantity || quantity <= 0) {
    throw new Error("Informe uma quantidade válida.");
  }

  const { data, error } = await supabase
    .from("nutrition_entries")
    .update({
      meal_slot: mealSlot,
      quantity_g: quantity
    })
    .eq("id", entryId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteConsumedFoodEntry(entryId) {
  if (!entryId) {
    throw new Error("Registro inválido.");
  }

  const { error } = await supabase
    .from("nutrition_entries")
    .delete()
    .eq("id", entryId);

  if (error) throw error;
}