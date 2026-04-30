import { RecipeSummary } from "../types/models";

export interface GroceryListItem {
  key: string;
  name: string;
  unit: string;
  amount: number;
}

const storageKey = "foodie-grocery-planned-recipes";

export const buildGroceryListItems = (
  recipes: RecipeSummary[],
): GroceryListItem[] => {
  const itemsByKey = new Map<string, GroceryListItem>();

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      const key =
        ingredient.name.trim().toLowerCase() +
        "::" +
        ingredient.unit.trim().toLowerCase();
      const existingItem = itemsByKey.get(key);

      if (existingItem) {
        existingItem.amount += ingredient.amount;
        return;
      }

      itemsByKey.set(key, {
        key,
        name: ingredient.name,
        unit: ingredient.unit,
        amount: ingredient.amount,
      });
    });
  });

  return [...itemsByKey.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
};

export const buildGroceryListText = (items: GroceryListItem[]) => {
  return items
    .map((item) => {
      const unitPart = item.unit ? " " + item.unit : "";
      const displayAmount = Number.isInteger(item.amount)
        ? String(item.amount)
        : item.amount.toFixed(1);
      return item.name + ": " + displayAmount + unitPart;
    })
    .join("\n");
};

export const readPlannedRecipeIds = () => {
  const rawValue = window.localStorage.getItem(storageKey);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue)
      ? parsedValue.filter(
          (value): value is string => typeof value === "string",
        )
      : [];
  } catch {
    return [];
  }
};

export const writePlannedRecipeIds = (recipeIds: string[]) => {
  window.localStorage.setItem(storageKey, JSON.stringify(recipeIds));
};
