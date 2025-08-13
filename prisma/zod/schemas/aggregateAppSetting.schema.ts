import { z } from 'zod';
import { AppSettingOrderByWithRelationInputObjectSchema } from './objects/AppSettingOrderByWithRelationInput.schema';
import { AppSettingWhereInputObjectSchema } from './objects/AppSettingWhereInput.schema';
import { AppSettingWhereUniqueInputObjectSchema } from './objects/AppSettingWhereUniqueInput.schema';
import { AppSettingCountAggregateInputObjectSchema } from './objects/AppSettingCountAggregateInput.schema';
import { AppSettingMinAggregateInputObjectSchema } from './objects/AppSettingMinAggregateInput.schema';
import { AppSettingMaxAggregateInputObjectSchema } from './objects/AppSettingMaxAggregateInput.schema';
import { AppSettingAvgAggregateInputObjectSchema } from './objects/AppSettingAvgAggregateInput.schema';
import { AppSettingSumAggregateInputObjectSchema } from './objects/AppSettingSumAggregateInput.schema'

export const AppSettingAggregateSchema = z.object({ orderBy: z.union([AppSettingOrderByWithRelationInputObjectSchema, AppSettingOrderByWithRelationInputObjectSchema.array()]).optional(), where: AppSettingWhereInputObjectSchema.optional(), cursor: AppSettingWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), AppSettingCountAggregateInputObjectSchema ]).optional(), _min: AppSettingMinAggregateInputObjectSchema.optional(), _max: AppSettingMaxAggregateInputObjectSchema.optional(), _avg: AppSettingAvgAggregateInputObjectSchema.optional(), _sum: AppSettingSumAggregateInputObjectSchema.optional() })