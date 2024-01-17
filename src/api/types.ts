import { z } from "zod";

export type Meaning = {
  partOfSpeech: string;
  definitions: string[];
};

export type FrenchDefinition = {
  imgUrl?: string;
  meanings: Meaning[];
};

export const translationSchema = z.object({ translation: z.string() });

// Define the expected response for a random word
export const randomSchema = z.object({
  word: z.string(),
});

export const dictionaryResponseSchema = z.array(
  z.object({
    word: z.string(),
    phonetics: z.array(
      z.object({
        audio: z.string().optional(),
        text: z.string().optional(),
        sourceUrl: z.string().optional(),
        license: z
          .object({
            name: z.string(),
            url: z.string(),
          })
          .optional(),
      })
    ),
    meanings: z.array(
      z.object({
        partOfSpeech: z.string(),
        definitions: z.array(
          z.object({
            definition: z.string(),
            synonyms: z.array(z.string()).optional(),
            antonyms: z.array(z.string()).optional(),
            example: z.string().optional(),
          })
        ),
        synonyms: z.array(z.string()).optional(),
        antonyms: z.array(z.string()).optional(),
      })
    ),
    license: z
      .object({
        name: z.string(),
        url: z.string(),
      })
      .optional(),
    sourceUrls: z.array(z.string()).optional(),
  })
);

export type DictionnaryResponse = z.infer<typeof dictionaryResponseSchema>;
