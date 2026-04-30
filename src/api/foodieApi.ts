import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "./httpClient";
import {
  AuthSession,
  CreateMealLogEntryRequest,
  CreateWeightEntryRequest,
  DailyLog,
  DashboardSummary,
  GoalMode,
  LoginRequest,
  MealLogItem,
  RecipeSummary,
  RegisterRequest,
  RecipeIngredient,
  NutritionMacros,
  NutritionSearchResult,
  SavedFoodSummary,
  SessionSummary,
  SessionProfile,
  UpdateMealLogEntryRequest,
  UpsertSavedFoodRequest,
  UpsertRecipeRequest,
  WeightEntry,
} from "../types/models";

import { useSessionContext } from "../contexts/SessionContext";
import {
  enqueueOfflineMutation,
  getOfflineMutationCount,
} from "../offline/offlineQueue";
import { getDeviceNameHeader } from "../auth/refreshSession";

const sessionProfileQueryKey = ["session-profile"];
const dashboardQueryKey = ["dashboard-summary"];
const dailyLogQueryKey = ["daily-log"];
const weightTrendQueryKey = ["weight-trend"];
const recipesQueryKey = ["recipes"];
const savedFoodsQueryKey = ["saved-foods"];
const recentMealsQueryKey = ["recent-meals"];
const sessionsQueryKey = ["auth-sessions"];

type OfflineSupportedKind = "create-food-log" | "create-weight-entry";

interface OfflinePayloadMap {
  "create-food-log": CreateMealLogEntryRequest & { clientMutationId: string };
  "create-weight-entry": CreateWeightEntryRequest & {
    clientMutationId: string;
  };
}

const toAuthSession = (payload: AuthSession): AuthSession => payload;

const buildLocalMealLogItem = (
  request: CreateMealLogEntryRequest & { clientMutationId: string },
): MealLogItem => ({
  id: request.clientMutationId,
  mealName: request.mealName,
  foodName: request.foodName,
  calories: request.calories,
  protein: request.protein,
  carbs: request.carbs,
  fat: request.fat,
  loggedAt: request.loggedAt,
});

const appendMealLogItem = (
  currentValue: DailyLog | undefined,
  item: MealLogItem,
  logDate: string,
): DailyLog => ({
  date: currentValue?.date ?? logDate,
  items: [...(currentValue?.items ?? []), item].sort((left, right) =>
    left.loggedAt.localeCompare(right.loggedAt),
  ),
});

const replaceMealLogItem = (
  currentValue: DailyLog | undefined,
  item: MealLogItem,
): DailyLog | undefined =>
  currentValue
    ? {
        ...currentValue,
        items: currentValue.items
          .map((currentItem) =>
            currentItem.id === item.id ? item : currentItem,
          )
          .sort((left, right) => left.loggedAt.localeCompare(right.loggedAt)),
      }
    : currentValue;

const removeMealLogItem = (
  currentValue: DailyLog | undefined,
  mealLogId: string,
): DailyLog | undefined =>
  currentValue
    ? {
        ...currentValue,
        items: currentValue.items.filter((item) => item.id !== mealLogId),
      }
    : currentValue;

const appendWeightEntry = (
  currentValue: WeightEntry[] | undefined,
  item: WeightEntry,
): WeightEntry[] =>
  [...(currentValue ?? []), item].sort((left, right) =>
    left.date.localeCompare(right.date),
  );

const createMutationId = () => window.crypto.randomUUID();

export const fetchNutritionSearch = async (query: string) =>
  (
    await httpClient.get<NutritionSearchResult[]>(`/recipes/nutrition/search`, {
      params: { query: query.trim() },
    })
  ).data;

export const fetchNutritionMacros = async (foodNumber: number, grams: number) =>
  (
    await httpClient.get<NutritionMacros>(`/recipes/nutrition/${foodNumber}`, {
      params: { grams },
    })
  ).data;

interface OfflineMutationResult<TItem> {
  item: TItem;
  queued: boolean;
}

const refreshQueuedActionBadge = async (
  sessionEmail: string | undefined,
  refreshQueuedActions: (nextCount?: number) => Promise<void>,
) => {
  if (!sessionEmail) {
    return;
  }

  const queuedCount = await getOfflineMutationCount(sessionEmail);
  await refreshQueuedActions(queuedCount);
};

interface OfflineSubmitOptions<TKind extends OfflineSupportedKind, TItem> {
  authSession: AuthSession | null;
  isOnline: boolean;
  kind: TKind;
  payload: OfflinePayloadMap[TKind];
  createQueuedItem: () => TItem;
  postOnline: () => Promise<TItem>;
}

const submitWithOfflineSupport = async <
  TKind extends OfflineSupportedKind,
  TItem,
>({
  authSession,
  isOnline,
  kind,
  payload,
  createQueuedItem,
  postOnline,
}: OfflineSubmitOptions<TKind, TItem>): Promise<
  OfflineMutationResult<TItem>
