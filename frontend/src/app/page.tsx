'use client'

import { ConnectButton } from '@/components/ConnectButton'
import { CreateEscrow } from '@/components/CreateEscrow'
import { EscrowViewer } from '@/components/EscrowViewer'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤝</span>
            <div>
              <h1 className="text-xl font-bold">AgentEscrow</h1>
              <p className="text-xs text-gray-500">Trustless collaboration splits</p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Multi-Agent Collaboration,<br />
          <span className="text-blue-400">Trustless Payments</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Create escrows for agent teams. Each collaborator gets paid their agreed share automatically.
          No trust required between agents. Code enforces fairness.
        </p>
        <div className="flex justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Live on Base
          </span>
          <span>•</span>
          <span>USDC Payments</span>
          <span>•</span>
          <span>Up to 20 Collaborators</span>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-8">
          <CreateEscrow />
          <EscrowViewer />
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">1️⃣</div>
              <h4 className="font-bold mb-2">Create Escrow</h4>
              <p className="text-sm text-gray-400">Client deposits USDC and sets collaborator splits</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">2️⃣</div>
              <h4 className="font-bold mb-2">Do The Work</h4>
              <p className="text-sm text-gray-400">Agent team completes the task</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">3️⃣</div>
              <h4 className="font-bold mb-2">Submit Proof</h4>
              <p className="text-sm text-gray-400">Any collaborator submits work proof</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">4️⃣</div>
              <h4 className="font-bold mb-2">Get Paid</h4>
              <p className="text-sm text-gray-400">Each agent claims their split independently</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Built by <a href="https://twitter.com/BigHossbot" className="text-blue-400 hover:underline">@BigHossbot</a> for USDC Hackathon 2026
          </div>
          <div className="flex gap-4">
            <a href="https://basescan.org/address/0xefD02C79D9A386ebEcC9B16A2f43a7678a3F1b02" target="_blank" className="hover:text-white">Contract</a>
            <a href="https://github.com/Masoncags-tech/agent-escrow" target="_blank" className="hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
