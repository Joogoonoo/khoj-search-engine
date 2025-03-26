import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import Pagination from "@/components/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { type SearchResult } from "@shared/schema";

interface SearchResponse {
  results: SearchResult[];
  metadata: {
    query: string;
    totalResults: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    executionTimeMs: number;
  };
}

export default function ResultsPage() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(search);
  const query = params.get("q") || "";
  const page = parseInt(params.get("page") || "1");
  const [searchInput, setSearchInput] = useState(query);

  // Update input when URL query changes
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const { data, isLoading, isError } = useQuery<SearchResponse>({
    queryKey: [`/api/search?q=${encodeURIComponent(query)}&page=${page}`],
    enabled: !!query,
  });

  const handleSearch = () => {
    if (searchInput.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    setLocation(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
  };

  return (
    <div className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="sticky top-16 bg-white pt-4 pb-2 z-10">
          <div className="flex items-center border-b pb-3">
            <div className="flex items-center flex-grow">
              <div className="relative mr-4 flex-grow max-w-2xl">
                <SearchBar 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onSearch={handleSearch}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  compact
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-sm mt-2 overflow-x-auto pb-2 scrollbar-hide">
            <a href="#" className="flex items-center mr-6 text-google-blue border-b-4 border-google-blue pb-1">
              <span className="material-icons text-sm mr-1">search</span> सभी
            </a>
            <a href="#" className="flex items-center mr-6 text-gray-600 hover:text-google-blue">
              <span className="material-icons text-sm mr-1">image</span> चित्र
            </a>
            <a href="#" className="flex items-center mr-6 text-gray-600 hover:text-google-blue">
              <span className="material-icons text-sm mr-1">map</span> मानचित्र
            </a>
            <a href="#" className="flex items-center mr-6 text-gray-600 hover:text-google-blue">
              <span className="material-icons text-sm mr-1">play_circle</span> वीडियो
            </a>
            <a href="#" className="flex items-center mr-6 text-gray-600 hover:text-google-blue">
              <span className="material-icons text-sm mr-1">article</span> समाचार
            </a>
            <a href="#" className="flex items-center text-gray-600 hover:text-google-blue">
              <span className="material-icons text-sm mr-1">more_vert</span> अधिक
            </a>
          </div>
        </div>

        {/* Search info */}
        {isLoading ? (
          <div className="mt-4">
            <Skeleton className="h-4 w-56" />
          </div>
        ) : isError ? (
          <div className="text-sm text-red-600 mt-4">
            खोज करने में त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।
          </div>
        ) : data ? (
          <div className="text-sm text-gray-600 mt-4">
            लगभग {data.metadata.totalResults.toLocaleString()} परिणाम ({(data.metadata.executionTimeMs / 1000).toFixed(2)} सेकंड)
          </div>
        ) : null}

        {/* Search Results */}
        {isLoading ? (
          <div className="mt-6 space-y-8 mb-10">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="result">
                <Skeleton className="h-4 w-72 mb-2" />
                <Skeleton className="h-6 w-96 mb-2" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10 text-red-600">
            <p>खोज करने में त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।</p>
          </div>
        ) : data && data.results.length > 0 ? (
          <>
            <SearchResults results={data.results} />
            
            {data.metadata.totalPages > 1 && (
              <Pagination 
                currentPage={data.metadata.currentPage}
                totalPages={data.metadata.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : query ? (
          <div className="text-center py-10">
            <p className="text-gray-600">आपकी खोज - <strong>{query}</strong> - के लिए कोई परिणाम नहीं मिला।</p>
            <p className="text-gray-600 mt-2">सुझाव:</p>
            <ul className="mt-1 text-gray-600">
              <li>सुनिश्चित करें कि सभी शब्द सही वर्तनी वाले हैं।</li>
              <li>अलग-अलग कीवर्ड आज़माएं।</li>
              <li>अधिक सामान्य कीवर्ड आज़माएं।</li>
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
