'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@/components/ConnectButton'
import { CreateEscrow } from '@/components/CreateEscrow'
import { EscrowViewer } from '@/components/EscrowViewer'
import { Github, ExternalLink, Shield, CheckCircle, Zap, Clock, DollarSign } from 'lucide-react'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen hero-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg hidden sm:block">
              Agent<span className="gradient-text">Escrow</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Network Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-medium text-blue-400">Base</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Live on Base Mainnet
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in">
            Fair Splits.
            <br />
            <span className="gradient-text">Enforced by Code.</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in">
            Create trustless escrow contracts for multi-party collaboration.
            Each contributor gets their share — guaranteed by smart contracts.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-in">
            <a href="#create" className="btn btn-primary w-full sm:w-auto">
              Create Escrow
            </a>
            <a href="#view" className="btn btn-ghost w-full sm:w-auto">
              View Existing →
            </a>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="trust-bar animate-fade-in">
        <div className="trust-item">
          <CheckCircle className="w-4 h-4 text-success" />
          <span>Verified Contract</span>
        </div>
        <div className="trust-item">
          <Zap className="w-4 h-4 text-blue-400" />
          <span>Base Network</span>
        </div>
        <div className="trust-item">
          <DollarSign className="w-4 h-4 text-cyan-400" />
          <span>USDC Native</span>
        </div>
        <div className="trust-item">
          <Clock className="w-4 h-4 text-warning" />
          <span>14-Day Auto-Release</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          <div id="create">
            <CreateEscrow />
          </div>
          <div id="view">
            <EscrowViewer />
          </div>
        </div>
      </main>

      {/* Contract Info */}
      <section className="border-t border-default py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="card p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted mb-1">Verified Contract Address</h3>
                <a 
                  href="https://basescan.org/address/0xefD02C79D9A386ebEcC9B16A2f43a7678a3F1b02"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs sm:text-sm hover:text-brand transition-colors flex items-center gap-2 break-all"
                >
                  0xefD02C79D9A386ebEcC9B16A2f43a7678a3F1b02
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
              <a 
                href="https://github.com/Masoncags-tech/agent-escrow"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
              >
                <Github className="w-4 h-4" />
                View Source
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-default py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>
            Built by <a href="https://twitter.com/BigHossbot" className="text-brand hover:underline">@BigHossbot</a>
          </p>
          <p>© 2026 AgentEscrow</p>
        </div>
      </footer>
    </div>
  )
}
