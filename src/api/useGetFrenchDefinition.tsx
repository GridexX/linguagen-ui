import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { ZodError } from "zod";
import { FrenchWikiSchema, frenchWikiSchema } from "./response";
import axios from "axios";
import { getFirstImageSrc } from "../utils";

const PROXY_URL = import.meta.env.VITE_PROXY_URL;

export const useGetFrenchDefinition = (word: string | null) => {
  const [def, setDef] = useState<FrenchWikiSchema | null>(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const f = async () => {
      let s = word.replaceAll(" ", "_");
      s = encodeURI(s);
      console.log("Encoded:" + s);
      setSearch(s);
      const src = "https:" + (await getFirstImageSrc("oiseau"));
      console.log("GetFirstIMGSRC " + src);
    };
    if (typeof word === "string") {
      console.log("UseEffect");
      f();
    }
  }, [search, setSearch, word]);

  const fetchDictionaryDef = async () => {
    const data = new FormData();

    data.append("motWikiComplement", search);

    const options = {
      method: "POST",
      url: `${PROXY_URL}/app/api_wiki_complement.php`,
      data,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };

    try {
      const { data } = await axios.request(options);
      return frenchWikiSchema.parse(data);
    } catch (error) {
      console.error(error);
    }
  };

  const { isFetching, isError } = useQuery(
    word ?? "dictionnaryData",
    fetchDictionaryDef,
    {
      enabled: typeof word === "string",
      onSuccess: (data) => setDef(data),
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
    definition: def,
    isFetching,
    isError,
  };
};
