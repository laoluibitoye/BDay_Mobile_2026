import { apiRequest } from './client';
import type { Plan } from './types';

export function getPlans(): Promise<Plan[]> {
  return apiRequest('/api/v1/plans');
}
