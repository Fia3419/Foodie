export const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

export type MealOption = (typeof MEAL_OPTIONS)[number];

export const DEFAULT_MEAL: MealOption = "Breakfast";
export const DEFAULT_DINNER_MEAL: MealOption = "Dinner";
