const { App, ExpressReceiver } = require('@slack/bolt');
const { parseRequestBody, generateReceiverEvent, isUrlVerificationRequest } = require('../utils/utils');

const expressReceiver = new ExpressReceiver({
  signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
  processBeforeResponse: true,
});

const app = new App({
  signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
  token: `${process.env.SLACK_BOT_TOKEN}`,
  receiver: expressReceiver,
});

app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Hey there <@${message.user}>!`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Click Me',
          },
          action_id: 'button_click',
        },
      },
    ],
    text: `Hey there <@${message.user}>!`,
  });
});

exports.handler = async (event, context) => {
  const payload = parseRequestBody(event.body, event.headers['content-type']);

  if (isUrlVerificationRequest(payload)) {
    return {
      statusCode: 200,
      body: payload?.challenge,
    };
  }

  const slackEvent = generateReceiverEvent(payload);
  await app.processEvent(slackEvent);

  return {
    statusCode: 200,
    body: '',
  };
};
