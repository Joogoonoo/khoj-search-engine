import { ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationProps) {
  // Generate page numbers to show
  const generatePageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 10;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate start and end for pages around current
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);
      
      // Adjust if we're near the beginning
      if (currentPage < 4) {
        end = Math.min(totalPages - 1, maxPagesToShow - 2);
      }
      
      // Adjust if we're near the end
      if (currentPage > totalPages - 4) {
        start = Math.max(2, totalPages - maxPagesToShow + 2);
      }
      
      // Add ellipsis if needed at beginning
      if (start > 2) {
        pages.push("ellipsis-start");
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed at end
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      
      // Always include last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="pagination flex justify-center items-center py-6 mb-4">
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return <span key={page} className="px-3 py-1">...</span>;
          }
          
          const pageNum = page as number;
          return (
            <button
              key={index}
              className={`px-3 py-1 ${
                pageNum === currentPage
                  ? "bg-google-blue text-white rounded-md"
                  : "hover:underline text-blue-800"
              }`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
        
        {currentPage < totalPages && (
          <button 
            className="flex items-center hover:underline text-blue-800"
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight size={16} className="ml-1" /> अगला
          </button>
        )}
      </div>
    </div>
  );
}
