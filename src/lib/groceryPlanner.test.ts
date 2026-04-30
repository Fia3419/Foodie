import { describe, expect, it } from "vitest";
import {
  buildGroceryListItems,
  buildGroceryListText,
  readPlannedRecipeIds,
  writePlannedRecipeIds,
} from "./groceryPlanner";
import { RecipeSummary } from "../types/models";

const createRecipe = (overrides: Partial<RecipeSummary>): RecipeSummary => ({
  id: overrides.id ?? crypto.randomUUID(),
  name: overrides.name ?? "Recipe",
  servings: overrides.servings ?? 1,
  caloriesPerServing: overrides.caloriesPerServing ?? 0,
  proteinPerServing: overrides.proteinPerServing ?? 0,
  carbsPerServing: overrides.carbsPerServing ?? 0,
  fatPerServing: overrides.fatPerServing ?? 0,
  tags: overrides.tags ?? [],
  ingredients: overrides.ingredients ?? [],
  instructions: overrides.instructions ?? "",
  isOwnedByCurrentUser: overrides.isOwnedByCurrentUser ?? true,
});

describe("groceryPlanner", () => {
  it("combines ingredients from planned recipes by normalized name and unit", () => {
    const recipes = [
      createRecipe({
        name: "Overnight oats",
        ingredients: [
          {
            name: "Oats",
            amount: 50,
            unit: "g",
            calories: 190,
            protein: 7,
            carbs: 32,
            fat: 3,
          },
          {
            name: "Milk",
            amount: 200,
            unit: "ml",
            calories: 90,
            protein: 7,
            carbs: 10,
            fat: 2,
          },
        ],
      }),
      createRecipe({
        name: "Porridge",
        ingredients: [
          {
            name: " oats ",
            amount: 30,
            unit: "G",
            calories: 114,
            protein: 4,
            carbs: 19,
            fat: 2,
          },
          {
            name: "Banana",
            amount: 1,
            unit: "pc",
            calories: 100,
            protein: 1,
            carbs: 23,
            fat: 0,
          },
        ],
      }),
    ];

    const items = buildGroceryListItems(recipes);

    expect(items).toEqual([
      { key: "banana::pc", name: "Banana", unit: "pc", amount: 1 },
      { key: "milk::ml", name: "Milk", unit: "ml", amount: 200 },
      { key: "oats::g", name: "Oats", unit: "g", amount: 80 },
    ]);
  });

  it("formats grocery list text with stable readable amounts", () => {
    const text = buildGroceryListText([
      { key: "berries::g", name: "Berries", unit: "g", amount: 125.5 },
      { key: "eggs::", name: "Eggs", unit: "", amount: 2 },
    ]);

    expect(text).toBe("Berries: 125.5 g\nEggs: 2");
  });

  it("persists and reads planned recipe identifiers from local storage", () => {
    writePlannedRecipeIds(["recipe-1", "recipe-2"]);

    expect(readPlannedRecipeIds()).toEqual(["recipe-1", "recipe-2"]);
  });

  it("returns an empty list when stored planned recipes are invalid", () => {
    window.localStorage.setItem(
      "foodie-grocery-planned-recipes",
      "{invalid json",
    );

    expect(readPlannedRecipeIds()).toEqual([]);
  });
});
