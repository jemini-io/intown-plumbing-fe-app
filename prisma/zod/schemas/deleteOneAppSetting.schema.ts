import { z } from 'zod';
import { AppSettingSelectObjectSchema } from './objects/AppSettingSelect.schema';
import { AppSettingWhereUniqueInputObjectSchema } from './objects/AppSettingWhereUniqueInput.schema'

export const AppSettingDeleteOneSchema = z.object({ select: AppSettingSelectObjectSchema.optional(),  where: AppSettingWhereUniqueInputObjectSchema  })