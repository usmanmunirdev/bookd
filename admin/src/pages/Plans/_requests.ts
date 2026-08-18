import { PromiseHandler, apiHelper } from "../../utils/apiHandler";

const API_URL = import.meta.env.VITE_API_URL;

export const PLANS_URL = `${API_URL}/plans`;

// Get all plans
export const getPlans = (page: number, searchKeyword?: string) =>
  PromiseHandler(
    apiHelper(
      "get",
      `${PLANS_URL}?page=${page}&search=${searchKeyword ?? ""}`,
      null
    )
  );

// Get a specific plan
export const getPlan = (planId: string) =>
  PromiseHandler(apiHelper("get", `${PLANS_URL}/${planId}`, null));

// Create a new plan
export const createPlans = (planData: any) =>
  PromiseHandler(apiHelper("post", PLANS_URL, planData));

// Update an existing plan
export const updatePlans = (planId: string, planData: any) =>
  PromiseHandler(apiHelper("put", `${PLANS_URL}/${planId}`, planData));

// Delete a plan
export const deletePlans = (planId: string) =>
  PromiseHandler(apiHelper("delete", `${PLANS_URL}/${planId}`, null));

// (Optional) Admin Plan Stats
export const getAdminPlansStats = () =>
  PromiseHandler(apiHelper("get", `${PLANS_URL}/stats`, null));
