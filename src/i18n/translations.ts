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
  forgotPassword: string;
  forgotPasswordDescription: string;
  requestPasswordReset: string;
  requestingPasswordReset: string;
  resetPassword: string;
  resetPasswordDescription: string;
  resetCode: string;
  resetCodeDescription: string;
  newPassword: string;
  confirmPassword: string;
  changePassword: string;
  changingPassword: string;
  passwordRulesTitle: string;
  passwordRuleLength: string;
  passwordRuleUppercase: string;
  passwordRuleLowercase: string;
  passwordRuleDigit: string;
  passwordRuleSpecial: string;
  passwordMismatch: string;
  passwordResetRequestSuccess: string;
  passwordResetSuccess: string;
  passwordChangeSuccess: string;
  currentPassword: string;
  developmentResetCode: string;
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
  caloriesDescription: string;
  proteinDescription: string;
  carbsDescription: string;
  fatDescription: string;
  caloriesPerServingDescription: string;
  proteinPerServingDescription: string;
  carbsPerServingDescription: string;
  fatPerServingDescription: string;
  target: (value: number) => string;
  foodLogLoading: string;
  foodLogUnavailable: string;
  dailyLog: string;
  mealsAndMacros: string;
  logDescription: string;
  quickActions: string;
  quickActionsDescription: string;
  repeatLatestMeal: string;
  copyYesterday: string;
  recentMeals: string;
  favorites: string;
  templates: string;
  packagedFoods: string;
  barcode: string;
  lookupBarcode: string;
  scanBarcode: string;
  saveAsFavorite: string;
  saveAsTemplate: string;
  saveAsPackaged: string;
  updateSavedFood: string;
  cancelSavedFoodEdit: string;
  editingSavedFood: string;
  barcodeLookupNotFound: string;
  externalBarcodeResult: string;
  noRecentMeals: string;
  noFavorites: string;
  noTemplates: string;
  noPackagedFoods: string;
  useSavedFood: string;
  barcodeScannerTitle: string;
  barcodeScannerDescription: string;
  barcodeScannerUnsupported: string;
  closeScanner: string;
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
  logRecipe: string;
  recipeLogTitle: string;
  recipeLogDescription: string;
  servingsToLog: string;
  addToGroceryList: string;
  removeFromGroceryList: string;
  groceryList: string;
  groceryListDescription: string;
  copyGroceryList: string;
  noGroceriesSelected: string;
  plannedRecipes: string;
  createRecipe: string;
  editRecipe: string;
  deleteRecipe: string;
  removeIngredient: string;
  recipeName: string;
  servings: string;
  caloriesPerServing: string;
  proteinPerServing: string;
  carbsPerServing: string;
  fatPerServing: string;
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
  ingredientNutritionDescription: string;
  ingredientName: string;
  ingredientAmount: string;
  ingredientUnit: string;
  computedMacrosTitle: string;
  computedMacrosDescription: string;
  computedMacrosTotal: string;
  computedMacrosPerServing: string;
  computedMacrosApply: string;
  autoFillButton: string;
  autoFillRunning: string;
  autoFillUpdated: string;
  autoFillSkipped: string;
  autoFillFailed: string;
  currentSession: string;
  revokeSession: string;
  sessionRevoked: string;
  activeUntil: string;
  lastUsed: string;
  nutritionLookupTitle: string;
  nutritionLookupPlaceholder: string;
  nutritionLookupApply: string;
  nutritionLookupNoResults: string;
  nutritionLookupSearching: string;
  nutritionLookupSource: string;
  nutritionLookupGramsLabel: string;
  nutritionLookupUnknownUnit: (unit: string) => string;
  importRecipesTitle: string;
  importRecipesDescription: string;
  importRecipesPlaceholder: string;
  importRecipesAction: string;
  importRecipesInProgress: string;
  importRecipesQueryRequired: string;
  importRecipesNotConfigured: string;
  importRecipesNoResults: string;
  importRecipesSuccess: (count: number) => string;
  translateToSwedish: string;
  recipeLibraryTitle: string;
  recipeLibrarySearchPlaceholder: string;
  recipeLibraryCount: (count: number) => string;
  noRecipesMatchSearch: string;
  profileTitle: string;
  profileDescription: string;
  preferencesTitle: string;
  defaultMealLabel: string;
  defaultMealDescription: string;
  syncStatusTitle: string;
  syncStatusOnline: string;
  syncStatusOffline: string;
  syncStatusPending: (count: number) => string;
  syncStatusSynced: string;
  skipToContent: string;
  primaryNavigationLabel: string;
  userMenuLabel: string;
  clearSearch: string;
  syncStatusBadgeLabel: string;
}

