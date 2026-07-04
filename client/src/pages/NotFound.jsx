import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-6xl font-extrabold mb-2">404</h1>
    <p className="text-ink-muted mb-6">This page doesn't exist.</p>
    <Link to="/dashboard" className="btn-accent">
      Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
