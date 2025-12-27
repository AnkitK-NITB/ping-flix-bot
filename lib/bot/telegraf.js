import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

import { handleStart, handleText, handleSelection } from './handlers.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(handleStart);
bot.on('message', (ctx, next) => {
  if (ctx.message.text) {
    return handleText(ctx);
  }
  return next();
});
bot.action(/selected:(\d+):(\w+)/, handleSelection);

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('An error occurred. Please try again later.');
});

export { bot };