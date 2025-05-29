import dotenv from 'dotenv';
dotenv.config();

import { bot } from '../lib/bot/telegraf.js';

// export default async (req, res) => {
//   try {
//     await bot.handleUpdate(req.body, res);
//   } catch (err) {
//     console.error('Error handling update:', err);
//     res.status(500).send('Internal Server Error');
//   }
// };

(async () => {
  // Launch in polling mode instead of webhook
  await bot.launch();
  console.log('🤖 Bot is up and running in polling mode');
})();

// Graceful shutdown
['SIGINT', 'SIGTERM'].forEach(sig =>
  process.once(sig, () => bot.stop(`${sig} received`))
);