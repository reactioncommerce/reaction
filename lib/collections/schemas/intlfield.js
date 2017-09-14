import { SimpleSchema } from "meteor/aldeed:simple-schema";

/**
* Reaction Schemas Intlfield
*/

const defaultAttributeOptions = {
  type: String,
  optional: true,
  defaultValue: ""
}

const langs = [
  'ar', 'bg', 'cs', 'de', 'el', 'en', 'es', 'fr', 'he', 'hr', 'hu', 'it', 'my',
  'nb', 'nl', 'pl', 'pt', 'ro', 'ru', 'sl', 'sv', 'tr', 'vi', 'zh',
]

function createI18nObject ( string = "" ) {
  const obj = {}

  for ( let lang of langs ) {
    obj[lang] = string
  }

  return obj
}

function autoValue () {
  const baseLang = 'en'

  const { value } = this

  if ( value && typeof value == 'object' ) {
    return value
  }

  if ( value && typeof value == 'string' ) {
    this.value = {
      [baseLang]: createI18nObject(value)
    }
  }

  return createI18nObject()
}

export function schemaBuilder ( i18nAttributeOptions = {}, extraAttributes = {} ) {
  const attributes = {}

  for ( let lang of langs ) {
    attributes[lang] = { ...defaultAttributeOptions, ...i18nAttributeOptions }
  }

  return new SimpleSchema({ ...attributes, ...extraAttributes })
}

export const Intlfield = schemaBuilder()

export function i18nify ( extraOptions = {}, i18nAttributeOptions, extraAttributes ) {
  return {
    type: schemaBuilder( i18nAttributeOptions, extraAttributes ),
    autoValue,
    ...extraOptions,
  }
}
