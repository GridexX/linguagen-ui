export type Meaning = {
  partOfSpeech: string;
  definitions: string[];
}

export type FrenchDefinition = {
  imgUrl: string;
  meanings: Meaning[];
};
