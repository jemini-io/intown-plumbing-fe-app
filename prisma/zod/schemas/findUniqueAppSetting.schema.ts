import { z } from 'zod';
import { AppSettingSelectObjectSchema } from './objects/AppSettingSelect.schema';
import { AppSettingWhereUniqueInputObjectSchema } from './objects/AppSettingWhereUniqueInput.schema'

export const AppSettingFindUniqueSchema = z.object({ select: AppSettingSelectObjectSchema.optional(),  where: AppSettingWhereUniqueInputObjectSchema })