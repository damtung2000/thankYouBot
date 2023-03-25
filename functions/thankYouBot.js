'use strict';
//Legacy
const { translateThanks } = require('../utils/translate');
const { generateRawBody, verifySignature } = require('../utils/utils');

const handler = async (event) => {
  try {
    event.rawBody = generateRawBody(event);
    if (!verifySignature(event)) {
      return { statusCode: 401, body: 'error' };
    }
    const text = translateThanks();

    const returnBody = {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },

      body: JSON.stringify({
        response_type: 'in_channel',
        text: text,
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
