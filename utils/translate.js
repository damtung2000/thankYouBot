'use strict';
const { translate } = require('@vitalets/google-translate-api');
const { LANGUAGES } = require('./constants');
const selectRandomLocale = () => Object.keys(LANGUAGES)[Math.floor(Math.random() * Object.keys(LANGUAGES).length)];

async function translateThanks(params = {}) {
  const { manualLocale, user } = params;
  const locale = manualLocale || selectRandomLocale();
  const { text: thanksTranslated } = await translate('Thank you', { to: locale });
  const userTag = user ? `, <@${user}>` : '';
  return `${thanksTranslated}${userTag}!\n"${thanksTranslated}" is "Thank you" in ${LANGUAGES[locale]} `;
}

exports.translateThanks = translateThanks;
