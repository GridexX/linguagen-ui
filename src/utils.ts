import axios from "axios";
import * as cheerio from "cheerio";
import { FrenchWikiSchema } from "./api/response";
import { FrenchDefinition, Meaning } from "./api/types";

const API_URL = import.meta.env.VITE_API_URL;

export async function getFirstImageSrc(
  word: string
): Promise<string | undefined> {
  try {
    const { data } = await axios.get(`${API_URL}/wiki/${word}`);
    console.log(data);
    if (typeof data !== "string") {
      throw new Error();
    }
    const $ = cheerio.load(data);

    // Find the first img element with class mw-file-element
    // const aElem = $("a.mw-file-secription").first();
    const imgElement = $("a.mw-file-description img.mw-file-element").first();

    // Retrieve the src attribute
    const src = imgElement.attr("src") || undefined;
    if (src) return `https:${src}`;
  } catch (error) {
    console.error("Error fetching or parsing the HTML:", error);
    return undefined;
  }
}

export function transformToDef(
  data: FrenchWikiSchema,
  imgUrl?: string
): FrenchDefinition {
  const n = data.natureComp.length;
  const m = data.natureDefComp.length;

  const def: FrenchDefinition = { imgUrl, meanings: [] };

  if (n !== m) {
    console.error(
      `The size between natures ${n} and definitions ${m} is not the same`
    );
  }
  for (let i = 0; i < n; i++) {
    const definitions = Object.values(data.natureDefComp[i][0]) as string[];
    // const definitions: string[] = [];
    // if (typeof defs === "object") {
    // }

    const meaning: Meaning = {
      partOfSpeech: data.natureComp[i],
      definitions,
    };
    def.meanings.push(meaning);
  }
  return def;
}

// Make a type for this one

// This function singularize each words
export function singularizeInFrench(sentence: string) {
  const words = sentence.split(" ");
  const singulars: string[] = [];
  words.forEach((word) => {
    const last_letter = word[word.length - 1],
      last_3_letters = word.slice(-3);

    if (last_3_letters === "aux") {
      singulars.push(word.substring(0, word.length - 3) + "al");
    } else if (last_3_letters === "eux") {
      singulars.push(word.substring(0, word.length - 3) + "eu");
    } else if (last_letter === "x" || last_letter === "s") {
      singulars.push(word.substring(0, word.length - 1));
    } else {
      singulars.push(word);
    }
  });
  return singulars.join(" ");
}

export function addSpacesAroundHtmlCodes(sentence: string): string {
  // Regular expression to match HTML numeric codes without leading or trailing whitespaces
  const regex = /(&\s*#\s*(\d+);\s)/;

  // Replace matches with a space before and after
  const result = sentence.replace(regex, " $& ");

  return result;
}
