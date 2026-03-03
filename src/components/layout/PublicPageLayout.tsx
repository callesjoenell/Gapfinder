import { Link } from "react-router-dom";

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-semibold text-gray-900 hover:text-primary-600">
          What To Build
        </Link>
        <nav className="flex gap-6 text-sm text-gray-500">
          <Link to="/about" className="hover:text-gray-900">About</Link>
          <Link to="/faq" className="hover:text-gray-900">FAQ</Link>
          <Link to="/contact" className="hover:text-gray-900">Contact</Link>
        </nav>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="text-center text-sm text-gray-400 py-8">
        <div className="mb-2">
          <Link to="/" className="hover:text-gray-600">Back to What To Build</Link>
        </div>
        <div className="flex justify-center gap-4">
          <Link to="/terms" className="hover:text-gray-600">Terms</Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/refund" className="hover:text-gray-600">Refund Policy</Link>
        </div>
      </footer>
    </div>
  );
}
