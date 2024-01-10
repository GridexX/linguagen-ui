import axios from "axios";
import * as cheerio from "cheerio";
import { FrenchWikiSchema } from "./api/response";
import { FrenchDefinition, Meaning } from "./api/types";

export async function getFirstImageSrc(word: string): Promise<string | null> {
  const PROXY_URL = import.meta.env.VITE_PROXY_URL;

  try {
    const { data } = await axios.get(`${PROXY_URL}/wiki/${word}`);
    console.log(data);
    if (typeof data !== "string") {
      throw new Error();
    }
    const $ = cheerio.load(data);

    // Find the first img element with class mw-file-element
    const imgElement = $("img.mw-file-element").first();

    // Retrieve the src attribute
    const src = imgElement.attr("src") || null;
    // Retrieve the src attribute
    return src;
  } catch (error) {
    console.error("Error fetching or parsing the HTML:", error);
    return null;
  }
}

export function transformToDef(
  data: FrenchWikiSchema,
  imgUrl: string
): FrenchDefinition {
  const n = data.natureComp.length;
  const m = data.natureDefComp.length;

  const def: FrenchDefinition = { imgUrl: imgUrl, meanings: [] };

  if (n !== m) {
    console.error(
      `The size between natures ${n} and definitions ${m} is not the same`
    );
  }
  for (let i = 0; i < n; i++) {
    // const index = i + 1;
    const definitions = Object.values(data.natureDefComp[i]);
    const meaning: Meaning = {
      partOfSpeech: data.natureComp[i],
      definitions,
    };
    def.meanings.push(meaning);
  }
  return def;
}
