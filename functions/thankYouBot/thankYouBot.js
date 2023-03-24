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
const LANGUAGES = [
  'af',
  'sq',
  'am',
  'ar',
  'hy',
  'az',
  'eu',
  'be',
  'bn',
  'bs',
  'bg',
  'ca',
  'ceb',
  'ny',
  'zh-CN',
  'zh-TW',
  'co',
  'hr',
  'cs',
  'da',
  'nl',
  'en',
  'eo',
  'et',
  'tl',
  'fi',
  'fr',
  'fy',
  'gl',
  'ka',
  'de',
  'el',
  'gu',
  'ht',
  'ha',
  'haw',
  'iw',
  'hi',
  'hmn',
  'hu',
  'is',
  'ig',
  'id',
  'ga',
  'it',
  'ja',
  'jw',
  'kn',
  'kk',
  'km',
  'rw',
  'ko',
  'ku',
  'ky',
  'lo',
  'la',
  'lv',
  'lt',
  'lb',
  'mk',
  'mg',
  'ms',
  'ml',
  'mt',
  'mi',
  'mr',
  'mn',
  'my',
  'ne',
  'no',
  'or',
  'ps',
  'fa',
  'pl',
  'pt',
  'pa',
  'ro',
  'ru',
  'sm',
  'gd',
  'sr',
  'st',
  'sn',
  'sd',
  'si',
  'sk',
  'sl',
  'so',
  'es',
  'su',
  'sw',
  'sv',
  'tg',
  'ta',
  'tt',
  'te',
  'th',
  'tr',
  'tk',
  'uk',
  'ur',
  'ug',
  'uz',
  'vi',
  'cy',
  'xh',
  'yi',
  'yo',
  'zu',
];
const selectRandomLocale = () => LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];

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
        text: `${thanksTranslated}!\n"${thanksTranslated}" is "Thank you" in ${locale} `,
        replace_original: 'true',
      }),
    };

    return returnBody;
  } catch (error) {
    console.log(error.toString());
    return { statusCode: 500, body: error.toString() };
  }
};

module.exports = { handler };
