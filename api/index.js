import dotenv from 'dotenv';
dotenv.config();

import { bot } from '../lib/bot/telegraf.js';

export default async (req, res) => {
  if (req.method === 'POST') {
    // Process incoming updates from Telegram
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } else {
    res.status(405).send('Method Not Allowed');
  }
};

// // Run local
// (async () => {
//   await bot.launch();
// })();

// Graceful shutdown
['SIGINT', 'SIGTERM'].forEach(sig =>
  process.once(sig, () => bot.stop(`${sig} received`))
);