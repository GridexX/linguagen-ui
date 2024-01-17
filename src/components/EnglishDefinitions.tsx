import { Accordion, AccordionItem } from "@nextui-org/react";
import { DictionnaryResponse } from "../api/types";

type Props = { dictionaryData: DictionnaryResponse };

const EnglishDefinitions = ({ dictionaryData }: Props) => {
  return (
    <>
      {dictionaryData.map((entry, index) => (
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
                {meaning.definitions.map((definition, definitionIndex) => (
                  <div className="pt-3" key={definitionIndex}>
                    <p className="text-default-900 text-lg w-3/4 font-semibold">
                      {`${definitionIndex + 1}. ${definition.definition}`}
                    </p>
                    {definition.synonyms && definition.synonyms.length > 0 && (
                      <div className="p-4">
                        <h3 className="text-xl">Synonyms</h3>
                        <p className="text-sm text-default-500 italic">
                          {definition.synonyms.join(", ")}
                        </p>
                      </div>
                    )}
                    {definition.antonyms && definition.antonyms.length > 0 && (
                      <div>
                        <h3>Antonyms</h3>
                        <p>Antonyms: {definition.antonyms.join(", ")}</p>
                      </div>
                    )}
                    {definition.example && (
                      <span>Example: {definition.example}</span>
                    )}
                  </div>
                ))}
              </ol>
            </AccordionItem>
          ))}
        </Accordion>
      ))}
    </>
  );
};

export default EnglishDefinitions;
