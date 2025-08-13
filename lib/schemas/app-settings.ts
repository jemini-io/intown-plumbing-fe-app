import { z } from "zod";

export const AppSettingCreateSchema = z.object({
  key: z.string().min(1),
  // accept JSON-like values from forms or programmatic calls
  value: z.union([z.string().transform(s => JSON.parse(s)), z.any()]),
});

export const AppSettingUpdateSchema = z.object({
  id: z.string().min(1),
  value: z.union([z.string().transform(s => JSON.parse(s)), z.any()]),
});
