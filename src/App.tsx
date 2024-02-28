// App.tsx
import React, { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { Button, Spinner, } from "@nextui-org/react";
import { useAtom } from "jotai";
import { languageAtom } from "./variables";
import { useTranslation } from "react-i18next";
import { FrenchDefinitionSchema, frenchDefinitionSchema } from "./api/types";
import { ZodError } from "zod";
import FrenchDefinitions from "./components/FrenchDefinitions";

const API_URL = import.meta.env.VITE_API_URL;

// type RandomResponse = z.infer<typeof randomSchema>;
// type TranslationResponse = z.infer<typeof translationSchema>;
// Main App component
const App: React.FC = () => {
  // State to hold translation data
  const [frenchDefinition, setFrenchDefinition] = useState<FrenchDefinitionSchema>({
    definitions: [],
    imageUrl: "",
    word: "",
    translation: "",
    defNotFound: false,
    pluralDetected: false,
  });

  const [failed, setFailed] = useState(false);

  const [language] = useAtom(languageAtom);

  const { t } = useTranslation();


  const getFrenchDefinition = async () => {
    setFailed(false);
    try {
      // Add a timeout of 10 seconds to the request
      const {data} = await axios.post<FrenchDefinitionSchema>(`${API_URL}/french`, {
        timeout: 10000,
      });
      return frenchDefinitionSchema.parse(data);
    } catch (error) {
      throw new Error(`Error fetching french definition ${error}`);
    }
  };

  // Fetch the french definition with a useQuery hook
  const { isFetching: isFrenchFetching, refetch } = useQuery(
    ["frenchDefinition", frenchDefinition.word],
    getFrenchDefinition,
    {
      enabled: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: 960000,
      refetchOnWindowFocus: false,
      retryOnMount: false,
      onError: (error: unknown) => {
        if (error instanceof ZodError) {
          console.error("Validation error:", error.errors);
        } else {
          console.error("An error occurred while fetching data:", error);
        }
        setFailed(true);
      },
      onSuccess: (data) => {
        setFrenchDefinition(data);
      },
    }
  );

  return (
    <div>
      {failed && <p style={{ color: "red" }}>{t("error_fetching")}</p>}
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col max-w-[400px] items-start gap-4">
          {isFrenchFetching && (
            <div className="flex flex-row items-center gap-3">
              <Spinner color="secondary" />
              <small>Récupération de la traduction...</small>
            </div>
          )}
        </div>
        {!isFrenchFetching  && frenchDefinition.word.length < 1 && (
          <Button
            color="primary"
            disabled={isFrenchFetching || failed}
            onClick={() => refetch()}
          >
            {t("app.generate")}
          </Button>
        )}
      </div>
      <div className="flex flex-col items-center justify-start space-y-4 px-2">
        <>
          {!isFrenchFetching && language.key === "fr" && frenchDefinition.word.length > 1 && (
            <FrenchDefinitions frenchDefinition={frenchDefinition} />
          )}
          {!failed && frenchDefinition.word.length > 1 &&(
            <Button
              color="default"
              size="sm"
              disabled={isFrenchFetching}
              onClick={() => refetch()}
            >
              {t("app.pick_other_word")}
            </Button>
          )}
        </>
      </div>
    </div>
  );
};

export default App;
