import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchSchema, insertWebpageSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Search endpoint
  apiRouter.get("/search", async (req: Request, res: Response) => {
    try {
      // Parse and validate search query
      const validatedParams = searchSchema.parse({
        query: req.query.q as string,
        page: parseInt(req.query.page as string) || 1,
      });

      // Perform search
      const results = await storage.searchWebpages(validatedParams.query);
      
      // Calculate pagination
      const pageSize = 10;
      const totalResults = results.length;
      const totalPages = Math.ceil(totalResults / pageSize);
      const currentPage = Math.min(validatedParams.page, totalPages);
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalResults);
      
      // Get results for current page
      const paginatedResults = results.slice(startIndex, endIndex);

      // Record search query for analytics
      await storage.recordSearchQuery(validatedParams.query, totalResults);

      // Return search results
      res.json({
        results: paginatedResults,
        metadata: {
          query: validatedParams.query,
          totalResults,
          currentPage,
          totalPages,
          pageSize,
          executionTimeMs: Math.floor(Math.random() * 400) + 100, // Simulated execution time between 100-500ms
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          error: validationError.message 
        });
      } else {
        console.error("Search error:", error);
        res.status(500).json({ 
          error: "An error occurred while performing the search" 
        });
      }
    }
  });

  // Get available webpages (for debugging/admin)
  apiRouter.get("/webpages", async (_req: Request, res: Response) => {
    try {
      const webpages = await storage.getWebpages();
      res.json(webpages);
    } catch (error) {
      console.error("Failed to get webpages:", error);
      res.status(500).json({ 
        error: "Failed to get webpages" 
      });
    }
  });

  // Add new webpage (for crawler)
  apiRouter.post("/webpages", async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const validatedWebpage = insertWebpageSchema.parse(req.body);
      
      // Check if webpage with this URL already exists
      const existingWebpage = await storage.getWebpageByUrl(validatedWebpage.url);
      if (existingWebpage) {
        return res.status(409).json({ 
          error: "A webpage with this URL already exists in the index",
          webpage: existingWebpage
        });
      }
      
      // Create new webpage
      const newWebpage = await storage.createWebpage(validatedWebpage);
      
      res.status(201).json(newWebpage);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          error: validationError.message 
        });
      } else {
        console.error("Failed to add webpage:", error);
        res.status(500).json({ 
          error: "Failed to add webpage to index" 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
