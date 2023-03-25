const { App, ExpressReceiver } = require('@slack/bolt');
const { parseRequestBody, generateReceiverEvent, isUrlVerificationRequest, parseUserId } = require('../utils/utils');
const { translateThanks } = require('../utils/translate');

const expressReceiver = new ExpressReceiver({
  signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
  processBeforeResponse: true,
});

const app = new App({
  signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
  token: `${process.env.SLACK_BOT_TOKEN}`,
  receiver: expressReceiver,
  extendedErrorHandler: true,
});

app.shortcut('thanks_message_shortcut', async ({ shortcut, ack, logger, body }) => {
  try {
    await ack();
    app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: shortcut.channel.id,
      thread_ts: shortcut.message_ts,
      text: await translateThanks({ user: body.user.id }),
    });
  } catch (error) {
    logger(error);
  }
});

app.command('/thanks', async ({ command, ack, respond }) => {
  await ack();
  const userId = parseUserId(command.text);
  const text = await translateThanks({ user: userId });

  await respond({
    text,
    response_type: 'in_channel',
  });
});
app.error(({ error, logger, context, body }) => {
  // Log the error using the logger passed into Bolt
  logger.error(error);
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
