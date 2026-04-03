export enum GoalMode {
  GeneralHealth = "general-health",
  GainStrength = "gain-strength",
  LoseWeight = "lose-weight",
}

export type AppLanguage = "en" | "sv";

export interface AuthSession {
  userId: string;
  sessionId: string;
  userName: string;
  email: string;
  selectedGoalMode: GoalMode;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  goalMode: GoalMode;
}

export interface GoalOption {
  mode: GoalMode;
  label: string;
  description: string;
}

export interface MacroSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DashboardSummary {
  userName: string;
  selectedGoalMode: GoalMode;
  dailyTarget: MacroSummary;
  consumedToday: MacroSummary;
  weeklyAdherence: number;
  streakDays: number;
  nextMilestone: string;
  focusMessage: string;
}

export interface MealLogItem {
  id: string;
  mealName: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
}

export interface DailyLog {
  date: string;
  items: MealLogItem[];
}

export interface WeightEntry {
  date: string;
  weightKg: number;
}

export interface RecipeSummary {
  id: string;
  name: string;
  servings: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string;
  isOwnedByCurrentUser: boolean;
}

export interface SessionProfile {
  userName: string;
  email: string;
  selectedGoalMode: GoalMode;
  availableGoals: GoalOption[];
  queuedActions: number;
}

export interface CreateMealLogEntryRequest {
  mealName: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logDate: string;
  loggedAt: string;
}

export interface UpdateMealLogEntryRequest {
  mealName: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logDate: string;
  loggedAt: string;
}

export interface CreateWeightEntryRequest {
  date: string;
  weightKg: number;
}

export interface UpsertRecipeRequest {
  name: string;
  servings: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SessionSummary {
  sessionId: string;
  deviceName: string;
  createdAtUtc: string;
  lastUsedAtUtc: string;
  expiresAtUtc: string;
  isRevoked: boolean;
}
