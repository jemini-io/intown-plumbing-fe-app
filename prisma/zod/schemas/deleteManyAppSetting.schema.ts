import { z } from 'zod';
import { AppSettingWhereInputObjectSchema } from './objects/AppSettingWhereInput.schema'

export const AppSettingDeleteManySchema = z.object({ where: AppSettingWhereInputObjectSchema.optional()  })