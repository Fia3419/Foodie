import { AppLanguage } from "../types/models";

export interface Translation {
  appName: string;
  navDashboard: string;
  navFoodLog: string;
  navProgress: string;
  navRecipes: string;
  synced: string;
  queued: (count: number) => string;
  logout: string;
  login: string;
  register: string;
  email: string;
  password: string;
  name: string;
  primaryGoal: string;
  generalHealth: string;
  gainStrength: string;
  loseWeight: string;
  signIn: string;
  signingIn: string;
  createAccount: string;
  creatingAccount: string;
  authHeroBadge: string;
  authHeroTitle: string;
  authHeroDescription: string;
  authBenefitOne: string;
  authBenefitTwo: string;
  authBenefitThree: string;
  authError: string;
  registerError: string;
  language: string;
  dashboardLoading: string;
  dashboardUnavailable: string;
  today: string;
  dashboardTitle: string;
  dashboardDescription: string;
  onlineSyncing: string;
  offlineQueued: (count: number) => string;
  focus: string;
  nextBestAction: string;
  streak: string;
  weeklyAdherence: string;
  milestone: string;
  days: (count: number) => string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  target: (value: number) => string;
  foodLogLoading: string;
  foodLogUnavailable: string;
  dailyLog: string;
  mealsAndMacros: string;
  logDescription: string;
  onlineWrites: string;
  offlineWrites: string;
  meal: string;
  food: string;
  date: string;
  time: string;
  addFoodEntry: string;
  updateFoodEntry: string;
  editFoodEntry: string;
  deleteFoodEntry: string;
  cancelEdit: string;
  foodLogEditDescription: string;
  saving: string;
  loggedAt: (time: string) => string;
  progressLoading: string;
  progressUnavailable: string;
  progress: string;
  progressTitle: string;
  progressDescription: string;
  weightTrend: string;
  weight: string;
  logBodyWeight: string;
  saveWeightEntry: string;
  recipesLoading: string;
  recipesUnavailable: string;
  recipes: string;
  recipesTitle: string;
  recipesDescription: string;
  createRecipe: string;
  editRecipe: string;
  deleteRecipe: string;
  removeIngredient: string;
  recipeName: string;
  servings: string;
  caloriesPerServing: string;
  proteinPerServing: string;
  tags: string;
  ingredients: string;
  instructions: string;
  ingredientsPlaceholder: string;
  instructionsPlaceholder: string;
  tagPlaceholder: string;
  saveRecipe: string;
  updateRecipe: string;
  ownRecipe: string;
  libraryRecipe: string;
  sessions: string;
  settings: string;
  accountSettings: string;
  languageDescription: string;
  securityActions: string;
  revokeOtherSessions: string;
  ingredientNutrition: string;
  currentSession: string;
  revokeSession: string;
  sessionRevoked: string;
  activeUntil: string;
  lastUsed: string;
}

