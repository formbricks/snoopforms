import {
  TLegacySurveyChoice,
  TLegacySurveyQuestion,
  TLegacySurveyThankYouCard,
  TLegacySurveyWelcomeCard,
} from "@formbricks/types/LegacySurvey";
import { TLanguage } from "@formbricks/types/product";
import {
  TI18nString,
  TSurvey,
  TSurveyCTAQuestion,
  TSurveyChoice,
  TSurveyConsentQuestion,
  TSurveyLanguage,
  TSurveyMultipleChoiceQuestion,
  TSurveyNPSQuestion,
  TSurveyOpenTextQuestion,
  TSurveyQuestion,
  TSurveyRatingQuestion,
  TSurveyThankYouCard,
  TSurveyWelcomeCard,
  ZSurveyCTAQuestion,
  ZSurveyCalQuestion,
  ZSurveyConsentQuestion,
  ZSurveyFileUploadQuestion,
  ZSurveyMultipleChoiceQuestion,
  ZSurveyNPSQuestion,
  ZSurveyOpenTextQuestion,
  ZSurveyPictureSelectionQuestion,
  ZSurveyQuestion,
  ZSurveyRatingQuestion,
  ZSurveyThankYouCard,
  ZSurveyWelcomeCard,
} from "@formbricks/types/surveys/types";
import { structuredClone } from "../pollyfills/structuredClone";

// Helper function to create an i18nString from a regular string.
export const createI18nString = (
  text: string | TI18nString,
  languages: string[],
  targetLanguageCode?: string
): TI18nString => {
  if (typeof text === "object") {
    // It's already an i18n object, so clone it
    const i18nString: TI18nString = structuredClone(text);
    // Add new language keys with empty strings if they don't exist
    languages?.forEach((language) => {
      if (!(language in i18nString)) {
        i18nString[language] = "";
      }
    });

    // Remove language keys that are not in the languages array
    Object.keys(i18nString).forEach((key) => {
      if (key !== (targetLanguageCode ?? "default") && languages && !languages.includes(key)) {
        delete i18nString[key];
      }
    });

    return i18nString;
  } else {
    // It's a regular string, so create a new i18n object
    const i18nString: any = {
      [targetLanguageCode ?? "default"]: text as string, // Type assertion to assure TypeScript `text` is a string
    };

    // Initialize all provided languages with empty strings
    languages?.forEach((language) => {
      if (language !== (targetLanguageCode ?? "default")) {
        i18nString[language] = "";
      }
    });

    return i18nString;
  }
};

// Type guard to check if an object is an I18nString
export const isI18nObject = (obj: any): obj is TI18nString => {
  return typeof obj === "object" && obj !== null && Object.keys(obj).includes("default");
};

export const isLabelValidForAllLanguages = (label: TI18nString, languages: string[]): boolean => {
  return languages.every((language) => label[language] && label[language].trim() !== "");
};

export const getLocalizedValue = (value: TI18nString | undefined, languageId: string): string => {
  if (!value) {
    return "";
  }
  if (isI18nObject(value)) {
    if (value[languageId]) {
      return value[languageId];
    }
    return "";
  }
  return "";
};

export const extractLanguageCodes = (surveyLanguages: TSurveyLanguage[]): string[] => {
  if (!surveyLanguages) return [];
  return surveyLanguages.map((surveyLanguage) =>
    surveyLanguage.default ? "default" : surveyLanguage.language.code
  );
};

export const getEnabledLanguages = (surveyLanguages: TSurveyLanguage[]) => {
  return surveyLanguages.filter((surveyLanguage) => surveyLanguage.enabled);
};

const translateChoice = (choice: TSurveyChoice | TLegacySurveyChoice, languages: string[]): TSurveyChoice => {
  if (typeof choice.label !== "undefined") {
    return {
      ...choice,
      label: createI18nString(choice.label, languages),
    };
  } else {
    return {
      ...choice,
      label: choice.label,
    };
  }
};

