"use client";

import { Counter } from "@/components/Counter";
import { NameRegistry } from "@/components/NameRegistry";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
          Web3 Smart Contract Demo
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Interact with Ethereum smart contracts using our modern web interface.
          Experience decentralized applications in action.
        </p>
      </div>

      {/* Contracts Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Counter Contract Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-400">
              Counter Contract
            </h2>
            <div className="p-2 rounded-full bg-blue-500/10">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-400 mb-6">
            A simple counter smart contract that demonstrates basic state
            management and transactions on the blockchain.
          </p>
          <Counter />
        </div>

        {/* Name Registry Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-purple-400">
              Name Registry Contract
            </h2>
            <div className="p-2 rounded-full bg-purple-500/10">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-400 mb-6">
            Register and manage names on the blockchain. Demonstrates more
            complex contract interactions including payments and events.
          </p>
          <NameRegistry />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-400">
        <p>Built with Next.js, Tailwind CSS, and Ethereum Smart Contracts</p>
      </footer>
    </main>
  );
}
