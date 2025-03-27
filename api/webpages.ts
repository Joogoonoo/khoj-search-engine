import { Request, Response } from 'express';
import { storage } from '../server/storage';
import { insertWebpageSchema } from '../shared/schema';

export default async function(req: Request, res: Response) {
  try {
    if (req.method === 'GET') {
      // Get all webpages
      const webpages = await storage.getWebpages();
      return res.json(webpages);
    } else if (req.method === 'POST') {
      // Create a new webpage
      const validationResult = insertWebpageSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid webpage data', 
          details: validationResult.error 
        });
      }
      
      const newWebpage = await storage.createWebpage(validationResult.data);
      return res.status(201).json(newWebpage);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Error in webpages API:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: errorMessage 
    });
  }
}