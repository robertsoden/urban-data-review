import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DatabaseIcon } from '../components/Icons';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="text-center p-8 bg-white shadow-xl rounded-lg max-w-sm w-full">
        <div className="flex items-center justify-center mb-6">
            <DatabaseIcon className="w-12 h-12 text-button-blue" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Urban Data Catalog</h1>
        <p className="text-slate-600 mt-2 mb-8">Please sign in to continue.</p>
        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-button-blue text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors shadow-md"
        >
          <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 400.2 0 264.4 0 128.6 111.8 16.8 244 16.8c70.3 0 129.8 27.8 174.3 71.9l-67.8 65.9c-28.1-26.2-65.7-42.3-106.5-42.3-82.3 0-149.3 67.1-149.3 149.4s67 149.4 149.3 149.4c96.8 0 128.5-73.8 132.8-110.4H244V261.8h244z"></path>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;