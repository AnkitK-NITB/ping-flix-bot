import dotenv from 'dotenv';
dotenv.config();

import { bot } from '../lib/bot/telegraf.js';

export default async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (err) {
    console.error('Error handling update:', err);
    res.status(500).send('Internal Server Error');
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