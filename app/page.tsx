"use client";

import React from 'react';
import { Camera } from '../components/camera';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-r bg-zinc-950 transition-colors">
      <header className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-white">
              AI Teaching Assistant
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-300">
            Answer in Voice or Text Format
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Show your academic problem to the camera. It will provide you with a solution in voice or text format.
          </p>
        </div>
        <div className="flex justify-center">
          <Camera />
        </div>
      </main>
    </div>
  );
}
