'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACT_ADDRESS, USDC_ADDRESS } from '@/config/wagmi'
import abi from '@/abi/AgentEscrow.json'
import { Plus, X, Loader2, Check, Wallet, FileText, DollarSign, Users, ArrowRight, Copy, ExternalLink, Sparkles } from 'lucide-react'

const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

interface Collaborator {
  address: string
  split: number
}

type Step = 1 | 2 | 3 | 4

export function CreateEscrow() {
  const { isConnected, address } = useAccount()
  const [step, setStep] = useState<Step>(1)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { address: '', split: 100 }
  ])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [txStep, setTxStep] = useState<'idle' | 'approve' | 'create' | 'done'>('idle')
  const [createdEscrowId, setCreatedEscrowId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Get USDC balance
  const { data: balanceData } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  const balance = balanceData ? formatUnits(balanceData as bigint, 6) : '0'

  const { writeContract: approve, data: approveHash, isPending: isApproving, reset: resetApprove } = useWriteContract()
  const { writeContract: create, data: createHash, isPending: isCreating, reset: resetCreate } = useWriteContract()
  
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isLoading: isCreateConfirming, isSuccess: isCreateConfirmed, data: createReceipt } = useWaitForTransactionReceipt({ hash: createHash })

  const totalSplit = collaborators.reduce((sum, c) => sum + c.split, 0)
  const isValidSplit = totalSplit === 100
  const amountNum = parseFloat(amount) || 0
  const hasEnoughBalance = parseFloat(balance) >= amountNum

  // Move to next step after approval
  useEffect(() => {
    if (isApproveConfirmed && txStep === 'approve') {
      setTxStep('create')
    }
  }, [isApproveConfirmed, txStep])

  // Handle success
  useEffect(() => {
    if (isCreateConfirmed && createReceipt) {
      setTxStep('done')
      // Try to extract escrow ID from logs
      // For now, just show success
    }
  }, [isCreateConfirmed, createReceipt])

  const addCollaborator = () => {
    setCollaborators([...collaborators, { address: '', split: 0 }])
  }

  const removeCollaborator = (index: number) => {
    setCollaborators(collaborators.filter((_, i) => i !== index))
  }

  const updateCollaborator = (index: number, field: 'address' | 'split', value: string | number) => {
    const updated = [...collaborators]
    if (field === 'address') {
      updated[index].address = value as string
    } else {
      updated[index].split = Math.max(0, Math.min(100, Number(value)))
    }
    setCollaborators(updated)
  }

  const handleApprove = () => {
    const amountInUnits = parseUnits(amount, 6)
    approve({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, amountInUnits],
    })
    setTxStep('approve')
  }

  const handleCreate = () => {
    const amountInUnits = parseUnits(amount, 6)
    const addresses = collaborators.map(c => c.address as `0x${string}`)
    const splits = collaborators.map(c => BigInt(c.split * 100))
    
    create({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'createEscrow',
      args: [addresses, splits, amountInUnits, description],
    })
  }

  const resetForm = () => {
    setStep(1)
    setCollaborators([{ address: '', split: 100 }])
    setAmount('')
    setDescription('')
    setTxStep('idle')
    setCreatedEscrowId(null)
    resetApprove()
    resetCreate()
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canProceedStep1 = isConnected
  const canProceedStep2 = description.trim().length > 0 && amountNum > 0 && hasEnoughBalance
  const canProceedStep3 = isValidSplit && collaborators.every(c => c.address.startsWith('0x') && c.address.length === 42)

  // Step indicator component
  const StepIndicator = () => (
    <div className="step-indicator">
      {[
        { num: 1, label: 'Connect' },
        { num: 2, label: 'Details' },
        { num: 3, label: 'Split' },
        { num: 4, label: 'Create' },
      ].map(({ num, label }) => (
        <div key={num} className="step-item">
          <div className={`step-number ${step === num ? 'active' : step > num ? 'completed' : ''}`}>
            {step > num ? <Check className="w-4 h-4" /> : num}
          </div>
          <span className={`step-label ${step === num ? 'active' : step > num ? 'completed' : ''}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )

  // Success state
  if (txStep === 'done') {
    return (
      <div className="card p-6 sm:p-8">
        <div className="text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Escrow Created!</h3>
          <p className="text-muted text-sm mb-6">Your escrow has been deployed to Base</p>
          
          <div className="space-y-4">
            <a 
              href={`https://basescan.org/tx/${createHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-brand hover:underline text-sm"
            >
              View transaction on Basescan
              <ExternalLink className="w-3 h-3" />
            </a>
            
            <div className="flex gap-3">
              <button onClick={resetForm} className="btn btn-secondary flex-1">
                Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
          <Plus className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Create Escrow</h2>
          <p className="text-sm text-muted">Set up a new collaboration</p>
        </div>
      </div>

      <StepIndicator />

      {/* Step 1: Connect Wallet */}
      {step === 1 && (
        <div className="animate-fade-in">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-muted" />
            </div>
            {isConnected ? (
              <>
                <h3 className="text-lg font-semibold mb-2 text-success">Wallet Connected</h3>
                <p className="text-muted text-sm mb-6">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <button onClick={() => setStep(2)} className="btn btn-primary">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-muted text-sm mb-6">
                  Connect your wallet to create an escrow
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Description + Amount */}
      {step === 2 && (
        <div className="animate-fade-in space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm text-muted mb-2">
              <FileText className="w-4 h-4" />
              What work needs to be done?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project or deliverables..."
              className="textarea"
              rows={3}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-muted mb-2">
              <DollarSign className="w-4 h-4" />
              Total Amount (USDC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              className="input text-lg font-semibold"
            />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-muted">Your balance: {parseFloat(balance).toLocaleString()} USDC</span>
              {amountNum > 0 && hasEnoughBalance && (
                <span className="text-success flex items-center gap-1">
                  <Check className="w-3 h-3" /> Sufficient balance
                </span>
              )}
              {amountNum > 0 && !hasEnoughBalance && (
                <span className="text-error">Insufficient balance</span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">
              Back
            </button>
            <button 
              onClick={() => setStep(3)} 
              disabled={!canProceedStep2}
              className="btn btn-primary flex-1"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Collaborators with Visual Split Bars */}
      {step === 3 && (
        <div className="animate-fade-in space-y-4">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm text-muted">
              <Users className="w-4 h-4" />
              Who receives the funds?
            </label>
            <div className={`status-badge ${isValidSplit ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              <span className={`status-dot ${isValidSplit ? 'bg-success' : 'bg-error'}`} />
              {totalSplit}% allocated
            </div>
          </div>

          <div className="space-y-3">
            {collaborators.map((collab, index) => {
              const usdcAmount = amountNum * (collab.split / 100)
              return (
                <div key={index} className="card-elevated p-4 animate-slide-in">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={collab.address}
                        onChange={(e) => updateCollaborator(index, 'address', e.target.value)}
                        placeholder="0x wallet address..."
                        className="input font-mono text-sm mb-2"
                      />
                      
                      {/* Visual Split Bar */}
                      <div className="split-bar mb-2">
                        <div 
                          className="split-bar-fill" 
                          style={{ width: `${Math.min(100, collab.split)}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={collab.split}
                            onChange={(e) => updateCollaborator(index, 'split', e.target.value)}
                            className="input w-20 text-center py-1.5 text-sm"
                            min="0"
                            max="100"
                          />
                          <span className="text-muted text-sm">%</span>
                        </div>
                        <span className="text-success font-semibold">
                          ${usdcAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                        </span>
                      </div>
                    </div>
                    
                    {collaborators.length > 1 && (
                      <button
                        onClick={() => removeCollaborator(index)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={addCollaborator}
            className="w-full px-4 py-3 rounded-xl border border-dashed border-default text-muted hover:border-brand hover:text-brand transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Collaborator
          </button>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(2)} className="btn btn-secondary flex-1">
              Back
            </button>
            <button 
              onClick={() => setStep(4)} 
              disabled={!canProceedStep3}
              className="btn btn-primary flex-1"
            >
              Review
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review + Create */}
      {step === 4 && (
        <div className="animate-fade-in space-y-4">
          {/* Summary Card */}
          <div className="card-elevated p-4 space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-muted flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted mb-1">Description</p>
                <p className="text-sm">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-muted" />
              <div>
                <p className="text-xs text-muted mb-0.5">Total Amount</p>
                <p className="text-lg font-bold text-success">${parseFloat(amount).toLocaleString()} USDC</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted" />
              <div>
                <p className="text-xs text-muted mb-0.5">Collaborators</p>
                <p className="text-sm">{collaborators.length} recipient{collaborators.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Transaction Steps */}
          <div className="space-y-3">
            {/* Approve Step */}
            <div className={`card-elevated p-4 ${txStep !== 'idle' && txStep !== 'approve' ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isApproveConfirmed ? 'bg-success' : 'bg-secondary'
                  }`}>
                    {isApproveConfirmed ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-sm font-bold">1</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Approve USDC Spending</p>
                    <p className="text-xs text-muted">Allow contract to use your USDC</p>
                  </div>
                </div>
                
                {txStep === 'idle' && (
                  <button onClick={handleApprove} className="btn btn-primary py-2 px-4 text-sm">
                    Approve
                  </button>
                )}
                {(txStep === 'approve' && (isApproving || isApproveConfirming)) && (
                  <div className="flex items-center gap-2 text-muted text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isApproving ? 'Confirm in wallet...' : 'Confirming...'}
                  </div>
                )}
                {isApproveConfirmed && (
                  <span className="text-success text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" /> Done
                  </span>
                )}
              </div>
            </div>

            {/* Create Step */}
            <div className={`card-elevated p-4 ${txStep !== 'create' ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCreateConfirmed ? 'bg-success' : 'bg-secondary'
                  }`}>
                    {isCreateConfirmed ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-sm font-bold">2</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Create Escrow</p>
                    <p className="text-xs text-muted">Deploy your escrow contract</p>
                  </div>
                </div>
                
                {txStep === 'create' && !isCreating && !isCreateConfirming && (
                  <button onClick={handleCreate} className="btn btn-success py-2 px-4 text-sm">
                    Create
                  </button>
                )}
                {txStep === 'create' && (isCreating || isCreateConfirming) && (
                  <div className="flex items-center gap-2 text-muted text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isCreating ? 'Confirm in wallet...' : 'Creating...'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => { setStep(3); setTxStep('idle'); }} 
              className="btn btn-secondary flex-1"
              disabled={txStep !== 'idle'}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
