import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();
  const isHomePage = location === "/";
  const isCrawler = location === "/crawler";

  return (
    <header className="sticky top-0 bg-white shadow-sm z-10">
      <div className="container mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-medium text-google-blue">खोज</Link>
            <Link href="/crawler" className={`text-sm ${isCrawler ? "text-google-blue font-medium" : "text-gray-600 hover:text-gray-800"}`}>
              <span className="material-icons text-sm mr-1 align-middle">travel_explore</span>
              क्रालर
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-800">
              <span className="material-icons">settings</span>
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <span className="material-icons">apps</span>
            </button>
            <button className="bg-google-blue text-white px-4 py-1 rounded-md hover:bg-blue-600">
              साइन इन
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
