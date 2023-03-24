'use strict';
const crypto = require('crypto');
const { translate } = require('@vitalets/google-translate-api');

const verifySignature = (req) => {
  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  console.log('sig: ', signature);
  console.log('timestamp:', timestamp);
  const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET);
  const [version, challenge] = signature.split('=');

  hmac.update(`${version}:${timestamp}:${req.rawBody}`);
  const response = hmac.digest('hex');
  console.log('hex: ', response);
  console.log('hah: ', challenge);
  return response === challenge;
};

const generateRawBody = (event) => {
  return String(event.body).replace(/'/g, "'").replace(/\\'/g, "'");
};
const LANGUAGES = {
  af: 'Afrikaans',
  sq: 'Albanian',
  am: 'Amharic',
  ar: 'Arabic',
  hy: 'Armenian',
  az: 'Azerbaijani',
  eu: 'Basque',
  be: 'Belarusian',
  bn: 'Bengali',
  bs: 'Bosnian',
  bg: 'Bulgarian',
  ca: 'Catalan',
  ceb: 'Cebuano',
  ny: 'Chichewa',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  co: 'Corsican',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  nl: 'Dutch',
  en: 'English',
  eo: 'Esperanto',
  et: 'Estonian',
  tl: 'Filipino',
  fi: 'Finnish',
  fr: 'French',
  fy: 'Frisian',
  gl: 'Galician',
  ka: 'Georgian',
  de: 'German',
  el: 'Greek',
  gu: 'Gujarati',
  ht: 'Haitian Creole',
  ha: 'Hausa',
  haw: 'Hawaiian',
  iw: 'Hebrew',
  hi: 'Hindi',
  hmn: 'Hmong',
  hu: 'Hungarian',
  is: 'Icelandic',
  ig: 'Igbo',
  id: 'Indonesian',
  ga: 'Irish',
  it: 'Italian',
  ja: 'Japanese',
  jw: 'Javanese',
  kn: 'Kannada',
  kk: 'Kazakh',
  km: 'Khmer',
  rw: 'Kinyarwanda',
  ko: 'Korean',
  ku: 'Kurdish (Kurmanji)',
  ky: 'Kyrgyz',
  lo: 'Lao',
  la: 'Latin',
  lv: 'Latvian',
  lt: 'Lithuanian',
  lb: 'Luxembourgish',
  mk: 'Macedonian',
  mg: 'Malagasy',
  ms: 'Malay',
  ml: 'Malayalam',
  mt: 'Maltese',
  mi: 'Maori',
  mr: 'Marathi',
  mn: 'Mongolian',
  my: 'Myanmar (Burmese)',
  ne: 'Nepali',
  no: 'Norwegian',
  or: 'Odia (Oriya)',
  ps: 'Pashto',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese',
  pa: 'Punjabi',
  ro: 'Romanian',
  ru: 'Russian',
  sm: 'Samoan',
  gd: 'Scots Gaelic',
  sr: 'Serbian',
  st: 'Sesotho',
  sn: 'Shona',
  sd: 'Sindhi',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  es: 'Spanish',
  su: 'Sundanese',
  sw: 'Swahili',
  sv: 'Swedish',
  tg: 'Tajik',
  ta: 'Tamil',
  tt: 'Tatar',
  te: 'Telugu',
  th: 'Thai',
  tr: 'Turkish',
  tk: 'Turkmen',
  uk: 'Ukrainian',
  ur: 'Urdu',
  ug: 'Uyghur',
  uz: 'Uzbek',
  vi: 'Vietnamese',
  cy: 'Welsh',
  xh: 'Xhosa',
  yi: 'Yiddish',
  yo: 'Yoruba',
  zu: 'Zulu',
};

const selectRandomLocale = () => Object.keys(LANGUAGES)[Math.floor(Math.random() * Object.keys(LANGUAGES).length)];

const handler = async (event) => {
  try {
    event.rawBody = generateRawBody(event);
    if (!verifySignature(event)) {
      return { statusCode: 401, body: 'error' };
    }

    const locale = selectRandomLocale();

    const { text: thanksTranslated } = await translate('Thank you', { to: locale });

    const returnBody = {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },

      body: JSON.stringify({
        response_type: 'in_channel',
        text: `${thanksTranslated}!\n"${thanksTranslated}" is "Thank you" in ${LANGUAGES[locale]} `,
        delete_original: 'true',
      }),
    };

    return returnBody;
  } catch (error) {
    console.log(error.toString());
    return { statusCode: 500, body: error.toString() };
  }
};

module.exports = { handler };
