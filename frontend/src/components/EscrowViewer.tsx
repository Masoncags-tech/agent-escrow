'use client'

import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { CONTRACT_ADDRESS } from '@/config/wagmi'
import abi from '@/abi/AgentEscrow.json'
import { Search, User, Users, FileCheck, Loader2, Check, ExternalLink, AlertCircle, Clock, DollarSign, Copy, CheckCircle, Circle, AlertTriangle, XCircle } from 'lucide-react'

const STATUS_CONFIG = [
  { label: 'Active', color: 'bg-info/10 text-blue-400', dot: 'bg-blue-400', icon: Circle },
  { label: 'Work Submitted', color: 'bg-warning/10 text-warning', dot: 'bg-warning', icon: Clock },
  { label: 'Approved', color: 'bg-success/10 text-success', dot: 'bg-success', icon: CheckCircle },
  { label: 'Disputed', color: 'bg-error/10 text-error', dot: 'bg-error', icon: AlertTriangle },
  { label: 'Resolved', color: 'bg-purple-500/10 text-purple-400', dot: 'bg-purple-400', icon: CheckCircle },
  { label: 'Cancelled', color: 'bg-zinc-500/10 text-zinc-400', dot: 'bg-zinc-400', icon: XCircle },
]

const TIMELINE_STEPS = [
  { key: 'created', label: 'Created' },
  { key: 'submitted', label: 'Work Submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'claimed', label: 'Claimed' },
]

export function EscrowViewer() {
  const { address } = useAccount()
  const [escrowId, setEscrowId] = useState('')
  const [proofURI, setProofURI] = useState('')
  const [copied, setCopied] = useState(false)

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

  const { writeContract, data: txHash, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const escrow = escrowData as any
  const collabs = collaboratorsData as any

  const isClient = escrow && address?.toLowerCase() === escrow[1]?.toLowerCase()
  const isCollaborator = collabs && collabs[0]?.some((addr: string) => addr.toLowerCase() === address?.toLowerCase())
  const status = escrow ? Number(escrow[10]) : -1
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG[0]
  const StatusIcon = statusConfig.icon

  // Check if all collaborators have claimed
  const allClaimed = collabs?.[2]?.every((claimed: boolean) => claimed) || false
  const userCollabIndex = collabs?.[0]?.findIndex((addr: string) => addr.toLowerCase() === address?.toLowerCase())
  const userHasClaimed = userCollabIndex >= 0 && collabs?.[2]?.[userCollabIndex]

  useEffect(() => {
    if (isSuccess) {
      refetch()
      reset()
    }
  }, [isSuccess, refetch, reset])

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

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Progress timeline calculation
  const getTimelineStatus = () => {
    const steps = {
      created: true,
      submitted: status >= 1,
      approved: status >= 2 || status === 4,
      claimed: allClaimed,
    }
    const current = 
      allClaimed ? 'claimed' :
      (status >= 2 || status === 4) ? 'approved' :
      status >= 1 ? 'submitted' :
      'created'
    return { steps, current }
  }

  const timeline = getTimelineStatus()

  // Progress Timeline Component
  const ProgressTimeline = () => (
    <div className="progress-timeline my-4">
      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = timeline.steps[step.key as keyof typeof timeline.steps]
        const isCurrent = timeline.current === step.key
        
        return (
          <div key={step.key} className="progress-step">
            <div className={`progress-step-icon ${isCompleted ? 'completed' : ''} ${isCurrent && !isCompleted ? 'current' : ''}`}>
              {isCompleted ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-current opacity-30" />
              )}
            </div>
            <span className={`progress-step-label ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
          <Search className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">View Escrow</h2>
          <p className="text-sm text-muted">Track and manage escrows</p>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="number"
          value={escrowId}
          onChange={(e) => setEscrowId(e.target.value)}
          placeholder="Enter Escrow ID (0, 1, 2...)"
          className="input pl-11"
        />
      </div>

      {escrow && escrow[1] !== '0x0000000000000000000000000000000000000000' ? (
        <div className="space-y-4 animate-fade-in">
          {/* Header: ID + Status + Amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">Escrow #{escrowId}</span>
              <div className={`status-badge ${statusConfig.color}`}>
                <span className={`status-dot ${statusConfig.dot}`} />
                {statusConfig.label}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-success">
                ${formatUnits(escrow[3] || 0n, 6)}
              </div>
              <div className="text-xs text-muted">USDC</div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="card-elevated p-4 rounded-xl">
            <p className="text-xs text-muted mb-2 font-medium uppercase tracking-wide">Progress</p>
            <ProgressTimeline />
          </div>

          {/* Description */}
          {escrow[8] && (
            <div className="card-elevated p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-muted mb-2">
                <FileCheck className="w-3 h-3" />
                Description
              </div>
              <p className="text-sm">{escrow[8]}</p>
            </div>
          )}

          {/* Client */}
          <div className="card-elevated p-4 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-muted mb-2">
              <User className="w-3 h-3" />
              Client
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">{escrow[1]?.slice(0, 10)}...{escrow[1]?.slice(-8)}</span>
              <div className="flex items-center gap-2">
                {isClient && (
                  <span className="px-2 py-0.5 rounded-full bg-info/10 text-blue-400 text-xs font-medium">You</span>
                )}
                <button 
                  onClick={() => copyAddress(escrow[1])}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-3 h-3 text-muted" />
                </button>
              </div>
            </div>
          </div>

          {/* Collaborators */}
          {collabs && collabs[0]?.length > 0 && (
            <div className="card-elevated p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-muted mb-3">
                <Users className="w-3 h-3" />
                Collaborators ({collabs[0].length})
              </div>
              <div className="space-y-3">
                {collabs[0]?.map((addr: string, i: number) => {
                  const split = Number(collabs[1][i]) / 100
                  const amount = parseFloat(formatUnits(escrow[3] || 0n, 6)) * (split / 100)
                  const hasClaimed = collabs[2][i]
                  const isUser = addr.toLowerCase() === address?.toLowerCase()
                  
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-default last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          hasClaimed ? 'bg-success/20 text-success' : 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white'
                        }`}>
                          {hasClaimed ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              {addr.slice(0, 6)}...{addr.slice(-4)}
                            </span>
                            {isUser && (
                              <span className="px-2 py-0.5 rounded-full bg-info/10 text-blue-400 text-xs font-medium">You</span>
                            )}
                          </div>
                          <span className="text-xs text-muted">
                            {split}% → ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasClaimed ? (
                          <span className="text-xs text-success flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Claimed
                          </span>
                        ) : isUser && (status === 2 || status === 4) ? (
                          <button
                            onClick={handleClaim}
                            disabled={isPending || isConfirming}
                            className="btn btn-success py-1.5 px-3 text-xs"
                          >
                            {isPending || isConfirming ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Claim'
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Proof URI */}
          {escrow[9] && (
            <div className="card-elevated p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-muted mb-2">
                <ExternalLink className="w-3 h-3" />
                Work Proof
              </div>
              <a 
                href={escrow[9]} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-brand hover:underline text-sm break-all flex items-center gap-1"
              >
                {escrow[9]}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {/* Submit Work - Collaborator, Active status */}
            {isCollaborator && status === 0 && (
              <div className="card-elevated p-4 rounded-xl space-y-3">
                <p className="text-sm font-medium">Submit Your Work</p>
                <input
                  type="text"
                  value={proofURI}
                  onChange={(e) => setProofURI(e.target.value)}
                  placeholder="Proof URI (IPFS, GitHub, etc.)"
                  className="input"
                />
                <button
                  onClick={handleSubmitWork}
                  disabled={isPending || isConfirming || !proofURI}
                  className="btn btn-primary w-full"
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isPending ? 'Confirm in wallet...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      Submit Work
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Approve - Client, WorkSubmitted status */}
            {isClient && status === 1 && (
              <button
                onClick={handleApprove}
                disabled={isPending || isConfirming}
                className="btn btn-success w-full"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isPending ? 'Confirm in wallet...' : 'Approving...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Approve Work
                  </>
                )}
              </button>
            )}
          </div>

          {/* Transaction Success */}
          {isSuccess && txHash && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3 animate-fade-in">
              <Check className="w-5 h-5 text-success" />
              <div className="flex-1">
                <p className="text-sm font-medium text-success">Transaction successful!</p>
              </div>
              <a 
                href={`https://basescan.org/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-success hover:underline text-sm flex items-center gap-1"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      ) : escrowId && escrow ? (
        <div className="text-center py-8 animate-fade-in">
          <AlertCircle className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">Escrow not found</p>
        </div>
      ) : !escrowId ? (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
          <p className="text-muted">Enter an escrow ID to view details</p>
        </div>
      ) : null}
    </div>
  )
}
