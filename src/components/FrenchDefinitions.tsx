import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Link,
  Tooltip,
  User,
} from "@nextui-org/react";
import { Meaning } from "../api/types";
import { useTranslation } from "react-i18next";
import { addSpacesAroundHtmlCodes } from "../utils";

type Props = {
  definitions?: Meaning[];
  imgUrl?: string;
  word: string;
  wordEnglish: string;
  defNotFound: boolean;
};

const FrenchDefinitions = ({
  definitions,
  imgUrl,
  word,
  wordEnglish,
  defNotFound,
}: Props) => {
  const { t } = useTranslation();

  const returnStrongPar = (def: string) => {
    if(!def.startsWith("(")) return <>{def}</>
    // SPlit for the parenthesis and filter empty elements
    const wordsSplitted = def.split("(").flatMap((word) => word.split(")"))
      .filter((word) => word.length > 0);
    // Entry surrounded by parenthesis should be placed in strong balisis
    return wordsSplitted.map((entries, index) =>
      index < wordsSplitted.length - 1 ? <strong>{entries}</strong> : <>{entries}</>
    );
  };

  return (
    <Card className="max-w-[600px]">
      <CardHeader className="flex gap-3 text-xl">
        <Tooltip
          content={wordEnglish}
          color="default"
          delay={1000}
          closeDelay={500}
        >
          <User
            className="text-xl"
            name={word}
            avatarProps={{
              isBordered: true,
              radius: "lg",
              size: "lg",
              color: "default",
              showFallback: true,
              src: imgUrl,
              title: word,
            }}
          />
        </Tooltip>
      </CardHeader>
      <Divider />
      <CardBody>
        {!defNotFound &&
          definitions &&
          definitions.map((definition, index) => (
            <>
              <div key={index} className="my-3">
                <h4 className="first-letter:uppercase text-md">
                  {definition.partOfSpeech}
                </h4>
                <ul>
                  {definition.definitions.map((def, i) => (
                    <li key={i} className="my-1 px-2 text-sm">
                      &#183; {returnStrongPar(addSpacesAroundHtmlCodes(def))}
                    </li>
                  ))}
                </ul>
              </div>
              {index < definitions.length - 1 && (
                <Divider className="h-divider" />
              )}
            </>
          ))}
        {(!definitions || defNotFound) && (
          <p className="small text-danger-500 italic">
            {t("app.definition_not_found")}
          </p>
        )}
      </CardBody>
      <Divider />
      <CardFooter>
        {defNotFound && (
          <Link
            isExternal
            showAnchorIcon
            href={`https://www.google.com/search?q=${encodeURIComponent(
              `Definition ${word}`
            )}`}
          >
            {t("app.see_definition")}
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default FrenchDefinitions;
