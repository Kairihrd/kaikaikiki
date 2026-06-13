// ============================================================================
// 言語状態をアプリ全体で共有する Context。
// ----------------------------------------------------------------------------
// useLanguage() で { lang, setLang, t } を取得できる。
// 選択言語は AsyncStorage に保存し、次回起動時に復元する。
// ============================================================================
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_LANG,
  translate,
  type LangCode,
} from "@/lib/i18n";

const STORAGE_KEY = "senseed:lang";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG);

  // 起動時に保存済みの言語を復元(無ければ日本語のまま)。
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setLangState(saved as LangCode);
      } catch {
        // 読めなければ既定(日本語)のまま
      }
    })();
  }, []);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    // 保存に失敗しても画面表示は切り替わる(保存はベストエフォート)。
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: (key: string) => translate(lang, key) }),
    [lang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Provider 外で呼ばれた場合のフォールバック(既定=日本語)。
    return { lang: DEFAULT_LANG, setLang: () => {}, t: (key) => translate(DEFAULT_LANG, key) };
  }
  return ctx;
}