// LGEGACY
// Helper function to maintain backwards compatibility for old survey objects before Multi Language
export const translateWelcomeCard = (
  welcomeCard: TSurveyWelcomeCard | TLegacySurveyWelcomeCard,
  languages: string[]
): TSurveyWelcomeCard => {
  const clonedWelcomeCard = structuredClone(welcomeCard);
  if (typeof welcomeCard.headline !== "undefined") {
    clonedWelcomeCard.headline = createI18nString(welcomeCard.headline ?? "", languages);
  }
  if (typeof welcomeCard.html !== "undefined") {
    clonedWelcomeCard.html = createI18nString(welcomeCard.html ?? "", languages);
  }
  if (typeof welcomeCard.buttonLabel !== "undefined") {
    clonedWelcomeCard.buttonLabel = createI18nString(clonedWelcomeCard.buttonLabel ?? "", languages);
  }

  return ZSurveyWelcomeCard.parse(clonedWelcomeCard);
};

// LGEGACY
// Helper function to maintain backwards compatibility for old survey objects before Multi Language
export const translateThankYouCard = (
  thankYouCard: TSurveyThankYouCard | TLegacySurveyThankYouCard,
  languages: string[]
): TSurveyThankYouCard => {
  const clonedThankYouCard = structuredClone(thankYouCard);

  if (typeof thankYouCard.headline !== "undefined") {
    clonedThankYouCard.headline = createI18nString(thankYouCard.headline ?? "", languages);
  }

  if (typeof thankYouCard.subheader !== "undefined") {
    clonedThankYouCard.subheader = createI18nString(thankYouCard.subheader ?? "", languages);
  }

  if (typeof clonedThankYouCard.buttonLabel !== "undefined") {
    clonedThankYouCard.buttonLabel = createI18nString(thankYouCard.buttonLabel ?? "", languages);
  }
  return ZSurveyThankYouCard.parse(clonedThankYouCard);
};

// LGEGACY
// Helper function to maintain backwards compatibility for old survey objects before Multi Language
export const translateQuestion = (
  question: TLegacySurveyQuestion | TSurveyQuestion,
  languages: string[]
): TSurveyQuestion => {
  // Clone the question to avoid mutating the original
  const clonedQuestion = structuredClone(question);

  //common question properties
  if (typeof question.headline !== "undefined") {
    clonedQuestion.headline = createI18nString(question.headline ?? "", languages);
  }

  if (typeof question.subheader !== "undefined") {
    clonedQuestion.subheader = createI18nString(question.subheader ?? "", languages);
  }

  if (typeof question.buttonLabel !== "undefined") {
    clonedQuestion.buttonLabel = createI18nString(question.buttonLabel ?? "", languages);
  }

  if (typeof question.backButtonLabel !== "undefined") {
    clonedQuestion.backButtonLabel = createI18nString(question.backButtonLabel ?? "", languages);
  }

  switch (question.type) {
    case "openText":
      if (typeof question.placeholder !== "undefined") {
        (clonedQuestion as TSurveyOpenTextQuestion).placeholder = createI18nString(
          question.placeholder ?? "",
          languages
        );
      }
      return ZSurveyOpenTextQuestion.parse(clonedQuestion);

    case "multipleChoiceSingle":
    case "multipleChoiceMulti":
      (clonedQuestion as TSurveyMultipleChoiceQuestion).choices = question.choices.map((choice) => {
        return translateChoice(choice, languages);
      });
      if (typeof (clonedQuestion as TSurveyMultipleChoiceQuestion).otherOptionPlaceholder !== "undefined") {
        (clonedQuestion as TSurveyMultipleChoiceQuestion).otherOptionPlaceholder = createI18nString(
          question.otherOptionPlaceholder ?? "",
          languages
        );
      }
      return ZSurveyMultipleChoiceQuestion.parse(clonedQuestion);

    case "cta":
      if (typeof question.dismissButtonLabel !== "undefined") {
        (clonedQuestion as TSurveyCTAQuestion).dismissButtonLabel = createI18nString(
          question.dismissButtonLabel ?? "",
          languages
        );
      }
      if (typeof question.html !== "undefined") {
        (clonedQuestion as TSurveyCTAQuestion).html = createI18nString(question.html ?? "", languages);
      }
      return ZSurveyCTAQuestion.parse(clonedQuestion);

    case "consent":
      if (typeof question.html !== "undefined") {
        (clonedQuestion as TSurveyConsentQuestion).html = createI18nString(question.html ?? "", languages);
      }

      if (typeof question.label !== "undefined") {
        (clonedQuestion as TSurveyConsentQuestion).label = createI18nString(question.label ?? "", languages);
      }
      return ZSurveyConsentQuestion.parse(clonedQuestion);

    case "nps":
      if (typeof question.lowerLabel !== "undefined") {
        (clonedQuestion as TSurveyNPSQuestion).lowerLabel = createI18nString(
          question.lowerLabel ?? "",
          languages
        );
      }
      if (typeof question.upperLabel !== "undefined") {
        (clonedQuestion as TSurveyNPSQuestion).upperLabel = createI18nString(
          question.upperLabel ?? "",
          languages
        );
      }
      return ZSurveyNPSQuestion.parse(clonedQuestion);

    case "rating":
      if (typeof question.lowerLabel !== "undefined") {
        (clonedQuestion as TSurveyRatingQuestion).lowerLabel = createI18nString(
          question.lowerLabel ?? "",
          languages
        );
      }

      if (typeof question.upperLabel !== "undefined") {
        (clonedQuestion as TSurveyRatingQuestion).upperLabel = createI18nString(
          question.upperLabel ?? "",
          languages
        );
      }
      return ZSurveyRatingQuestion.parse(clonedQuestion);

    case "fileUpload":
      return ZSurveyFileUploadQuestion.parse(clonedQuestion);

    case "pictureSelection":
      return ZSurveyPictureSelectionQuestion.parse(clonedQuestion);

    case "cal":
      return ZSurveyCalQuestion.parse(clonedQuestion);

    default:
      return ZSurveyQuestion.parse(clonedQuestion);
  }
};