> => {
  if (!isOnline && authSession) {
    await enqueueOfflineMutation({
      id: payload.clientMutationId,
      sessionEmail: authSession.email,
      kind,
      payload,
      createdAt: new Date().toISOString(),
    });

    return {
      item: createQueuedItem(),
      queued: true,
    };
  }

  return {
    item: await postOnline(),
    queued: false,
  };
};

export const useSessionProfile = () => {
  const { authSession } = useSessionContext();

  return useQuery({
    queryKey: sessionProfileQueryKey,
    enabled: Boolean(authSession),
    queryFn: async () =>
      (await httpClient.get<SessionProfile>("/session")).data,
  });
};

export const useDashboardSummary = () => {
  const { authSession } = useSessionContext();

  return useQuery({
    queryKey: dashboardQueryKey,
    enabled: Boolean(authSession),
    queryFn: async () =>
      (await httpClient.get<DashboardSummary>("/dashboard")).data,
  });
};

export const useDailyLog = (date?: string, options?: { enabled?: boolean }) => {
  const { authSession } = useSessionContext();
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: [...dailyLogQueryKey, date ?? "today"],
    enabled: Boolean(authSession) && enabled,
    queryFn: async () =>
      (
        await httpClient.get<DailyLog>("/food-log/today", {
          params: date ? { date } : undefined,
        })
      ).data,
  });
};

export const useRecentMeals = () => {
  const { authSession } = useSessionContext();

  return useQuery({
    queryKey: recentMealsQueryKey,
    enabled: Boolean(authSession),
    queryFn: async () =>
      (await httpClient.get<MealLogItem[]>("/food-log/recent")).data,
  });
};

export const useWeightTrend = () => {
  const { authSession } = useSessionContext();

  return useQuery({
    queryKey: weightTrendQueryKey,
    enabled: Boolean(authSession),
    queryFn: async () =>
      (await httpClient.get<WeightEntry[]>("/progress/weight")).data,
  });
};

export const useRecipes = () => {
  const { authSession } = useSessionContext();

  return useQuery({
    queryKey: recipesQueryKey,
    enabled: Boolean(authSession),
    queryFn: async () =>
      (await httpClient.get<RecipeSummary[]>("/recipes")).data,
  });
};

export const useSavedFoods = () => {
  const { authSession } = useSessionContext();

  return useQuery({
    queryKey: savedFoodsQueryKey,
    enabled: Boolean(authSession),
    queryFn: async () =>
      (await httpClient.get<SavedFoodSummary[]>("/saved-foods")).data,
  });
};

export const useLoginMutation = () =>
  useMutation({
    mutationFn: async (request: LoginRequest) =>
      toAuthSession(
        (
          await httpClient.post<AuthSession>("/auth/login", request, {
            headers: { "X-Device-Name": getDeviceNameHeader() },
          })
        ).data,
      ),
  });

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: async (request: RegisterRequest) =>
      toAuthSession(
        (
          await httpClient.post<AuthSession>("/auth/register", request, {
            headers: { "X-Device-Name": getDeviceNameHeader() },
          })
        ).data,
      ),
  });

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: async (sessionId: string) => {
      await httpClient.post("/auth/logout", { sessionId });
    },
  });

export const useSessionsQuery = () => {
  const { authSession } = useSessionContext();

  return useQuery({
    queryKey: sessionsQueryKey,
    enabled: Boolean(authSession),
    queryFn: async () =>
      (await httpClient.get<SessionSummary[]>("/auth/sessions")).data,
  });
};

export const useRevokeSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await httpClient.post(`/auth/sessions/${sessionId}/revoke`);
      return sessionId;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
    },
  });
};

export const useRevokeOtherSessionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await httpClient.post("/auth/sessions/revoke-others");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
    },
  });
};

