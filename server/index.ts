import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Vercel उत्पादन पर्यावरण में कॉलबैक के साथ काम करता है
const startServer = async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Vercel पर होस्ट करने के लिए, हम process.env.PORT का उपयोग करेंगे
  // अगर कोई पोर्ट एनवायरनमेंट वेरिएबल में नहीं है, तो 5000 का उपयोग करेंगे
  const port = process.env.PORT || 5000;
  
  // Vercel सेरवलेस फंक्शन के लिए, हम express app को एक्सपोर्ट करेंगे
  // लेकिन डेवलपमेंट मोड में हम सर्वर चलाएंगे
  if (process.env.NODE_ENV !== 'production') {
    server.listen({
      port: Number(port),
      host: "0.0.0.0",
    }, () => {
      log(`serving on port ${port}`);
    });
  }
  
  return app;
};

// स्टार्ट सर्वर और एप्लिकेशन को एक्सपोर्ट करें
const serverPromise = startServer();

// Vercel के लिए module.exports
// हम निम्नलिखित प्रविष्टि बिंदु को एक्सपोर्ट करेंगे
export default async (req: Request, res: Response) => {
  try {
    const app = await serverPromise;
    return app(req, res);
  } catch (err) {
    console.error('Error handling request:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Internal Server Error', details: errorMessage });
  }
};
