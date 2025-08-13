import { z } from 'zod';
import { AppSettingWhereInputObjectSchema } from './objects/AppSettingWhereInput.schema';
import { AppSettingOrderByWithAggregationInputObjectSchema } from './objects/AppSettingOrderByWithAggregationInput.schema';
import { AppSettingScalarWhereWithAggregatesInputObjectSchema } from './objects/AppSettingScalarWhereWithAggregatesInput.schema';
import { AppSettingScalarFieldEnumSchema } from './enums/AppSettingScalarFieldEnum.schema'

export const AppSettingGroupBySchema = z.object({ where: AppSettingWhereInputObjectSchema.optional(), orderBy: z.union([AppSettingOrderByWithAggregationInputObjectSchema, AppSettingOrderByWithAggregationInputObjectSchema.array()]).optional(), having: AppSettingScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(AppSettingScalarFieldEnumSchema)  })