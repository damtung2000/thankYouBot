const { App, ExpressReceiver } = require('@slack/bolt');
const { parseRequestBody, generateReceiverEvent, isUrlVerificationRequest } = require('../utils/utils');
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

app.shortcut('thanks', async ({ shortcut, ack, logger, body }) => {
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
  respond({
    text: await translateThanks(),
  });
});
app.error(({ error, logger, context, body }) => {
  // Log the error using the logger passed into Bolt
  logger.error(error);
  app.client.chat.postEphemeral({
    text: error.toString(),
    thread_ts: body?.message_ts || null,
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
