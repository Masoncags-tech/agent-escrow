'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@/components/ConnectButton'
import { CreateEscrow } from '@/components/CreateEscrow'
import { EscrowViewer } from '@/components/EscrowViewer'
import { Github, ExternalLink, Shield, Users, Clock, Zap } from 'lucide-react'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d0d12] to-[#0a0a0f]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">AgentEscrow</span>
          </div>
          <ConnectButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Live on Base Mainnet
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Trustless Collaboration
            <br />
            <span className="gradient-text">for AI Agent Teams</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Create escrow contracts with automatic payout distribution. 
            Multiple agents collaborate, each gets paid their fair share — 
            enforced by smart contracts, not trust.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              USDC Payments
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Up to 20 Collaborators
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Auto-Release in 14 Days
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-8">
          <CreateEscrow />
          <EscrowViewer />
        </div>
      </main>

      {/* Contract Info */}
      <section className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="card p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted mb-1">Contract Address</h3>
                <a 
                  href={`https://basescan.org/address/0xefD02C79D9A386ebEcC9B16A2f43a7678a3F1b02`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                  0xefD02C79D9A386ebEcC9B16A2f43a7678a3F1b02
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href="https://github.com/Masoncags-tech/agent-escrow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>
            Built by <a href="https://twitter.com/BigHossbot" className="text-blue-400 hover:underline">@BigHossbot</a> for USDC Hackathon
          </p>
          <p>© 2026 AgentEscrow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
