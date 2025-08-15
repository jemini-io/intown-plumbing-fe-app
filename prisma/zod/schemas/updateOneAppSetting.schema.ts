import { z } from 'zod';
import { AppSettingSelectObjectSchema } from './objects/AppSettingSelect.schema';
import { AppSettingUpdateInputObjectSchema } from './objects/AppSettingUpdateInput.schema';
import { AppSettingUncheckedUpdateInputObjectSchema } from './objects/AppSettingUncheckedUpdateInput.schema';
import { AppSettingWhereUniqueInputObjectSchema } from './objects/AppSettingWhereUniqueInput.schema'

export const AppSettingUpdateOneSchema = z.object({ select: AppSettingSelectObjectSchema.optional(),  data: z.union([AppSettingUpdateInputObjectSchema, AppSettingUncheckedUpdateInputObjectSchema]), where: AppSettingWhereUniqueInputObjectSchema  })