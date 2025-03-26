import { type SearchResult } from "@shared/schema";

interface SearchResultsProps {
  results: SearchResult[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '') + urlObj.pathname;
    } catch {
      return url;
    }
  };

  // Helper to determine if a result should be featured (higher score results)
  const isFeatured = (result: SearchResult) => result.relevanceScore > 15;

  return (
    <div className="search-results mt-6 space-y-8 mb-10">
      {results.map((result, index) => (
        isFeatured(result) ? (
          // Featured snippet format
          <div key={result.id} className="result bg-gray-50 p-4 rounded-lg border">
            <div className="text-sm text-gray-600">विशेष उल्लेख</div>
            <h3 className="text-xl text-blue-800 font-medium hover:underline">
              <a href={result.url}>{result.title}</a>
            </h3>
            <div className="mt-2">
              <div className="flex items-start">
                <span className="material-icons text-google-blue mr-2">description</span>
                <div>
                  <p className="text-sm text-gray-700">{result.description}</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-result-url mt-2">{getDomain(result.url)}</div>
          </div>
        ) : (
          // Standard result format
          <div key={result.id} className="result">
            <div className="text-sm text-result-url">{getDomain(result.url)}</div>
            <h3 className="text-xl text-blue-800 font-medium hover:underline">
              <a href={result.url}>{result.title}</a>
            </h3>
            <p className="text-sm text-result-text mt-1">
              {result.snippet || result.description}
            </p>
          </div>
        )
      ))}
    </div>
  );
}
