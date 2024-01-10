// App.tsx
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { z, ZodError } from "zod";
import {
  Accordion,
  AccordionItem,
  Button,
  Code,
  Spinner,
} from "@nextui-org/react";
import { useAtom } from "jotai";
import { Language } from "./Settings";
import { languageAtom, showDefinitionOnLoad } from "./variables";
import { useGetFrenchDefinition } from "./api/useGetFrenchDefinition";

const API_URL = import.meta.env.VITE_API_URL;
const WIKI_URL = import.meta.env.VITE_WIKI_URL;

const translationSchema = z.object({ translation: z.string() });

// Define the expected response for a random word
const randomSchema = z.object({
  word: z.string(),
});

const dictionaryResponseSchema = z.array(
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

type DictionnaryResponse = z.infer<typeof dictionaryResponseSchema>;

// type RandomResponse = z.infer<typeof randomSchema>;
// type TranslationResponse = z.infer<typeof translationSchema>;
// Main App component
const App: React.FC = () => {
  // State to hold translation data
  const [translation, setTranslation] = useState<string | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [dictionaryData, setDictionaryData] = useState<DictionnaryResponse>([]);

  // Function to fetch a random word and translation
  const fetchRandomWord = async (): Promise<string> => {
    const { data } = await axios.get(`${API_URL}/random`);
    // Validate the response format
    const { word } = randomSchema.parse(data);
    // Reset the dictionnary data
    setDictionaryData([]);
    console.log(word);
    return word;
  };

  const [language] = useAtom(languageAtom);

  const [showDefinition] = useAtom(showDefinitionOnLoad);

  useEffect(() => {
    const fetchTranslation = async () => {
      const { data } = await axios.post(`${API_URL}/translate`, { text: word });
      const { translation: trans } = translationSchema.parse(data);
      console.log(`translation: ${trans}`);
      setTranslation(trans);
    };
    if (language.key !== "en" && word !== null) {
      fetchTranslation();
    }
  }, [language, word]);
  // Function to fetch dictionary data
  const fetchDictionaryData = async () => {
    try {
      const { data } = await axios.get(`${WIKI_URL}/${word}`);
      // Validate the response format
      dictionaryResponseSchema.parse(data);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Handle 404 error (definition not found)
        console.warn(`Definition not found for the word "${word}".`);
        // Try the word without a `s` for singular
        if(word[word?.length-1] === "s") {
          const { data } = await axios.get(`${WIKI_URL}/${word}`);
          // Validate the response format
          dictionaryResponseSchema.parse(data);
          return data;
        }
        throw error;
      } else {
        throw error; // Rethrow other errors
      }
    }
  };

  // Use react-query to handle data fetching
  const {
    refetch,
    isFetching,
    isError: failed,
  } = useQuery("randomWord", fetchRandomWord, {
    enabled: false,
    onSuccess: (data) => setWord(data),
    onError: (error: unknown) => {
      if (error instanceof ZodError) {
        console.error("Validation error:", error.errors);
      } else {
        console.error("An error occurred while fetching data:", error);
      }
    },
  });

  console.log("word/trans "+word+" "+translation)

  const {
    isFetching: isLoading,
    refetch: reload,
    isError,
  } = useQuery(word??"dictionnaryData", fetchDictionaryData, {
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: 960000,
    refetchOnWindowFocus: false,
    retryOnMount: false,
    enabled: showDefinition,
    onSuccess: (data) => setDictionaryData(data),
    onError: (error: unknown) => {
      if (error instanceof ZodError) {
        console.error("Validation error:", error.errors);
      } else {
        console.error("An error occurred while fetching data:", error);
      }
    },
  });

  const [frenchDef, setFrenchDef] = useState();

  const all = useGetFrenchDefinition(translation);

  // console.log(all)

  useEffect(() => {


    if(language.key === "fr" && translation) {
      console.log("Hey")
    }

  },[frenchDef, language, translation])

  return (
    <div>
      {failed && (
        <p style={{ color: "red" }}>
          There is an error fetching words, try again later
        </p>
      )}
      {!isFetching && !word && (
        <Button
          color="primary"
          disabled={isFetching || failed}
          onClick={() => refetch()}
        >
          Generate Word
        </Button>
      )}
      {isFetching && <Spinner></Spinner>}
      {word && !isFetching && (
        <div className="flex flex-col items-center justify-start space-y-4">
          <Code size="lg">{language.key === "en" ? word : translation}</Code>
          {dictionaryData.length < 1 && !isError && !isLoading && (
            <Button color="secondary" size="sm" onClick={() => reload()}>See definition</Button>
          )}
          {isError && (
            <div>
              <small style={{ color: "grey" }}>
                <i>Definition not found.</i>
              </small>
              <br />
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  `Definition ${word}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Search on Google
              </a>
            </div>
          )}

          {!isLoading &&
            dictionaryData.map((entry, index) => (
              <Accordion
                key={index}
                selectionMode="multiple"
                variant="shadow"
                defaultExpandedKeys={entry.meanings.map((_, index) =>
                  index.toString()
                )}
              >
                {entry.meanings.map((meaning, meaningIndex) => (
                  <AccordionItem
                    key={meaningIndex}
                    title={`${meaning.partOfSpeech[0].toUpperCase()}${meaning.partOfSpeech.slice(
                      1
                    )}`}
                  >
                    <ol>
                      {meaning.definitions.map(
                        (definition, definitionIndex) => (
                          <div className="pt-3" key={definitionIndex}>
                            <p className="text-default-900 text-lg w-3/4 font-semibold">
                              {`${definitionIndex + 1}. ${
                                definition.definition
                              }`}
                            </p>
                            {definition.synonyms &&
                              definition.synonyms.length > 0 && (
                                <div className="p-4">
                                  <h3 className="text-xl">Synonyms</h3>
                                  <p className="text-sm text-default-500 italic">
                                    {definition.synonyms.join(", ")}
                                  </p>
                                </div>
                              )}
                            {definition.antonyms &&
                              definition.antonyms.length > 0 && (
                                <div>
                                  <h3>Antonyms</h3>
                                  <p>
                                    Antonyms: {definition.antonyms.join(", ")}
                                  </p>
                                </div>
                              )}
                            {definition.example && (
                              <span>Example: {definition.example}</span>
                            )}
                          </div>
                        )
                      )}
                    </ol>
                  </AccordionItem>
                ))}
              </Accordion>
            ))}
          {word && !failed && !isFetching && (
            <Button
              color="default"
              size="sm"
              disabled={isFetching}
              onClick={() => refetch()}
            >
              Pick Another Word
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
