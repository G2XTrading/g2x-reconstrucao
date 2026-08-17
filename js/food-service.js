import { supabase } from "./supabase.js";

export async function getFoods(search = "") {
  let query = supabase
    .from("foods")
    .select(`
      id,
      name,
      brand,
      preparation,
      calories_per_100g,
      protein_per_100g,
      carbs_per_100g,
      fat_per_100g,
      default_portion_g
    `)
    .eq("active", true)
    .order("name", { ascending: true });

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data ?? [];
}

export async function saveConsumedFood({
  date,
  mealSlot,
  mealLabel,
  foodId,
  quantityG,
  notes = ""
}) {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError) throw userError;

  const user = userData?.user;

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const quantity = Number(quantityG);

  if (!quantity || quantity <= 0) {
    throw new Error("Informe uma quantidade válida.");
  }

  const { data, error } = await supabase
    .from("nutrition_entries")
    .insert({
      user_id: user.id,
      entry_date: date,
      meal_slot: mealSlot,
      meal_label: mealLabel,
      food_id: foodId,
      quantity_g: quantity,
      entry_type: "consumed",
      notes
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteConsumedFood(entryId) {
  const { error } = await supabase
    .from("nutrition_entries")
    .delete()
    .eq("id", entryId);

  if (error) throw error;
}