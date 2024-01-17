import { useEffect, useState } from "react";
import App from "./App";
import { ArrowBigLeft, Settings } from "lucide-react";
import SettingsPage from "./Settings";
import { useAtom } from "jotai";
import { darkModeAtom } from "./variables";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "@nextui-org/react";

const routes = {
  App: "App",
  Settings: "Settings",
} as const;

type Route = (typeof routes)[keyof typeof routes];

export default function Router() {
  const [route, setRoute] = useState<Route>("App");

  const [darkModeString, setDarkModeString] = useState("");

  const [darkMode] = useAtom(darkModeAtom);

  useEffect(() => {
    function switchDarkMode() {
      if (darkMode) {
        setDarkModeString("dark text-foreground bg-background");
      } else {
        setDarkModeString("");
      }
    }
    switchDarkMode();
  }, [darkMode]);

  const { t } = useTranslation();

  return (
    <main className={darkModeString}>
      {route !== "Settings" && (
        <Settings
          onClick={() => setRoute("Settings")}
          className="text-default-500 absolute hover:cursor-pointer hover:text-default-900 hover:transition-opacity top-3 right-3 text-4xl"
          size={30}
        />
      )}
      {route === "Settings" && (
        <ArrowBigLeft
          onClick={() => setRoute("App")}
          className="text-default-500 absolute hover:cursor-pointer hover:text-default-900 hover:transition-opacity top-3 left-3 text-4xl"
          size={30}
        />
      )}

      <div className="w-full min-h-screen max-h-min flex flex-col justify-around items-center">
        <div className="flex flex-col items-center">
          <Link href='/'>
          <img src="logo.png" className="w-24" />
          </Link>
          <h1 className="text-4xl mt-3 font-bold font-bezziaSemiBold">
            <span className="font-bold" style={{ color: "#5FB0EF" }}>
              Lingua
            </span>
            Gen
          </h1>
          <p className="italic text-md text-default-500">
            {t("common.description")}
          </p>
        </div>

        {route === "App" && <App />}
        {route === "Settings" && <SettingsPage />}
        <footer className="italic text-md text-default-500">
          <Trans i18nKey="common.footer">
            Made by
            <a
              className="text-primary-400 italic hover:underline"
              href="github.com/GridexX"
              target="_blank"
              rel="noopener noreferrer"
            >
              GridexX
            </a>{" "}
            during Christmas Holidays
          </Trans>
        </footer>
      </div>
    </main>
  );
}
