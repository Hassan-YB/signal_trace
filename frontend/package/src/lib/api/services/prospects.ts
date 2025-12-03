/**
 * Prospects Service
 * 
 * Prospect management API methods.
 */

import { get, post, put, patch, del } from '../client'
import type { ApiResponse } from '../types'

export interface Prospect {
  id: number
  full_name: string
  company_name: string
  title?: string
  email?: string
  linkedin_url?: string
  website?: string
  industry?: string
  status: 'cold' | 'warm' | 'hot'
  intent_score: number
  created_at: string
  updated_at: string
}

export interface ProspectRequest {
  full_name: string
  company_name: string
  title?: string
  email?: string
  linkedin_url?: string
  website?: string
  industry?: string
  status?: 'cold' | 'warm' | 'hot'
}

export interface ProspectsResponse {
  prospects: Prospect[]
}

export interface ProspectResponse {
  prospect: Prospect
}

/**
 * Get all prospects for the authenticated user
 * GET /api/prospects/
 */
export async function getProspects(): Promise<ApiResponse<ProspectsResponse>> {
  return get<ProspectsResponse>('/api/prospects/')
}

/**
 * Get a specific prospect
 * GET /api/prospects/:id/
 */
export async function getProspect(id: number): Promise<ApiResponse<ProspectResponse>> {
  return get<ProspectResponse>(`/api/prospects/${id}/`)
}

/**
 * Create a new prospect
 * POST /api/prospects/
 */
export async function createProspect(
  data: ProspectRequest
): Promise<ApiResponse<ProspectResponse>> {
  return post<ProspectResponse>('/api/prospects/', data)
}

/**
 * Update a prospect
 * PUT /api/prospects/:id/
 */
export async function updateProspect(
  id: number,
  data: ProspectRequest
): Promise<ApiResponse<ProspectResponse>> {
  return put<ProspectResponse>(`/api/prospects/${id}/`, data)
}

/**
 * Partially update a prospect
 * PATCH /api/prospects/:id/
 */
export async function patchProspect(
  id: number,
  data: Partial<ProspectRequest>
): Promise<ApiResponse<ProspectResponse>> {
  return patch<ProspectResponse>(`/api/prospects/${id}/`, data)
}

/**
 * Delete a prospect
 * DELETE /api/prospects/:id/
 */
export async function deleteProspect(id: number): Promise<ApiResponse> {
  return del(`/api/prospects/${id}/`)
}

