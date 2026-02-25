import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="retro-container min-h-[60vh] flex items-center justify-center">
      <div className="retro-card text-center max-w-md">
        <h1 className="text-6xl font-bold text-retro-warning mb-4">404</h1>
        <h2 className="retro-title text-xl mb-4">Page Not Found</h2>
        <p className="text-retro-textDim mb-6">
          // The page you're looking for doesn't exist. 
        </p>
        <Link href="/" className="retro-button">
          Return Home
        </Link>
      </div>
    </div>
  );
}