export const extractLanguageIds = (languages: TLanguage[]): string[] => {
  return languages.map((language) => language.code);
};

// LGEGACY
// Helper function to maintain backwards compatibility for old survey objects before Multi Language
export const translateSurvey = (
  survey: Pick<TSurvey, "questions" | "welcomeCard" | "thankYouCard">,
  languageCodes: string[]
): Pick<TSurvey, "questions" | "welcomeCard" | "thankYouCard"> => {
  const translatedQuestions = survey.questions.map((question) => {
    return translateQuestion(question, languageCodes);
  });
  const translatedWelcomeCard = translateWelcomeCard(survey.welcomeCard, languageCodes);
  const translatedThankYouCard = translateThankYouCard(survey.thankYouCard, languageCodes);
  const translatedSurvey = structuredClone(survey);
  return {
    ...translatedSurvey,
    questions: translatedQuestions,
    welcomeCard: translatedWelcomeCard,
    thankYouCard: translatedThankYouCard,
  };
};

export const getLanguageCode = (surveyLanguages: TSurveyLanguage[], languageCode: string | null) => {
  if (!surveyLanguages?.length || !languageCode) return "default";
  const language = surveyLanguages.find((surveyLanguage) => surveyLanguage.language.code === languageCode);
  return language?.default ? "default" : language?.language.code || "default";
};

export interface TIso639Language {
  alpha2: string;
  english: string;
}

