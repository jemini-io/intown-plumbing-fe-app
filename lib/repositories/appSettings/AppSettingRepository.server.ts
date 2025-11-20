/**
 * Server-side wrappers for AppSettingRepository
 * Expose repository methods as Server Actions for client components.
 */
"use server";

import { AppSettingRepository, SettingData } from "./AppSettingRepository";

/**
 * Server Action: Get all app settings.
 */
export async function getAppSettings() {
  return AppSettingRepository.findAll();
}

/**
 * Server Action: Find app setting by ID.
 */
export async function findAppSettingById(id: number) {
  return AppSettingRepository.findById(id);
}

/**
 * Server Action: Find app setting by key.
 */
export async function findAppSettingByKey(key: string) {
  return AppSettingRepository.findByKey(key);
}

/**
 * Server Action: Create a new app setting.
 */
export async function createAppSetting(data: SettingData) {
  return AppSettingRepository.create(data);
}

/**
 * Server Action: Update an existing app setting.
 */
export async function updateAppSetting(id: number, data: SettingData) {
  return AppSettingRepository.update(id, data);
}

/**
 * Server Action: Delete an app setting.
 */
export async function deleteAppSetting(id: number) {
  return AppSettingRepository.delete(id);
}

