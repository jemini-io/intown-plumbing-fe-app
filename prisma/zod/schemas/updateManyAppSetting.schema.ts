import { z } from 'zod';
import { AppSettingUpdateManyMutationInputObjectSchema } from './objects/AppSettingUpdateManyMutationInput.schema';
import { AppSettingWhereInputObjectSchema } from './objects/AppSettingWhereInput.schema'

export const AppSettingUpdateManySchema = z.object({ data: AppSettingUpdateManyMutationInputObjectSchema, where: AppSettingWhereInputObjectSchema.optional()  })