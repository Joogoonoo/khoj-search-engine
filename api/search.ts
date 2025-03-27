import { Request, Response } from 'express';
import { storage } from '../server/storage';
import { searchSchema } from '../shared/schema';

export default async function(req: Request, res: Response) {
  try {
    const { query, page = '1', pageSize = '10' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Parse and validate query parameters
    const validatedParams = searchSchema.safeParse({
      query,
      page: Number(page),
      pageSize: Number(pageSize)
    });
    
    if (!validatedParams.success) {
      return res.status(400).json({ error: 'Invalid parameters', details: validatedParams.error });
    }

    const { query: validQuery, page: pageNum, pageSize: pageSizeNum } = validatedParams.data;
    
    // Perform search
    const startTime = Date.now();
    const results = await storage.searchWebpages(validQuery);
    const executionTimeMs = Date.now() - startTime;
    
    // Record this search query
    await storage.recordSearchQuery(validQuery, results.length);
    
    // Pagination
    const totalResults = results.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / pageSizeNum));
    const safePageNum = Math.min(Math.max(1, pageNum), totalPages);
    const start = (safePageNum - 1) * pageSizeNum;
    const end = Math.min(start + pageSizeNum, totalResults);
    const paginatedResults = results.slice(start, end);
    
    return res.json({
      results: paginatedResults,
      metadata: {
        query: validQuery,
        totalResults,
        currentPage: safePageNum,
        totalPages,
        pageSize: pageSizeNum,
        executionTimeMs
      }
    });
  } catch (err) {
    console.error('Error in search API:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: errorMessage 
    });
  }
}