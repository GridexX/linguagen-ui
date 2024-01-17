import { Checkbox, Select, SelectItem } from "@nextui-org/react"
import {  useAtom } from "jotai"
import { Language, darkModeAtom, languageAtom, languages, showDefinitionOnLoad } from "./variables"
import { useTranslation } from "react-i18next";
import { SetStateAction } from "react";

export default function SettingsPage() {


  const [darkMode, setDarkMode] = useAtom(darkModeAtom)

  const [language, setLanguage] = useAtom(languageAtom);

  const [showDefinition, setShowDefinition] = useAtom(showDefinitionOnLoad);

  const { t } = useTranslation();

  const changeLanguage = (e: {target: {value: string}}) => {
    console.log(e.target.value)
    setLanguage( languages.find(l => l.key === e.target.value) as SetStateAction<Language> )
  }
  return (
    <div className="flex flex-col items center space-y-3">
      <h2 className="text-4xl">{t('settings.name')}</h2>
      <Checkbox isSelected={darkMode} onValueChange={setDarkMode}>{t('settings.darkMode')}</Checkbox>
      <Checkbox isSelected={showDefinition} onValueChange={setShowDefinition}>{t('settings.definition')}</Checkbox>
      <Select
        radius="sm"
        label={t('settings.language')}
        onChange={changeLanguage}
        defaultSelectedKeys={[language.key]}
        >
          {languages.map( language => (
            <SelectItem key={language.key} value={language.key}>{language.value}</SelectItem>
          ))}
        </Select>
    </div>
  )
}

//TODO Search singular function