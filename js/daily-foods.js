import { supabase } from "./supabase.js";

export async function getConsumedFoodsByDate(date) {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError) throw userError;

  const user = userData?.user;

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data, error } = await supabase
    .from("nutrition_entries")
    .select(`
      id,
      entry_date,
      meal_slot,
      meal_label,
      quantity_g,
      notes,
      foods (
        id,
        name,
        brand,
        preparation,
        calories_per_100g,
        protein_per_100g,
        carbs_per_100g,
        fat_per_100g
      )
    `)
    .eq("user_id", user.id)
    .eq("entry_date", date)
    .eq("entry_type", "consumed")
    .order("meal_slot", { ascending: true });

  if (error) throw error;

  return (data ?? []).map(entry => {
    const food = entry.foods;

    const factor = Number(entry.quantity_g) / 100;

    return {
      id: entry.id,
      entryDate: entry.entry_date,
      mealSlot: entry.meal_slot,
      mealLabel: entry.meal_label,
      quantityG: Number(entry.quantity_g),
      notes: entry.notes ?? "",

      foodId: food?.id ?? null,
      foodName: food?.name ?? "Alimento",
      brand: food?.brand ?? "",
      preparation: food?.preparation ?? "",

      kcal: Number(
        (
          Number(food?.calories_per_100g ?? 0) * factor
        ).toFixed(1)
      ),

      proteinG: Number(
        (
          Number(food?.protein_per_100g ?? 0) * factor
        ).toFixed(1)
      ),

      carbsG: Number(
        (
          Number(food?.carbs_per_100g ?? 0) * factor
        ).toFixed(1)
      ),

      fatG: Number(
        (
          Number(food?.fat_per_100g ?? 0) * factor
        ).toFixed(1)
      )
    };
  });
}