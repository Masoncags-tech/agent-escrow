'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet, LogOut, ChevronDown } from 'lucide-react'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover hover:border-red-500/50 text-muted hover:text-red-400 transition-all"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const connector = connectors[0]

  return (
    <button
      onClick={() => connector && connect({ connector })}
      className="btn btn-primary"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  )
}