export const iso639Languages = [
  {
    alpha2: "aa",
    english: "Afar",
  },
  {
    alpha2: "ab",
    english: "Abkhazian",
  },
  {
    alpha2: "ae",
    english: "Avestan",
  },
  {
    alpha2: "af",
    english: "Afrikaans",
  },
  {
    alpha2: "ak",
    english: "Akan",
  },
  {
    alpha2: "am",
    english: "Amharic",
  },
  {
    alpha2: "an",
    english: "Aragonese",
  },
  {
    alpha2: "ar",
    english: "Arabic",
  },
  {
    alpha2: "as",
    english: "Assamese",
  },
  {
    alpha2: "av",
    english: "Avaric",
  },
  {
    alpha2: "ay",
    english: "Aymara",
  },
  {
    alpha2: "az",
    english: "Azerbaijani",
  },
  {
    alpha2: "ba",
    english: "Bashkir",
  },
  {
    alpha2: "be",
    english: "Belarusian",
  },
  {
    alpha2: "bg",
    english: "Bulgarian",
  },
  {
    alpha2: "bh",
    english: "Bihari languages",
  },
  {
    alpha2: "bi",
    english: "Bislama",
  },
  {
    alpha2: "bm",
    english: "Bambara",
  },
  {
    alpha2: "bn",
    english: "Bengali",
  },
  {
    alpha2: "bo",
    english: "Tibetan",
  },
  {
    alpha2: "br",
    english: "Breton",
  },
  {
    alpha2: "bs",
    english: "Bosnian",
  },
  {
    alpha2: "ca",
    english: "Catalan; Valencian",
  },
  {
    alpha2: "ce",
    english: "Chechen",
  },
  {
    alpha2: "ch",
    english: "Chamorro",
  },
  {
    alpha2: "co",
    english: "Corsican",
  },
  {
    alpha2: "cr",
    english: "Cree",
  },
  {
    alpha2: "cs",
    english: "Czech",
  },
  {
    alpha2: "cu",
    english: "Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic",
  },
  {
    alpha2: "cv",
    english: "Chuvash",
  },
  {
    alpha2: "cy",
    english: "Welsh",
  },
  {
    alpha2: "da",
    english: "Danish",
  },
  {
    alpha2: "de",
    english: "German",
  },
  {
    alpha2: "dv",
    english: "Divehi; Dhivehi; Maldivian",
  },
  {
    alpha2: "dz",
    english: "Dzongkha",
  },
  {
    alpha2: "ee",
    english: "Ewe",
  },
  {
    alpha2: "el",
    english: "Greek, Modern (1453-)",
  },
  {
    alpha2: "en",
    english: "English",
  },
  {
    alpha2: "eo",
    english: "Esperanto",
  },
  {
    alpha2: "es",
    english: "Spanish; Castilian",
  },
  {
    alpha2: "et",
    english: "Estonian",
  },
  {
    alpha2: "eu",
    english: "Basque",
  },
  {
    alpha2: "fa",
    english: "Persian",
  },
  {
    alpha2: "ff",
    english: "Fulah",
  },
  {
    alpha2: "fi",
    english: "Finnish",
  },
  {
    alpha2: "fj",
    english: "Fijian",
  },
  {
    alpha2: "fo",
    english: "Faroese",
  },
  {
    alpha2: "fr",
    english: "French",
  },
  {
    alpha2: "fy",
    english: "Western Frisian",
  },
  {
    alpha2: "ga",
    english: "Irish",
  },
  {
    alpha2: "gd",
    english: "Gaelic; Scottish Gaelic",
  },
  {
    alpha2: "gl",
    english: "Galician",
  },
  {
    alpha2: "gn",
    english: "Guarani",
  },
  {
    alpha2: "gu",
    english: "Gujarati",
  },
  {
    alpha2: "gv",
    english: "Manx",
  },
  {
    alpha2: "ha",
    english: "Hausa",
  },
  {
    alpha2: "he",
    english: "Hebrew",
  },
  {
    alpha2: "hi",
    english: "Hindi",
  },
  {
    alpha2: "ho",
    english: "Hiri Motu",
  },
  {
    alpha2: "hr",
    english: "Croatian",
  },
  {
    alpha2: "ht",
    english: "Haitian; Haitian Creole",
  },
  {
    alpha2: "hu",
    english: "Hungarian",
  },
  {
    alpha2: "hy",
    english: "Armenian",
  },
  {
    alpha2: "hz",
    english: "Herero",
  },
  {
    alpha2: "ia",
    english: "Interlingua (International Auxiliary Language Association)",
  },
  {
    alpha2: "id",
    english: "Indonesian",
  },
  {
    alpha2: "ie",
    english: "Interlingue; Occidental",
  },
  {
    alpha2: "ig",
    english: "Igbo",
  },
  {
    alpha2: "ii",
    english: "Sichuan Yi; Nuosu",
  },
  {
    alpha2: "ik",
    english: "Inupiaq",
  },
  {
    alpha2: "io",
    english: "Ido",
  },
  {
    alpha2: "is",
    english: "Icelandic",
  },
  {
    alpha2: "it",
    english: "Italian",
  },
  {
    alpha2: "iu",
    english: "Inuktitut",
  },
  {
    alpha2: "ja",
    english: "Japanese",
  },
  {
    alpha2: "jv",
    english: "Javanese",
  },
  {
    alpha2: "ka",
    english: "Georgian",
  },
  {
    alpha2: "kg",
    english: "Kongo",
  },
  {
    alpha2: "ki",
    english: "Kikuyu; Gikuyu",
  },
  {
    alpha2: "kj",
    english: "Kuanyama; Kwanyama",
  },
  {
    alpha2: "kk",
    english: "Kazakh",
  },
  {
    alpha2: "kl",
    english: "Kalaallisut; Greenlandic",
  },
  {
    alpha2: "km",
    english: "Central Khmer",
  },
  {
    alpha2: "kn",
    english: "Kannada",
  },
  {
    alpha2: "ko",
    english: "Korean",
  },
  {
    alpha2: "kr",
    english: "Kanuri",
  },
  {
    alpha2: "ks",
    english: "Kashmiri",
  },
  {
    alpha2: "ku",
    english: "Kurdish",
  },
  {
    alpha2: "kv",
    english: "Komi",
  },
  {
    alpha2: "kw",
    english: "Cornish",
  },
  {
    alpha2: "ky",
    english: "Kirghiz; Kyrgyz",
  },
  {
    alpha2: "la",
    english: "Latin",
  },
  {
    alpha2: "lb",
    english: "Luxembourgish; Letzeburgesch",
  },
  {
    alpha2: "lg",
    english: "Ganda",
  },
  {
    alpha2: "li",
    english: "Limburgan; Limburger; Limburgish",
  },
  {
    alpha2: "ln",
    english: "Lingala",
  },
  {
    alpha2: "lo",
    english: "Lao",
  },
  {
    alpha2: "lt",
    english: "Lithuanian",
  },
  {
    alpha2: "lu",
    english: "Luba-Katanga",
  },
  {
    alpha2: "lv",
    english: "Latvian",
  },
  {
    alpha2: "mg",
    english: "Malagasy",
  },
  {
    alpha2: "mh",
    english: "Marshallese",
  },
  {
    alpha2: "mi",
    english: "Maori",
  },
  {
    alpha2: "mk",
    english: "Macedonian",
  },
  {
    alpha2: "ml",
    english: "Malayalam",
  },
  {
    alpha2: "mn",
    english: "Mongolian",
  },
  {
    alpha2: "mr",
    english: "Marathi",
  },
  {
    alpha2: "ms",
    english: "Malay",
  },
  {
    alpha2: "mt",
    english: "Maltese",
  },
  {
    alpha2: "my",
    english: "Burmese",
  },
  {
    alpha2: "na",
    english: "Nauru",
  },
  {
    alpha2: "nb",
    english: "Bokmål, Norwegian; Norwegian Bokmål",
  },
  {
    alpha2: "nd",
    english: "Ndebele, North; North Ndebele",
  },
  {
    alpha2: "ne",
    english: "Nepali",
  },
  {
    alpha2: "ng",
    english: "Ndonga",
  },
  {
    alpha2: "nl",
    english: "Dutch; Flemish",
  },
  {
    alpha2: "nn",
    english: "Norwegian Nynorsk; Nynorsk, Norwegian",
  },
  {
    alpha2: "no",
    english: "Norwegian",
  },
  {
    alpha2: "nr",
    english: "Ndebele, South; South Ndebele",
  },
  {
    alpha2: "nv",
    english: "Navajo; Navaho",
  },
  {
    alpha2: "ny",
    english: "Chichewa; Chewa; Nyanja",
  },
  {
    alpha2: "oc",
    english: "Occitan (post 1500)",
  },
  {
    alpha2: "oj",
    english: "Ojibwa",
  },
  {
    alpha2: "om",
    english: "Oromo",
  },
  {
    alpha2: "or",
    english: "Oriya",
  },
  {
    alpha2: "os",
    english: "Ossetian; Ossetic",
  },
  {
    alpha2: "pa",
    english: "Panjabi; Punjabi",
  },
  {
    alpha2: "pi",
    english: "Pali",
  },
  {
    alpha2: "pl",
    english: "Polish",
  },
  {
    alpha2: "ps",
    english: "Pushto; Pashto",
  },
  {
    alpha2: "pt",
    english: "Portuguese",
  },
  {
    alpha2: "qu",
    english: "Quechua",
  },
  {
    alpha2: "rm",
    english: "Romansh",
  },
  {
    alpha2: "rn",
    english: "Rundi",
  },
  {
    alpha2: "ro",
    english: "Romanian; Moldavian; Moldovan",
  },
  {
    alpha2: "ru",
    english: "Russian",
  },
  {
    alpha2: "rw",
    english: "Kinyarwanda",
  },
  {
    alpha2: "sa",
    english: "Sanskrit",
  },
  {
    alpha2: "sc",
    english: "Sardinian",
  },
  {
    alpha2: "sd",
    english: "Sindhi",
  },
  {
    alpha2: "se",
    english: "Northern Sami",
  },
  {
    alpha2: "sg",
    english: "Sango",
  },
  {
    alpha2: "si",
    english: "Sinhala; Sinhalese",
  },
  {
    alpha2: "sk",
    english: "Slovak",
  },
  {
    alpha2: "sl",
    english: "Slovenian",
  },
  {
    alpha2: "sm",
    english: "Samoan",
  },
  {
    alpha2: "sn",
    english: "Shona",
  },
  {
    alpha2: "so",
    english: "Somali",
  },
  {
    alpha2: "sq",
    english: "Albanian",
  },
  {
    alpha2: "sr",
    english: "Serbian",
  },
  {
    alpha2: "ss",
    english: "Swati",
  },
  {
    alpha2: "st",
    english: "Sotho, Southern",
  },
  {
    alpha2: "su",
    english: "Sundanese",
  },
  {
    alpha2: "sv",
    english: "Swedish",
  },
  {
    alpha2: "sw",
    english: "Swahili",
  },
  {
    alpha2: "ta",
    english: "Tamil",
  },
  {
    alpha2: "te",
    english: "Telugu",
  },
  {
    alpha2: "tg",
    english: "Tajik",
  },
  {
    alpha2: "th",
    english: "Thai",
  },
  {
    alpha2: "ti",
    english: "Tigrinya",
  },
  {
    alpha2: "tk",
    english: "Turkmen",
  },
  {
    alpha2: "tl",
    english: "Tagalog",
  },
  {
    alpha2: "tn",
    english: "Tswana",
  },
  {
    alpha2: "to",
    english: "Tonga (Tonga Islands)",
  },
  {
    alpha2: "tr",
    english: "Turkish",
  },
  {
    alpha2: "ts",
    english: "Tsonga",
  },
  {
    alpha2: "tt",
    english: "Tatar",
  },
  {
    alpha2: "tw",
    english: "Twi",
  },
  {
    alpha2: "ty",
    english: "Tahitian",
  },
  {
    alpha2: "ug",
    english: "Uighur; Uyghur",
  },
  {
    alpha2: "uk",
    english: "Ukrainian",
  },
  {
    alpha2: "ur",
    english: "Urdu",
  },
  {
    alpha2: "uz",
    english: "Uzbek",
  },
  {
    alpha2: "ve",
    english: "Venda",
  },
  {
    alpha2: "vi",
    english: "Vietnamese",
  },
  {
    alpha2: "vo",
    english: "Volapük",
  },
  {
    alpha2: "wa",
    english: "Walloon",
  },
  {
    alpha2: "wo",
    english: "Wolof",
  },
  {
    alpha2: "xh",
    english: "Xhosa",
  },
  {
    alpha2: "yi",
    english: "Yiddish",
  },
  {
    alpha2: "yo",
    english: "Yoruba",
  },
  {
    alpha2: "za",
    english: "Zhuang; Chuang",
  },
  {
    alpha2: "zh",
    english: "Chinese",
  },
  {
    alpha2: "zu",
    english: "Zulu",
  },
];

export const iso639Identifiers = iso639Languages.map((language) => language.alpha2);

export const getLanguageLabel = (languageCode: string) => {
  const language = iso639Languages.find((lang) => lang.alpha2 === languageCode);
  return `${language?.english}`;
};
