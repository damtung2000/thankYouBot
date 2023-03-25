const crypto = require('crypto');
const { USER_ID_REGEX } = require('./constants');

function parseRequestBody(stringBody, contentType) {
  try {
    if (!stringBody) {
      return '';
    }

    let result = {};

    if (contentType && contentType === 'application/json') {
      return JSON.parse(stringBody);
    }

    let keyValuePairs = stringBody.split('&');
    keyValuePairs.forEach(function (pair) {
      let individualKeyValuePair = pair.split('=');
      result[individualKeyValuePair[0]] = decodeURIComponent(individualKeyValuePair[1] || '');
    });
    return JSON.parse(JSON.stringify(result));
  } catch {
    return '';
  }
}

function generateReceiverEvent(payload) {
  return {
    body: payload.payload ? JSON.parse(payload.payload) : payload,
    ack: async (response) => {
      return {
        statusCode: 200,
        body: response ?? '',
      };
    },
  };
}

function isUrlVerificationRequest(payload) {
  if (payload && payload.type && payload.type === 'url_verification') {
    return true;
  }
  return false;
}

function parseUserId(text) {
  const matches = text.match(USER_ID_REGEX);
  const userId = (matches[0] || '').replace('@', '');
  return userId;
}

const generateRawBody = (event) => {
  return String(event.body).replace(/'/g, "'").replace(/\\'/g, "'");
};

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

exports.parseRequestBody = parseRequestBody;
exports.generateReceiverEvent = generateReceiverEvent;
exports.isUrlVerificationRequest = isUrlVerificationRequest;
exports.generateRawBody = generateRawBody;
exports.verifySignature = verifySignature;
exports.parseUserId = parseUserId;
