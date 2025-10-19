import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export default function AuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
    alert('Login functionality to be implemented');
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="w-1/2 border-r border-gray-200 flex items-center justify-center p-12">
        <div className="max-w-md w-full">
          <div className="flex items-center space-x-2 mb-12">
            <div className="w-8 h-8 bg-black"></div>
            <span className="text-xl font-semibold tracking-tight">CRANEEYES</span>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Admin Access</h1>
            <p className="text-gray-600">Sign in to manage firmware and crane models</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="admin@craneeyes.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      <div className="w-1/2 bg-black text-white flex items-center justify-center p-12">
        <div className="max-w-md">
          <div className="w-16 h-16 border-2 border-white flex items-center justify-center mb-8">
            <Lock className="w-8 h-8" />
          </div>
          
          <h2 className="text-3xl font-bold mb-6 leading-tight">
            Secure Firmware
            <br />
            Management System
          </h2>
          
          <p className="text-gray-400 leading-relaxed mb-8">
            Access control panel to upload, manage, and distribute firmware updates 
            across all crane models. Enterprise-grade security with full audit logging.
          </p>

          <div className="space-y-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-1 h-1 bg-white rounded-full mt-2"></div>
              <div>
                <div className="font-medium mb-1">Version Control</div>
                <div className="text-gray-400">Manage multiple firmware versions with rollback capability</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1 h-1 bg-white rounded-full mt-2"></div>
              <div>
                <div className="font-medium mb-1">Access Management</div>
                <div className="text-gray-400">Role-based permissions for team collaboration</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1 h-1 bg-white rounded-full mt-2"></div>
              <div>
                <div className="font-medium mb-1">Analytics Dashboard</div>
                <div className="text-gray-400">Track downloads and deployment statistics</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}