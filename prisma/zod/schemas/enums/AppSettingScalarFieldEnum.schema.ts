import { z } from 'zod';

export const AppSettingScalarFieldEnumSchema = z.enum(['id', 'key', 'value', 'createdAt', 'updatedAt'])