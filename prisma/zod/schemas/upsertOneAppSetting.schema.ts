import { z } from 'zod';
import { AppSettingSelectObjectSchema } from './objects/AppSettingSelect.schema';
import { AppSettingWhereUniqueInputObjectSchema } from './objects/AppSettingWhereUniqueInput.schema';
import { AppSettingCreateInputObjectSchema } from './objects/AppSettingCreateInput.schema';
import { AppSettingUncheckedCreateInputObjectSchema } from './objects/AppSettingUncheckedCreateInput.schema';
import { AppSettingUpdateInputObjectSchema } from './objects/AppSettingUpdateInput.schema';
import { AppSettingUncheckedUpdateInputObjectSchema } from './objects/AppSettingUncheckedUpdateInput.schema'

export const AppSettingUpsertSchema = z.object({ select: AppSettingSelectObjectSchema.optional(),  where: AppSettingWhereUniqueInputObjectSchema, create: z.union([ AppSettingCreateInputObjectSchema, AppSettingUncheckedCreateInputObjectSchema ]), update: z.union([ AppSettingUpdateInputObjectSchema, AppSettingUncheckedUpdateInputObjectSchema ])  })