export const translations: Record<AppLanguage, Translation> = {
  en: {
    appName: "Makrobalans",
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
    authHeroBadge: "Health tracker app",
    authHeroTitle:
      "Track nutrition with a real account and resilient offline logging.",
    authHeroDescription:
      "Makrobalans stores your meals, weight trend, goals, recipes and queues changes locally when you lose connection.",
    authBenefitOne: "Refresh-token based account session",
    authBenefitTwo: "SQL Server-backed food and weight history",
    authBenefitThree: "IndexedDB queue for offline writes",
    authError: "Authentication failed. Check your credentials and try again.",
    registerError: "Registration failed. Try a different email or password.",
    forgotPassword: "Forgot password",
    forgotPasswordDescription:
      "Request a one-time reset code and then set a new password.",
    requestPasswordReset: "Request reset code",
    requestingPasswordReset: "Requesting reset code...",
    resetPassword: "Reset password",
    resetPasswordDescription:
      "Enter your email, reset code and a new strong password.",
    resetCode: "Reset code",
    resetCodeDescription:
      "The code is valid for 15 minutes and can only be used once.",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    changePassword: "Change password",
    changingPassword: "Changing password...",
    passwordRulesTitle: "Password requirements",
    passwordRuleLength: "At least 12 characters",
    passwordRuleUppercase: "At least one uppercase letter",
    passwordRuleLowercase: "At least one lowercase letter",
    passwordRuleDigit: "At least one number",
    passwordRuleSpecial: "At least one special character",
    passwordMismatch: "Passwords do not match.",
    passwordResetRequestSuccess:
      "If the account exists, a reset code has been issued.",
    passwordResetSuccess:
      "Password reset complete. Sign in with your new password.",
    passwordChangeSuccess: "Password changed successfully.",
    currentPassword: "Current password",
    developmentResetCode: "Development reset code",
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
    caloriesDescription: "Total energy from the food (kcal).",
    proteinDescription: "Builds muscle and supports satiety (g).",
    carbsDescription: "Quick energy for body and brain (g).",
    fatDescription: "Sustained energy and hormone health (g).",
    caloriesPerServingDescription: "Energy in one portion of the recipe.",
    proteinPerServingDescription: "Protein in one portion of the recipe.",
    carbsPerServingDescription: "Carbs in one portion of the recipe.",
    fatPerServingDescription: "Fat in one portion of the recipe.",
    target: (value) => `Target ${value}`,
    foodLogLoading: "Loading today's food log...",
    foodLogUnavailable: "Your food log could not be loaded.",
    dailyLog: "Daily log",
    mealsAndMacros: "Meals and macros for today",
    logDescription:
      "Keep entries fast, readable, and ready for offline capture.",
    quickActions: "Quick actions",
    quickActionsDescription:
      "Repeat recent meals, reuse saved foods, or scan a packaged item barcode.",
    repeatLatestMeal: "Repeat latest meal",
    copyYesterday: "Copy yesterday",
    recentMeals: "Recent meals",
    favorites: "Favorites",
    templates: "Templates",
    packagedFoods: "Packaged foods",
    barcode: "Barcode",
    lookupBarcode: "Find barcode",
    scanBarcode: "Scan barcode",
    saveAsFavorite: "Save as favorite",
    saveAsTemplate: "Save as template",
    saveAsPackaged: "Save as packaged food",
    updateSavedFood: "Update saved food",
    cancelSavedFoodEdit: "Cancel saved food edit",
    editingSavedFood:
      "Editing a saved food will update your stored shortcut instead of creating a new one.",
    barcodeLookupNotFound: "No product was found for that barcode.",
    externalBarcodeResult: "External lookup result",
    noRecentMeals: "No recent meals yet.",
    noFavorites: "No favorites saved yet.",
    noTemplates: "No templates saved yet.",
    noPackagedFoods: "No packaged foods saved yet.",
    useSavedFood: "Use",
    barcodeScannerTitle: "Barcode scanner",
    barcodeScannerDescription:
      "Point your camera at a barcode to prefill a saved packaged food.",
    barcodeScannerUnsupported:
      "Barcode scanning is not supported on this device. Enter the barcode manually instead.",
    closeScanner: "Close scanner",
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
    progressTitle: "Your progress is trending in the right direction",
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
    logRecipe: "Log recipe",
    recipeLogTitle: "Log recipe as meal",
    recipeLogDescription:
      "Send a saved recipe straight into the food log with serving scaling.",
    servingsToLog: "Servings to log",
    addToGroceryList: "Add to grocery list",
    removeFromGroceryList: "Remove from grocery list",
    groceryList: "Grocery list",
    groceryListDescription:
      "Pick recipes and Makrobalans will group ingredients into one list.",
    copyGroceryList: "Copy grocery list",
    noGroceriesSelected: "Select one or more recipes to build a grocery list.",
    plannedRecipes: "Planned recipes",
    createRecipe: "Create recipe",
    editRecipe: "Edit recipe",
    deleteRecipe: "Delete recipe",
    removeIngredient: "Remove ingredient",
    recipeName: "Recipe name",
    servings: "Servings",
    caloriesPerServing: "Calories per serving",
    proteinPerServing: "Protein per serving",
    carbsPerServing: "Carbs per serving",
    fatPerServing: "Fat per serving",
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
    ingredientNutritionDescription:
      "Per-ingredient macros are optional. Use them as a fallback when the per-serving values above are blank, or fill them automatically with the Livsmedelsverket lookup below.",
    ingredientName: "Name",
    ingredientAmount: "Amount",
    ingredientUnit: "Unit",
    computedMacrosTitle: "Calculated from ingredients",
    computedMacrosDescription:
      "Live totals based on the ingredient macros below.",
    computedMacrosTotal: "Total",
    computedMacrosPerServing: "Per serving",
    computedMacrosApply: "Use as per-serving values",
    autoFillButton: "Look up macros for all ingredients",
    autoFillRunning: "Looking up…",
    autoFillUpdated: "updated",
    autoFillSkipped: "skipped (unknown unit or missing name/amount)",
    autoFillFailed: "not found",
    currentSession: "Current session",
    revokeSession: "Revoke session",
    sessionRevoked: "Revoked",
    activeUntil: "Active until",
    lastUsed: "Last used",
    nutritionLookupTitle: "Look up nutrition (Livsmedelsverket)",
    nutritionLookupPlaceholder: "Search food, e.g. chicken breast",
    nutritionLookupApply: "Use macros",
    nutritionLookupNoResults: "No matches",
    nutritionLookupSearching: "Searching...",
    nutritionLookupSource: "Source: Livsmedelsverket",
    nutritionLookupGramsLabel: "Grams",
    nutritionLookupUnknownUnit: (unit) =>
      `Unknown unit "${unit}" \u2014 enter grams manually.`,
    importRecipesTitle: "Import recipes",
    importRecipesDescription:
      "Search TheMealDB and save matching recipes to your library.",
    importRecipesPlaceholder: "e.g. chicken curry",
    importRecipesAction: "Import",
    importRecipesInProgress: "Importing recipes...",
    importRecipesQueryRequired: "Enter a search term before importing.",
    importRecipesNotConfigured:
      "Recipe import service is not configured on the server.",
    importRecipesNoResults: "No recipes were imported.",
    importRecipesSuccess: (count) => `Imported ${count} recipe(s).`,
    translateToSwedish: "Translate to Swedish",
    recipeLibraryTitle: "Recipe library",
    recipeLibrarySearchPlaceholder:
      "Search recipes by name, tag or ingredient...",
    recipeLibraryCount: (count) => `${count} recipe${count === 1 ? "" : "s"}`,
    noRecipesMatchSearch: "No recipes match your search.",
    profileTitle: "Your profile",
    profileDescription: "Account information from your current session.",
    preferencesTitle: "App preferences",
    defaultMealLabel: "Default meal for new entries",
    defaultMealDescription:
      "This meal will be pre-selected when you log a new food entry.",
    syncStatusTitle: "Sync status",
    syncStatusOnline: "Online",
    syncStatusOffline: "Offline",
    syncStatusPending: (count) =>
      `${count} change${count === 1 ? "" : "s"} waiting to sync`,
    syncStatusSynced: "All changes saved to the server.",
    skipToContent: "Skip to main content",
    primaryNavigationLabel: "Primary",
    userMenuLabel: "Account and sync status",
    clearSearch: "Clear search",
    syncStatusBadgeLabel: "Sync status",
  },
  sv: {
    appName: "Makrobalans",
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
    authHeroBadge: "En app för din hälsa",
    authHeroTitle: "Följ din kost med riktigt konto och tålig offlinelogik.",
    authHeroDescription:
      "Makrobalans sparar måltider, vikttrend, mål, recept och köar ändringar lokalt när uppkopplingen försvinner.",
    authBenefitOne: "Kontosession med refresh token",
    authBenefitTwo: "SQL Server-lagrad mat- och vikthistorik",
    authBenefitThree: "IndexedDB-kö för offlineändringar",
    authError:
      "Inloggningen misslyckades. Kontrollera dina uppgifter och försök igen.",
    registerError:
      "Registreringen misslyckades. Prova en annan e-post eller ett annat lösenord.",
    forgotPassword: "Glömt lösenord",
    forgotPasswordDescription:
      "Beställ en engångskod för återställning och ange sedan ett nytt lösenord.",
    requestPasswordReset: "Beställ återställningskod",
    requestingPasswordReset: "Beställer återställningskod...",
    resetPassword: "Återställ lösenord",
    resetPasswordDescription:
      "Ange din e-post, återställningskod och ett nytt starkt lösenord.",
    resetCode: "Återställningskod",
    resetCodeDescription:
      "Koden är giltig i 15 minuter och kan bara användas en gång.",
    newPassword: "Nytt lösenord",
    confirmPassword: "Bekräfta lösenord",
    changePassword: "Byt lösenord",
    changingPassword: "Byter lösenord...",
    passwordRulesTitle: "Lösenordsregler",
    passwordRuleLength: "Minst 12 tecken",
    passwordRuleUppercase: "Minst en stor bokstav",
    passwordRuleLowercase: "Minst en liten bokstav",
    passwordRuleDigit: "Minst en siffra",
    passwordRuleSpecial: "Minst ett specialtecken",
    passwordMismatch: "Lösenorden matchar inte.",
    passwordResetRequestSuccess:
      "Om kontot finns har en återställningskod skapats.",
    passwordResetSuccess:
      "Lösenordet har återställts. Logga in med ditt nya lösenord.",
    passwordChangeSuccess: "Lösenordet har uppdaterats.",
    currentPassword: "Nuvarande lösenord",
    developmentResetCode: "Återställningskod för utveckling",
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
    caloriesDescription: "Total energi från maten (kcal).",
    proteinDescription: "Bygger muskler och ger mättnad (g).",
    carbsDescription: "Snabb energi för kropp och hjärna (g).",
    fatDescription: "Långvarig energi och hormonbalans (g).",
    caloriesPerServingDescription: "Energi i en portion av receptet.",
    proteinPerServingDescription: "Protein i en portion av receptet.",
    carbsPerServingDescription: "Kolhydrater i en portion av receptet.",
    fatPerServingDescription: "Fett i en portion av receptet.",
    target: (value) => `Mål ${value}`,
    foodLogLoading: "Laddar dagens matlogg...",
    foodLogUnavailable: "Din matlogg kunde inte laddas.",
    dailyLog: "Matlogg",
    mealsAndMacros: "Måltider och makron för idag",
    logDescription:
      "Håll registreringen snabb, tydlig och redo för offlineanvändning.",
    quickActions: "Snabbåtgärder",
    quickActionsDescription:
      "Upprepa nyliga måltider, återanvänd sparade livsmedel eller skanna en streckkod.",
    repeatLatestMeal: "Upprepa senaste måltiden",
    copyYesterday: "Kopiera gårdagen",
    recentMeals: "Senaste måltider",
    favorites: "Favoriter",
    templates: "Mallmåltider",
    packagedFoods: "Förpackade livsmedel",
    barcode: "Streckkod",
    lookupBarcode: "Hämta streckkod",
    scanBarcode: "Skanna streckkod",
    saveAsFavorite: "Spara som favorit",
    saveAsTemplate: "Spara som mall",
    saveAsPackaged: "Spara som förpackad vara",
    updateSavedFood: "Uppdatera sparat livsmedel",
    cancelSavedFoodEdit: "Avbryt redigering av sparat livsmedel",
    editingSavedFood:
      "När du redigerar ett sparat livsmedel uppdateras den sparade genvägen istället för att en ny skapas.",
    barcodeLookupNotFound: "Ingen produkt hittades för den streckkoden.",
    externalBarcodeResult: "Resultat från extern streckkodssökning",
    noRecentMeals: "Inga nyliga måltider ännu.",
    noFavorites: "Inga favoriter sparade ännu.",
    noTemplates: "Inga mallar sparade ännu.",
    noPackagedFoods: "Inga förpackade livsmedel sparade ännu.",
    useSavedFood: "Använd",
    barcodeScannerTitle: "Streckkodsläsare",
    barcodeScannerDescription:
      "Rikta kameran mot en streckkod för att fylla i ett sparat förpackat livsmedel.",
    barcodeScannerUnsupported:
      "Streckkodsskanning stöds inte på den här enheten. Ange streckkoden manuellt istället.",
    closeScanner: "Stäng läsaren",
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
    progressTitle: "Din utveckling går åt rätt håll",
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
    logRecipe: "Logga recept",
    recipeLogTitle: "Logga recept som måltid",
    recipeLogDescription:
      "Skicka ett sparat recept direkt till matloggen med skalning av portioner.",
    servingsToLog: "Portioner att logga",
    addToGroceryList: "Lägg till i inköpslista",
    removeFromGroceryList: "Ta bort från inköpslista",
    groceryList: "Inköpslista",
    groceryListDescription:
      "Välj recept så grupperar Makrobalans ingredienserna i en lista.",
    copyGroceryList: "Kopiera inköpslista",
    noGroceriesSelected:
      "Välj ett eller flera recept för att skapa en inköpslista.",
    plannedRecipes: "Planerade recept",
    createRecipe: "Skapa recept",
    editRecipe: "Redigera recept",
    deleteRecipe: "Ta bort recept",
    removeIngredient: "Ta bort ingrediens",
    recipeName: "Receptnamn",
    servings: "Portioner",
    caloriesPerServing: "Kalorier per portion",
    proteinPerServing: "Protein per portion",
    carbsPerServing: "Kolhydrater per portion",
    fatPerServing: "Fett per portion",
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
    ingredientNutritionDescription:
      "Näringsvärden per ingrediens är valfria. Används som reserv när värdena per portion ovan saknas, eller fyll i automatiskt via Livsmedelsverket-uppslagningen nedan.",
    ingredientName: "Namn",
    ingredientAmount: "Mängd",
    ingredientUnit: "Enhet",
    computedMacrosTitle: "Beräknat från ingredienser",
    computedMacrosDescription:
      "Live-summa baserad på ingrediensernas näringsvärden.",
    computedMacrosTotal: "Totalt",
    computedMacrosPerServing: "Per portion",
    computedMacrosApply: "Använd som värden per portion",
    autoFillButton: "Slå upp makros för alla ingredienser",
    autoFillRunning: "Slår upp…",
    autoFillUpdated: "uppdaterade",
    autoFillSkipped: "hoppades över (okänd enhet eller saknat namn/mängd)",
    autoFillFailed: "hittades inte",
    currentSession: "Nuvarande session",
    revokeSession: "Återkalla session",
    sessionRevoked: "Återkallad",
    activeUntil: "Aktiv till",
    lastUsed: "Senast använd",
    nutritionLookupTitle: "Slå upp näringsvärden (Livsmedelsverket)",
    nutritionLookupPlaceholder: "Sök livsmedel, t.ex. kycklingfilé",
    nutritionLookupApply: "Använd makros",
    nutritionLookupNoResults: "Inga träffar",
    nutritionLookupSearching: "Söker...",
    nutritionLookupSource: "Källa: Livsmedelsverket",
    nutritionLookupGramsLabel: "Gram",
    nutritionLookupUnknownUnit: (unit) =>
      `Okänd enhet "${unit}" \u2014 ange gram manuellt.`,
    importRecipesTitle: "Importera recept",
    importRecipesDescription:
      "Sök på TheMealDB och spara matchande recept i ditt bibliotek.",
    importRecipesPlaceholder: "t.ex. kycklinggryta",
    importRecipesAction: "Importera",
    importRecipesInProgress: "Importerar recept...",
    importRecipesQueryRequired: "Skriv en sökterm innan du importerar.",
    importRecipesNotConfigured:
      "Receptimporten är inte konfigurerad på servern.",
    importRecipesNoResults: "Inga recept importerades.",
    importRecipesSuccess: (count) => `${count} recept importerade.`,
    translateToSwedish: "Översätt till svenska",
    recipeLibraryTitle: "Receptbibliotek",
    recipeLibrarySearchPlaceholder:
      "Sök recept på namn, tagg eller ingrediens...",
    recipeLibraryCount: (count) => `${count} recept`,
    noRecipesMatchSearch: "Inga recept matchar din sökning.",
    profileTitle: "Din profil",
    profileDescription: "Kontoinformation från din nuvarande session.",
    preferencesTitle: "Appinställningar",
    defaultMealLabel: "Standardmåltid för nya inlägg",
    defaultMealDescription:
      "Den här måltiden väljs automatiskt när du loggar ett nytt livsmedel.",
    syncStatusTitle: "Synkstatus",
    syncStatusOnline: "Online",
    syncStatusOffline: "Offline",
    syncStatusPending: (count) =>
      `${count} ändring${count === 1 ? "" : "ar"} väntar på synk`,
    syncStatusSynced: "Alla ändringar är sparade på servern.",
    skipToContent: "Hoppa till huvudinnehållet",
    primaryNavigationLabel: "Huvudmeny",
    userMenuLabel: "Konto och synkstatus",
    clearSearch: "Rensa sökning",
    syncStatusBadgeLabel: "Synkstatus",
  },
};
