import { z } from 'zod';
import { AppSettingCreateManyInputObjectSchema } from './objects/AppSettingCreateManyInput.schema'

export const AppSettingCreateManySchema = z.object({ data: z.union([ AppSettingCreateManyInputObjectSchema, z.array(AppSettingCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() })