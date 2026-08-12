import { Request, Response } from 'express';
import { VisitorCount } from '../models/VisitorCount';

// Helper to get or create the single counter document
const getOrCreateCounter = async () => {
  let counter = await VisitorCount.findOne();
  if (!counter) {
    counter = await VisitorCount.create({ count: 0 });
  }
  return counter;
};

export const incrementVisitorCount = async (req: Request, res: Response) => {
  try {
    const counter = await getOrCreateCounter();
    counter.count += 1;
    await counter.save();
    res.status(200).json({ count: counter.count });
  } catch (error) {
    console.error('Failed to increment visitor count', error);
    res.status(500).json({ error: 'Failed to increment visitor count' });
  }
};

export const getVisitorCount = async (req: Request, res: Response) => {
  try {
    const counter = await getOrCreateCounter();
    res.status(200).json({ count: counter.count });
  } catch (error) {
    console.error('Failed to get visitor count', error);
    res.status(500).json({ error: 'Failed to get visitor count' });
  }
};
