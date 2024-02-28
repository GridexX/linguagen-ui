import { z } from "zod";

const meaning = z.object({
  partOfSpeech: z.string(),
  definitions: z.array(z.string()),
});

export type Meaning = z.infer<typeof meaning>;

export const frenchDefinitionSchema = z.object({
  translation: z.string(),
  word: z.string(),
  definitions: z.array(meaning),
  pluralDetected: z.boolean(),
  defNotFound: z.boolean(),
  imageUrl: z.string(),
});

export type FrenchDefinitionSchema = z.infer<typeof frenchDefinitionSchema>;

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
