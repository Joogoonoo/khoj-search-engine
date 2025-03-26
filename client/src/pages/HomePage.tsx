import { useState } from "react";
import { useLocation } from "wouter";
import SearchBar from "@/components/SearchBar";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-7xl font-light mb-8">
          <span className="text-google-blue">ख</span>
          <span className="text-google-red">ो</span>
          <span className="text-google-yellow">ज</span>
          <span className="text-google-green">★</span>
        </h1>
        
        <div className="mb-8">
          <SearchBar 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            showButtons
          />
        </div>
        
        <div className="text-sm text-gray-600">
          अन्य भाषाओं में उपलब्ध: 
          <a href="#" className="text-blue-600 hover:underline ml-1">English</a>
          <a href="#" className="text-blue-600 hover:underline ml-2">हिन्दी</a>
          <a href="#" className="text-blue-600 hover:underline ml-2">বাংলা</a>
          <a href="#" className="text-blue-600 hover:underline ml-2">తెలుగు</a>
          <a href="#" className="text-blue-600 hover:underline ml-2">मराठी</a>
          <a href="#" className="text-blue-600 hover:underline ml-2">தமிழ்</a>
        </div>
      </div>
    </div>
  );
}
