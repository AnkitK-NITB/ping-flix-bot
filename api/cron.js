import dotenv from 'dotenv';
dotenv.config();

import { notifyDueReleases } from '../lib/utils/notifier.js';

export default async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const processed =  await notifyDueReleases();
    res.status(200).json({ 
      message: 'Notifications processed',
      count: processed
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};