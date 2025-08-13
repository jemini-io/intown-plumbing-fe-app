import type { Prisma } from '../../../lib/generated/prisma';
import { z } from 'zod';
import { AppSettingOrderByWithRelationInputObjectSchema } from './objects/AppSettingOrderByWithRelationInput.schema';
import { AppSettingWhereInputObjectSchema } from './objects/AppSettingWhereInput.schema';
import { AppSettingWhereUniqueInputObjectSchema } from './objects/AppSettingWhereUniqueInput.schema';
import { AppSettingScalarFieldEnumSchema } from './enums/AppSettingScalarFieldEnum.schema'

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const AppSettingFindFirstSelectSchema: z.ZodType<Prisma.AppSettingSelect, Prisma.AppSettingSelect> = z.object({
    id: z.boolean().optional(),
    key: z.boolean().optional(),
    value: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional()
  }).strict();

export const AppSettingFindFirstSelectZodSchema = z.object({
    id: z.boolean().optional(),
    key: z.boolean().optional(),
    value: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional()
  }).strict();

export const AppSettingFindFirstSchema: z.ZodType<Prisma.AppSettingFindFirstArgs, Prisma.AppSettingFindFirstArgs> = z.object({ select: AppSettingFindFirstSelectSchema.optional(),  orderBy: z.union([AppSettingOrderByWithRelationInputObjectSchema, AppSettingOrderByWithRelationInputObjectSchema.array()]).optional(), where: AppSettingWhereInputObjectSchema.optional(), cursor: AppSettingWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([AppSettingScalarFieldEnumSchema, AppSettingScalarFieldEnumSchema.array()]).optional() }).strict();

export const AppSettingFindFirstZodSchema = z.object({ select: AppSettingFindFirstSelectSchema.optional(),  orderBy: z.union([AppSettingOrderByWithRelationInputObjectSchema, AppSettingOrderByWithRelationInputObjectSchema.array()]).optional(), where: AppSettingWhereInputObjectSchema.optional(), cursor: AppSettingWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([AppSettingScalarFieldEnumSchema, AppSettingScalarFieldEnumSchema.array()]).optional() }).strict();