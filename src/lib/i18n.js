import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es_LA from '../../public/locales/es_LA.json';
import en_US from '../../public/locales/en_US.json';

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: {
            en: {
                translation: en_US
            },
            es: {
                translation: es_LA
            }
        },
        lng: "es",
        fallbackLng: "es",

        interpolation: {
            escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
        }
    });

export default i18n;
