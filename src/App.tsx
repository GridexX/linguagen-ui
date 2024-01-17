// App.tsx
import React, { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import {  ZodError } from "zod";
import {
  Button,
  Code,
  Progress,
  Spinner,
  User,
} from "@nextui-org/react";
import { useAtom } from "jotai";
import { languageAtom, showDefinitionOnLoad } from "./variables";
import { useGetFrenchDefinition } from "./api/useGetFrenchDefinition";
import {
  DictionnaryResponse,
  dictionaryResponseSchema,
  randomSchema,
  translationSchema,
} from "./api/types";
import { useTranslation } from "react-i18next";
import EnglishDefinitions from "./components/EnglishDefinitions";
import FrenchDefinitions from "./components/FrenchDefinitions";
import { singularizeInFrench } from "./utils";

const API_URL = import.meta.env.VITE_API_URL;
const WIKI_URL = import.meta.env.VITE_WIKI_URL;

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

  // Translate the word for the translation
  const { isFetching: isTranslationFetching } = useQuery(
    word ?? "fetchTranslation",
    async () => {
      const { data } = await axios.post(`${API_URL}/translate`, { text: word });
      return translationSchema.parse(data);
    },
    {
      enabled: language.key !== "en" && word !== null,
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: 960000,
      refetchOnWindowFocus: false,
      retryOnMount: false,
      onSuccess(data) {
        const { translation } = data;
        const translationSingular = singularizeInFrench(translation);
        setTranslation(translationSingular);
        setSearch(translationSingular);
      },
      onError: (error: unknown) => {
        if (error instanceof ZodError) {
          console.error("Validation error:", error.errors);
        } else {
          console.error("An error occurred while fetching translation:", error);
        }
      },
    }
  );

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

        // TODO Use a singular package Try the word without a `s` for singular
        if (word && word[word?.length - 1] === "s") {
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

  // Fetch a random word first
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

  const {
    isFetching: isLoading,
    refetch: reload,
    isError,
  } = useQuery(word ?? "dictionnaryData", fetchDictionaryData, {
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: 960000,
    refetchOnWindowFocus: false,
    retryOnMount: false,
    enabled: showDefinition && language.key === "en",
    onSuccess: (data) => setDictionaryData(data),
    onError: (error: unknown) => {
      if (error instanceof ZodError) {
        console.error("Validation error:", error.errors);
      } else {
        console.error("An error occurred while fetching data:", error);
      }
    },
  });

  const { t } = useTranslation();

  const progressValue = () => {
    if (isFetching) return 25;
    else if (isTranslationFetching) return 50;
    else if (isLoading || isDefFetching) return 75;
    else return 100;
  };

  const {
    setWord: setSearch,
    definition,
    isError: isDefError,
    isFetching: isDefFetching,
  } = useGetFrenchDefinition();

  return (
    <div>
      {failed && <p style={{ color: "red" }}>{t("error_fetching")}</p>}
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col max-w-[400px] items-start gap-4">
          {isFetching && (
            <div className="flex flex-row items-center gap-3">
              <Spinner />
              <small>Récupération d'un mot aléatoire...</small>
            </div>
          )}
          {isTranslationFetching && (
            <div className="flex flex-row items-center gap-3">
              <Spinner color="secondary" />
              <small>Récupération de la traduction...</small>
            </div>
          )}
          {isLoading ||
            (isDefFetching && (
              <div className="flex flex-row items-center gap-3">
                <Spinner color="default" />
                <small>Récupération de la définition...</small>
              </div>
            ))}
          {(isFetching ||
          isLoading ||
          isTranslationFetching ||
          isDefFetching) && <Progress value={progressValue()} className="max-w-md" />}
        </div>
        {/* {(isFetching ||
          isLoading ||
          isTranslationFetching ||
          isDefFetching) && (
          <>
            <LoadingCard />
            
          </>
        )} */}
        {!isFetching && !word && (
          <Button
            color="primary"
            disabled={isFetching || failed}
            onClick={() => refetch()}
          >
            {t("app.generate")}
          </Button>
        )}
      </div>
      {definition && language.key === "en" && (
        <User
          avatarProps={{
            radius: "lg",
            src: definition.imgUrl,
            showFallback: true,
          }}
          name={translation}
        />
      )}
      <div className="flex flex-col items-center justify-start space-y-4 px-2">
        {word && !isFetching && (
          <>
            {language.key === "en" && <Code size="lg">{word}</Code>}
            {dictionaryData.length < 1 && !isError && !isLoading && !isDefFetching && (
              <Button color="secondary" size="sm" onClick={() => reload()}>
                {t("app.see_definition")}
              </Button>
            )}
            {isError && language.key === "en" && (
              <div>
                <small style={{ color: "grey" }}>
                  <i>{t("app.definition_not_found")}.</i>
                </small>
                <br />
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    `Definition ${word}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("app.see_definition")}
                </a>
              </div>
            )}

            {!isLoading && language.key === "en" && (
              <EnglishDefinitions dictionaryData={dictionaryData} />
            )}
            {!isDefFetching &&
              !isTranslationFetching &&
              !isFetching &&
              language.key === "fr" &&
              translation && (
                <FrenchDefinitions
                  definitions={definition?.meanings}
                  imgUrl={definition?.imgUrl}
                  wordEnglish={word}
                  word={translation ?? ""}
                  defNotFound={isDefError}
                />
              )}
            {word &&
              !failed &&
              !isDefFetching &&
              !isTranslationFetching &&
              !isFetching && (
                <Button
                  color="default"
                  size="sm"
                  disabled={isFetching}
                  onClick={() => refetch()}
                >
                  {t("app.pick_other_word")}
                </Button>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
