'use client'

import { useState } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { CONTRACT_ADDRESS } from '@/config/wagmi'
import abi from '@/abi/AgentEscrow.json'

const STATUS_LABELS = ['Active', 'Work Submitted', 'Approved', 'Disputed', 'Resolved', 'Cancelled']
const STATUS_COLORS = ['bg-blue-600', 'bg-yellow-600', 'bg-green-600', 'bg-red-600', 'bg-purple-600', 'bg-gray-600']

export function EscrowViewer() {
  const { address } = useAccount()
  const [escrowId, setEscrowId] = useState('')
  const [proofURI, setProofURI] = useState('')

  const { data: escrowData, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getEscrow',
    args: escrowId ? [BigInt(escrowId)] : undefined,
    query: { enabled: !!escrowId }
  })

  const { data: collaboratorsData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getCollaborators',
    args: escrowId ? [BigInt(escrowId)] : undefined,
    query: { enabled: !!escrowId }
  })

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const escrow = escrowData as any
  const collabs = collaboratorsData as any

  const isClient = escrow && address?.toLowerCase() === escrow[1]?.toLowerCase()
  const isCollaborator = collabs && collabs[0]?.some((addr: string) => addr.toLowerCase() === address?.toLowerCase())
  const status = escrow ? Number(escrow[10]) : -1

  const handleSubmitWork = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'submitWork',
      args: [BigInt(escrowId), proofURI],
    })
  }

  const handleApprove = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'approveWork',
      args: [BigInt(escrowId)],
    })
  }

  const handleClaim = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'claimPayout',
      args: [BigInt(escrowId)],
    })
  }

  if (isSuccess) {
    refetch()
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">View Escrow</h2>
      
      {/* Search */}
      <div className="flex gap-2 mb-6">
        <input
          type="number"
          value={escrowId}
          onChange={(e) => setEscrowId(e.target.value)}
          placeholder="Escrow ID (0, 1, 2...)"
          className="flex-1 px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {escrow && (
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[status]}`}>
              {STATUS_LABELS[status]}
            </span>
            <span className="text-2xl font-bold text-green-400">
              ${formatUnits(escrow[3] || 0n, 6)} USDC
            </span>
          </div>

          {/* Description */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Description</div>
            <div>{escrow[8] || 'No description'}</div>
          </div>

          {/* Client */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Client</div>
            <div className="font-mono text-sm">{escrow[1]}</div>
            {isClient && <span className="text-xs text-blue-400">(You)</span>}
          </div>

          {/* Collaborators */}
          {collabs && (
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Collaborators</div>
              {collabs[0]?.map((addr: string, i: number) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <span className="font-mono text-sm">
                    {addr.slice(0, 6)}...{addr.slice(-4)}
                    {addr.toLowerCase() === address?.toLowerCase() && (
                      <span className="text-xs text-blue-400 ml-2">(You)</span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">{Number(collabs[1][i]) / 100}%</span>
                    {collabs[2][i] && <span className="text-xs text-gray-500">✓ Claimed</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Proof URI */}
          {escrow[9] && (
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Work Proof</div>
              <a href={escrow[9]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                {escrow[9]}
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 space-y-3">
            {/* Submit Work - Collaborator, Active status */}
            {isCollaborator && status === 0 && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={proofURI}
                  onChange={(e) => setProofURI(e.target.value)}
                  placeholder="Proof URI (IPFS link, etc.)"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleSubmitWork}
                  disabled={isPending || isConfirming || !proofURI}
                  className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg font-medium"
                >
                  {isPending ? 'Confirm in wallet...' : isConfirming ? 'Submitting...' : 'Submit Work'}
                </button>
              </div>
            )}

            {/* Approve - Client, WorkSubmitted status */}
            {isClient && status === 1 && (
              <button
                onClick={handleApprove}
                disabled={isPending || isConfirming}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium"
              >
                {isPending ? 'Confirm in wallet...' : isConfirming ? 'Approving...' : 'Approve Work'}
              </button>
            )}

            {/* Claim - Collaborator, Approved/Resolved status */}
            {isCollaborator && (status === 2 || status === 4) && (
              <button
                onClick={handleClaim}
                disabled={isPending || isConfirming}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium"
              >
                {isPending ? 'Confirm in wallet...' : isConfirming ? 'Claiming...' : 'Claim Payout'}
              </button>
            )}
          </div>

          {/* Transaction Success */}
          {isSuccess && txHash && (
            <div className="text-center text-green-400">
              ✅ Transaction successful!{' '}
              <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">
                View
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
