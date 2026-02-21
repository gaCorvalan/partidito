import { computed } from "vue"
import { en } from "~/i18n/locales/en"
import { es, type TranslationKey } from "~/i18n/locales/es"

type Locale = "es" | "en"
type TranslationParams = Record<string, string | number>

const DEFAULT_LOCALE: Locale = "es"
const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  es,
  en
}

const interpolate = (template: string, params?: TranslationParams) => {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key]
    return value === undefined ? `{${key}}` : String(value)
  })
}

export const useI18n = () => {
  const locale = useState<Locale>("app-locale", () => DEFAULT_LOCALE)

  const t = (key: TranslationKey, params?: TranslationParams) => {
    const activeDictionary = dictionaries[locale.value] ?? dictionaries[DEFAULT_LOCALE]
    const fallback = dictionaries[DEFAULT_LOCALE][key]
    const value = activeDictionary[key] ?? fallback ?? key
    return interpolate(value, params)
  }

  const setLocale = (nextLocale: Locale) => {
    locale.value = nextLocale
  }

  return {
    locale: computed(() => locale.value),
    t,
    setLocale
  }
}
