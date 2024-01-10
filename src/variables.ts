import { atomWithStorage } from "jotai/utils";

type KeyLanguage = "en" | "fr";

export type Language = {
  value: string;
  key: KeyLanguage;
};

export const languages: Language[] = [
  { value: "français", key: "fr" },
  { value: "english", key: "en" },
];

export const darkModeAtom = atomWithStorage("darkMode", false);

export const languageAtom = atomWithStorage("language", languages[0]);

export const showDefinitionOnLoad = atomWithStorage("definition", true);
