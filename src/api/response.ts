import { z } from "zod";

export const frenchWikiSchema = z.object({
  direct_link_comp: z.string(),
  motWikiComplement: z.string(),
  natureComp: z.array(z.string()),
  genreComp: z.array(z.union([z.string(), z.array(z.string())])),
  natureDefComp: z.array(z.array(z.record(z.string().min(1), z.string()))),
  error: z.string(),
});

export type FrenchWikiSchema = z.infer<typeof frenchWikiSchema>;
