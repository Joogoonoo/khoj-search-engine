export default function Footer() {
  return (
    <footer className="bg-google-gray border-t py-4">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:justify-between text-sm text-gray-600">
          <div className="mb-4 md:mb-0">
            <p>भारत</p>
          </div>
          <div className="flex flex-wrap">
            <a href="#" className="mr-5 mb-2 hover:underline">हमारे बारे में</a>
            <a href="#" className="mr-5 mb-2 hover:underline">विज्ञापन</a>
            <a href="#" className="mr-5 mb-2 hover:underline">व्यापार</a>
            <a href="#" className="mr-5 mb-2 hover:underline">खोज कैसे काम करती है</a>
            <a href="#" className="mr-5 mb-2 hover:underline">गोपनीयता</a>
            <a href="#" className="mr-5 mb-2 hover:underline">शर्तें</a>
            <a href="#" className="mb-2 hover:underline">सेटिंग्स</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