export const translations: Record<AppLanguage, Translation> = {
  en: {
    appName: "Foodie",
    navDashboard: "Dashboard",
    navFoodLog: "Food log",
    navProgress: "Progress",
    navRecipes: "Recipes",
    synced: "Synced",
    queued: (count) => `${count} queued`,
    logout: "Logout",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    name: "Name",
    primaryGoal: "Primary goal",
    generalHealth: "General health",
    gainStrength: "Gain strength",
    loseWeight: "Lose weight",
    signIn: "Sign in",
    signingIn: "Signing in...",
    createAccount: "Create account",
    creatingAccount: "Creating account...",
    authHeroBadge: "PWA health tracker",
    authHeroTitle:
      "Track nutrition with a real account and resilient offline logging.",
    authHeroDescription:
      "Foodie stores your meals, weight trend, goals, and recipes in a persistent .NET 10 API backed by SQL Server and queues changes locally when you lose connection.",
    authBenefitOne: "Refresh-token based account session",
    authBenefitTwo: "SQL Server-backed food and weight history",
    authBenefitThree: "IndexedDB queue for offline writes",
    authError: "Authentication failed. Check your credentials and try again.",
    registerError: "Registration failed. Try a different email or password.",
    language: "Language",
    dashboardLoading: "Loading your dashboard...",
    dashboardUnavailable: "Dashboard data is unavailable right now.",
    today: "Today",
    dashboardTitle: "Nutrition with a clear target, not guesswork.",
    dashboardDescription:
      "Track meals, stay aligned with your goal, and keep progress moving even when you are offline.",
    onlineSyncing: "Online and syncing",
    offlineQueued: (count) => `${count} changes queued offline`,
    focus: "Focus",
    nextBestAction: "Next best action",
    streak: "Streak",
    weeklyAdherence: "Weekly adherence",
    milestone: "Milestone",
    days: (count) => `${count} days`,
    calories: "Calories",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    target: (value) => `Target ${value}`,
    foodLogLoading: "Loading today's food log...",
    foodLogUnavailable: "Your food log could not be loaded.",
    dailyLog: "Daily log",
    mealsAndMacros: "Meals and macros for today",
    logDescription:
      "Keep entries fast, readable, and ready for offline capture.",
    onlineWrites: "Writes go straight to API",
    offlineWrites: "Writes will queue offline",
    meal: "Meal",
    food: "Food",
    date: "Date",
    time: "Time",
    addFoodEntry: "Add food entry",
    updateFoodEntry: "Update food entry",
    editFoodEntry: "Edit entry",
    deleteFoodEntry: "Delete entry",
    cancelEdit: "Cancel",
    foodLogEditDescription:
      "Update an existing entry or remove it if it was logged incorrectly.",
    saving: "Saving...",
    loggedAt: (time) => `Logged at ${time}`,
    progressLoading: "Loading progress insights...",
    progressUnavailable: "Progress data is unavailable right now.",
    progress: "Progress",
    progressTitle: "Consistency is trending in the right direction",
    progressDescription:
      "Use body-weight checkpoints and weekly adherence to decide whether to hold, push, or reduce intake.",
    weightTrend: "Weight trend",
    weight: "Weight",
    logBodyWeight: "Log body weight",
    saveWeightEntry: "Save weight entry",
    recipesLoading: "Loading recipe library...",
    recipesUnavailable: "Recipes are unavailable right now.",
    recipes: "Recipes",
    recipesTitle: "Reusable meals for faster logging",
    recipesDescription:
      "Create your own recipes and edit the ones you own while keeping the shared library intact.",
    createRecipe: "Create recipe",
    editRecipe: "Edit recipe",
    deleteRecipe: "Delete recipe",
    removeIngredient: "Remove ingredient",
    recipeName: "Recipe name",
    servings: "Servings",
    caloriesPerServing: "Calories per serving",
    proteinPerServing: "Protein per serving",
    tags: "Tags",
    ingredients: "Ingredients",
    instructions: "Instructions",
    ingredientsPlaceholder: "Chicken, Rice, Spinach",
    instructionsPlaceholder: "Describe how to prepare this recipe.",
    tagPlaceholder: "Breakfast, Prep-friendly",
    saveRecipe: "Save recipe",
    updateRecipe: "Update recipe",
    ownRecipe: "Your recipe",
    libraryRecipe: "Library recipe",
    sessions: "Sessions",
    settings: "Settings",
    accountSettings: "Account and settings",
    languageDescription:
      "Choose the language used by the app and backend validation messages.",
    securityActions: "Security actions",
    revokeOtherSessions: "Revoke other sessions",
    ingredientNutrition: "Ingredient nutrition",
    currentSession: "Current session",
    revokeSession: "Revoke session",
    sessionRevoked: "Revoked",
    activeUntil: "Active until",
    lastUsed: "Last used",
  },
  sv: {
    appName: "Foodie",
    navDashboard: "Översikt",
    navFoodLog: "Matlogg",
    navProgress: "Framsteg",
    navRecipes: "Recept",
    synced: "Synkad",
    queued: (count) => `${count} i kö`,
    logout: "Logga ut",
    login: "Logga in",
    register: "Registrera",
    email: "E-post",
    password: "Lösenord",
    name: "Namn",
    primaryGoal: "Primärt mål",
    generalHealth: "Allmän hälsa",
    gainStrength: "Bygg styrka",
    loseWeight: "Gå ner i vikt",
    signIn: "Logga in",
    signingIn: "Loggar in...",
    createAccount: "Skapa konto",
    creatingAccount: "Skapar konto...",
    authHeroBadge: "PWA för hälsa",
    authHeroTitle: "Följ din kost med riktigt konto och tålig offlinelogik.",
    authHeroDescription:
      "Foodie sparar måltider, vikttrend, mål och recept i ett beständigt .NET 10-API med SQL Server och köar ändringar lokalt när uppkopplingen försvinner.",
    authBenefitOne: "Kontosession med refresh token",
    authBenefitTwo: "SQL Server-lagrad mat- och vikthistorik",
    authBenefitThree: "IndexedDB-kö för offlineändringar",
    authError:
      "Inloggningen misslyckades. Kontrollera dina uppgifter och försök igen.",
    registerError:
      "Registreringen misslyckades. Prova en annan e-post eller ett annat lösenord.",
    language: "Språk",
    dashboardLoading: "Laddar din översikt...",
    dashboardUnavailable: "Översiktsdata är inte tillgänglig just nu.",
    today: "Idag",
    dashboardTitle: "Näringsloggning med tydligt mål, inte gissningar.",
    dashboardDescription:
      "Följ måltider, håll kurs mot målet och fortsätt göra framsteg även offline.",
    onlineSyncing: "Online och synkar",
    offlineQueued: (count) => `${count} ändringar köade offline`,
    focus: "Fokus",
    nextBestAction: "Nästa bästa steg",
    streak: "Streak",
    weeklyAdherence: "Veckoträffsäkerhet",
    milestone: "Milstolpe",
    days: (count) => `${count} dagar`,
    calories: "Kalorier",
    protein: "Protein",
    carbs: "Kolhydrater",
    fat: "Fett",
    target: (value) => `Mål ${value}`,
    foodLogLoading: "Laddar dagens matlogg...",
    foodLogUnavailable: "Din matlogg kunde inte laddas.",
    dailyLog: "Matlogg",
    mealsAndMacros: "Måltider och makron för idag",
    logDescription:
      "Håll registreringen snabb, tydlig och redo för offlineanvändning.",
    onlineWrites: "Skrivningar går direkt till API:t",
    offlineWrites: "Skrivningar köas offline",
    meal: "Måltid",
    food: "Livsmedel",
    date: "Datum",
    time: "Tid",
    addFoodEntry: "Lägg till måltid",
    updateFoodEntry: "Uppdatera måltid",
    editFoodEntry: "Redigera",
    deleteFoodEntry: "Ta bort",
    cancelEdit: "Avbryt",
    foodLogEditDescription:
      "Uppdatera en befintlig post eller ta bort den om den registrerades fel.",
    saving: "Sparar...",
    loggedAt: (time) => `Loggad ${time}`,
    progressLoading: "Laddar framsteg...",
    progressUnavailable: "Framstegsdata är inte tillgänglig just nu.",
    progress: "Framsteg",
    progressTitle: "Din konsekvens utvecklas åt rätt håll",
    progressDescription:
      "Använd viktkontroller och veckoträffsäkerhet för att avgöra om du ska ligga kvar, öka eller minska intaget.",
    weightTrend: "Vikttrend",
    weight: "Vikt",
    logBodyWeight: "Logga kroppsvikt",
    saveWeightEntry: "Spara vikt",
    recipesLoading: "Laddar receptbibliotek...",
    recipesUnavailable: "Recept är inte tillgängliga just nu.",
    recipes: "Recept",
    recipesTitle: "Återanvändbara måltider för snabbare loggning",
    recipesDescription:
      "Skapa egna recept och redigera dem du äger, samtidigt som det delade biblioteket finns kvar.",
    createRecipe: "Skapa recept",
    editRecipe: "Redigera recept",
    deleteRecipe: "Ta bort recept",
    removeIngredient: "Ta bort ingrediens",
    recipeName: "Receptnamn",
    servings: "Portioner",
    caloriesPerServing: "Kalorier per portion",
    proteinPerServing: "Protein per portion",
    tags: "Taggar",
    ingredients: "Ingredienser",
    instructions: "Instruktioner",
    ingredientsPlaceholder: "Kyckling, Ris, Spenat",
    instructionsPlaceholder: "Beskriv hur receptet ska tillagas.",
    tagPlaceholder: "Frukost, Förbered",
    saveRecipe: "Spara recept",
    updateRecipe: "Uppdatera recept",
    ownRecipe: "Ditt recept",
    libraryRecipe: "Biblioteksrecept",
    sessions: "Sessioner",
    settings: "Inställningar",
    accountSettings: "Konto och inställningar",
    languageDescription:
      "Välj vilket språk som används i appen och i backendens valideringsmeddelanden.",
    securityActions: "Säkerhetsåtgärder",
    revokeOtherSessions: "Återkalla övriga sessioner",
    ingredientNutrition: "Näringsvärden per ingrediens",
    currentSession: "Nuvarande session",
    revokeSession: "Återkalla session",
    sessionRevoked: "Återkallad",
    activeUntil: "Aktiv till",
    lastUsed: "Senast använd",
  },
};
