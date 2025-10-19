import React from 'react';
import { ArrowRight, Download, Shield, Zap } from 'lucide-react';

export default function PublicHome() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black"></div>
            <span className="text-xl font-semibold tracking-tight">CRANEEYES</span>
          </div>
          <nav className="flex items-center space-x-8">
            <a href="/models" className="text-sm text-gray-600 hover:text-black transition-colors">
              Firmware
            </a>
            <a href="/admin/login" className="text-sm text-gray-600 hover:text-black transition-colors">
              Admin
            </a>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="max-w-3xl">
          <h1 className="text-6xl font-bold tracking-tight leading-tight mb-6">
            Crane Firmware
            <br />
            Management Platform
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Professional firmware distribution system for industrial crane equipment.
            Secure, reliable, and always up-to-date.
          </p>
          <div className="flex items-center space-x-4">
            <a
              href="/models"
              className="inline-flex items-center px-6 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Browse Firmware
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
            <a
              href="/admin/login"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium hover:border-black transition-colors"
            >
              Admin Access
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <div className="w-12 h-12 bg-black flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-3">Secure Distribution</h3>
            <p className="text-gray-600 leading-relaxed">
              Enterprise-grade security with encrypted storage and controlled access management.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-black flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-3">Fast Delivery</h3>
            <p className="text-gray-600 leading-relaxed">
              High-performance content delivery network ensures rapid firmware deployment.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-black flex items-center justify-center mb-6">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-3">Version Control</h3>
            <p className="text-gray-600 leading-relaxed">
              Complete version history and rollback capabilities for all crane models.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-sm text-gray-600">System Availability</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">50+</div>
            <div className="text-sm text-gray-600">Crane Models</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">99.9%</div>
            <div className="text-sm text-gray-600">Uptime SLA</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">&lt; 2s</div>
            <div className="text-sm text-gray-600">Avg. Download Start</div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              © 2025 CraneEyes. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Documentation
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Support
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}