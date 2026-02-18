import { useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await api.checkAuth();
      setIsAuthenticated(isAuth);
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    setLoading(true);
    setError('');

    try {
      await api.login(input);
      // Wait a moment for cookie to settle, then recheck
      setIsAuthenticated(true);
    } catch (err) {
      setError('Invalid API Key');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Env Manager Login</h2>
        <form onSubmit={handleLogin}>
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiKey">
              Secret Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your secret key"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};
