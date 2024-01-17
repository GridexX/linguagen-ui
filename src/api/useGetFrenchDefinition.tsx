import { useState } from "react";
import { useQuery } from "react-query";
import { ZodError } from "zod";
import { frenchWikiSchema } from "./response";
import axios from "axios";
import { getFirstImageSrc, transformToDef } from "../utils";
import { FrenchDefinition } from "./types";

const API_URL = import.meta.env.VITE_API_URL;

export const useGetFrenchDefinition = () => {
  const [def, setDef] = useState<FrenchDefinition | null>(null);

  const [word, setWord] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  const fetchDictionaryDef = async () => {
    if (typeof word !== "string") throw new Error();
    const data = new FormData();
    data.append("motWikiComplement", word);

    const { data: defData } = await axios.request({
      method: "POST",
      url: `${API_URL}/app/api_wiki_complement.php`,
      data,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
    // Replace space and encoreURI
    let s = word.replaceAll(" ", "_");
    s = encodeURI(s);
    console.log("Word encoded: "+s)
    const src = await await getFirstImageSrc(s);
    const result = frenchWikiSchema.safeParse(defData);

    if (result.success) {
      if(result.data.error.length > 1) {
        setError(true)
      } else {
        setDef(transformToDef(result.data, src));
        setError(false)
      }
    } else {
      console.error(
        `No definition found for the word ${word}, error: ${result.error}`
      );
      throw new Error();
    }
  };

  const { isFetching, isError } = useQuery(
    word ?? "defWord",
    fetchDictionaryDef,

    {
      enabled: typeof word === "string",
      retry: false,
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
      },
    }
  );

  return {
    setWord,
    definition: def,
    isFetching,
    isError: isError || error,
  };
};
