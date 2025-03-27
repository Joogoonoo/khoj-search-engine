import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { storage } from '../server/storage';

// Create a minimal Express app for API handlers
const app = express();
app.use(express.json());

// Simple search handler for Vercel
export default async function(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.url?.startsWith('/api/search')) {
      // Handle search request
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      
      // Perform search
      const results = await storage.searchWebpages(query);
      
      // Pagination
      const totalResults = results.length;
      const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
      const safePageNum = Math.min(Math.max(1, page), totalPages);
      const start = (safePageNum - 1) * pageSize;
      const end = Math.min(start + pageSize, totalResults);
      const paginatedResults = results.slice(start, end);
      
      // Record search query
      await storage.recordSearchQuery(query, totalResults);
      
      return res.status(200).json({
        results: paginatedResults,
        metadata: {
          query,
          totalResults,
          currentPage: safePageNum,
          totalPages,
          pageSize,
          executionTimeMs: 0
        }
      });
    } else if (req.url?.startsWith('/api/webpages')) {
      if (req.method === 'GET') {
        // Get all webpages
        const webpages = await storage.getWebpages();
        return res.status(200).json(webpages);
      } else {
        return res.status(405).json({ error: 'Method not allowed' });
      }
    } else {
      // Default response
      return res.status(404).json({ error: 'API endpoint not found' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}