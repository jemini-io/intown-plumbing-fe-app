import { z } from 'zod';
import { AppSettingSelectObjectSchema } from './objects/AppSettingSelect.schema';
import { AppSettingCreateInputObjectSchema } from './objects/AppSettingCreateInput.schema';
import { AppSettingUncheckedCreateInputObjectSchema } from './objects/AppSettingUncheckedCreateInput.schema'

export const AppSettingCreateOneSchema = z.object({ select: AppSettingSelectObjectSchema.optional(),  data: z.union([AppSettingCreateInputObjectSchema, AppSettingUncheckedCreateInputObjectSchema])  })