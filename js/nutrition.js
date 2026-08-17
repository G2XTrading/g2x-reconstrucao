import { supabase } from "./supabase.js";

export async function getDailyNutritionSummary(date) {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError) throw userError;
  if (!userData?.user) return null;

  const { data, error } = await supabase
    .from("daily_nutrition_summary")
    .select("*")
    .eq("user_id", userData.user.id)
    .eq("entry_date", date)
    .maybeSingle();

  if (error) throw error;

  return data;
}