export const useUpdateGoalModeMutation = () => {
  const queryClient = useQueryClient();
  const { setSelectedGoalMode } = useSessionContext();

  return useMutation({
    mutationFn: async (goalMode: GoalMode) => {
      await httpClient.post("/session/goal", { goalMode });
      return goalMode;
    },
    onSuccess: (goalMode) => {
      setSelectedGoalMode(goalMode);
      queryClient.setQueryData<SessionProfile | undefined>(
        sessionProfileQueryKey,
        (currentValue) =>
          currentValue
            ? {
                ...currentValue,
                selectedGoalMode: goalMode,
              }
            : currentValue,
      );
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });
};

export const useCreateMealLogMutation = () => {
  const queryClient = useQueryClient();
  const { authSession, isOnline, refreshQueuedActions } = useSessionContext();

  return useMutation({
    mutationFn: async (request: CreateMealLogEntryRequest) => {
      const clientMutationId = createMutationId();
      const payload = { ...request, clientMutationId };

      return {
        ...(await submitWithOfflineSupport({
          authSession,
          isOnline,
          kind: "create-food-log",
          payload,
          createQueuedItem: () => buildLocalMealLogItem(payload),
          postOnline: async () =>
            (await httpClient.post<MealLogItem>("/food-log", payload)).data,
        })),
        logDate: request.logDate,
      };
    },
    onSuccess: async ({ item, logDate, queued }) => {
      queryClient.setQueriesData<DailyLog | undefined>(
        { queryKey: dailyLogQueryKey },
        (currentValue) =>
          currentValue?.date === logDate
            ? appendMealLogItem(currentValue, item, logDate)
            : currentValue,
      );

      if (queued && authSession) {
        await refreshQueuedActionBadge(authSession.email, refreshQueuedActions);
      }

      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      void queryClient.invalidateQueries({ queryKey: dailyLogQueryKey });
      void queryClient.invalidateQueries({ queryKey: recentMealsQueryKey });
    },
  });
};

export const useUpdateMealLogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateMealLogEntryRequest;
    }) => (await httpClient.put<MealLogItem>(`/food-log/${id}`, request)).data,
    onSuccess: (item) => {
      queryClient.setQueryData<DailyLog | undefined>(
        dailyLogQueryKey,
        (currentValue) => replaceMealLogItem(currentValue, item),
      );

      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      void queryClient.invalidateQueries({ queryKey: dailyLogQueryKey });
    },
  });
};

export const useDeleteMealLogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/food-log/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<DailyLog | undefined>(
        dailyLogQueryKey,
        (currentValue) => removeMealLogItem(currentValue, id),
      );

      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      void queryClient.invalidateQueries({ queryKey: dailyLogQueryKey });
    },
  });
};

export const useCreateSavedFoodMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpsertSavedFoodRequest) =>
      (await httpClient.post<SavedFoodSummary>("/saved-foods", request)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: savedFoodsQueryKey });
    },
  });
};

export const useDeleteSavedFoodMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/saved-foods/${id}`);
      return id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: savedFoodsQueryKey });
    },
  });
};

export const useUpdateSavedFoodMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpsertSavedFoodRequest;
    }) =>
      (await httpClient.put<SavedFoodSummary>(`/saved-foods/${id}`, request))
        .data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: savedFoodsQueryKey });
    },
  });
};

export const useLookupSavedFoodByBarcodeMutation = () =>
  useMutation({
    mutationFn: async (barcode: string) =>
      (
        await httpClient.get<SavedFoodSummary>(
          `/saved-foods/barcode/${encodeURIComponent(barcode)}/lookup`,
        )
      ).data,
  });

export const useCreateWeightEntryMutation = () => {
  const queryClient = useQueryClient();
  const { authSession, isOnline, refreshQueuedActions } = useSessionContext();

  return useMutation({
    mutationFn: async (request: CreateWeightEntryRequest) => {
      const clientMutationId = createMutationId();
      const payload = { ...request, clientMutationId };

      return submitWithOfflineSupport({
        authSession,
        isOnline,
        kind: "create-weight-entry",
        payload,
        createQueuedItem: () => ({
          date: request.date,
          weightKg: request.weightKg,
        }),
        postOnline: async () =>
          (await httpClient.post<WeightEntry>("/progress/weight", payload))
            .data,
      });
    },
    onSuccess: async ({ item, queued }) => {
      queryClient.setQueryData<WeightEntry[] | undefined>(
        weightTrendQueryKey,
        (currentValue) => appendWeightEntry(currentValue, item),
      );

      if (queued && authSession) {
        await refreshQueuedActionBadge(authSession.email, refreshQueuedActions);
      }

      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });
};

export const useCreateRecipeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpsertRecipeRequest) =>
      (await httpClient.post<RecipeSummary>("/recipes", request)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recipesQueryKey });
    },
  });
};

export const useUpdateRecipeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpsertRecipeRequest;
    }) => (await httpClient.put<RecipeSummary>(`/recipes/${id}`, request)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recipesQueryKey });
    },
  });
};

export const useDeleteRecipeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/recipes/${id}`);
      return id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recipesQueryKey });
    },
  });
};

export const useNutritionSearchQuery = (query: string) => {
  const trimmed = query.trim();
  const { authSession } = useSessionContext();

  return useQuery({
    queryKey: ["nutrition-search", trimmed],
    enabled: Boolean(authSession) && trimmed.length >= 2,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => fetchNutritionSearch(trimmed),
  });
};

export const useNutritionMacrosMutation = () =>
  useMutation({
    mutationFn: async ({
      foodNumber,
      grams,
    }: {
      foodNumber: number;
      grams: number;
    }) => fetchNutritionMacros(foodNumber, grams),
  });

export const useImportRecipesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      query: string;
      count: number;
      translateToSwedish: boolean;
    }) =>
      (
        await httpClient.post<RecipeSummary[]>("/recipes/import", request, {
          timeout: 30000,
        })
      ).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recipesQueryKey });
    },
  });
};
