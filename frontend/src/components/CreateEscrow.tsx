'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACT_ADDRESS, USDC_ADDRESS } from '@/config/wagmi'
import abi from '@/abi/AgentEscrow.json'

const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

interface Collaborator {
  address: string
  split: number
}

export function CreateEscrow() {
  const { address, isConnected } = useAccount()
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { address: '', split: 100 }
  ])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [step, setStep] = useState<'form' | 'approve' | 'create' | 'done'>('form')

  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract()
  const { writeContract: create, data: createHash, isPending: isCreating } = useWriteContract()
  
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isLoading: isCreateConfirming, isSuccess: isCreateConfirmed } = useWaitForTransactionReceipt({ hash: createHash })

  const totalSplit = collaborators.reduce((sum, c) => sum + c.split, 0)
  const isValidSplit = totalSplit === 100

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
      updated[index].split = Number(value)
    }
    setCollaborators(updated)
  }

  const handleApprove = () => {
    const amountInUnits = parseUnits(amount, 6) // USDC has 6 decimals
    approve({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, amountInUnits],
    })
    setStep('approve')
  }

  const handleCreate = () => {
    const amountInUnits = parseUnits(amount, 6)
    const addresses = collaborators.map(c => c.address as `0x${string}`)
    const splits = collaborators.map(c => BigInt(c.split * 100)) // Convert % to basis points
    
    create({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'createEscrow',
      args: [addresses, splits, amountInUnits, description],
    })
    setStep('create')
  }

  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-400">Connect your wallet to create an escrow</p>
      </div>
    )
  }

  if (isCreateConfirmed) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <div className="text-green-400 text-xl mb-4">✅ Escrow Created!</div>
        <a 
          href={`https://basescan.org/tx/${createHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          View on Basescan →
        </a>
        <button
          onClick={() => {
            setStep('form')
            setCollaborators([{ address: '', split: 100 }])
            setAmount('')
            setDescription('')
          }}
          className="block mx-auto mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Create Another
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">Create New Escrow</h2>
      
      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What work needs to be done?"
          className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Amount */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Total Amount (USDC)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="100"
          className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Collaborators */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-gray-400">Collaborators</label>
          <span className={`text-sm ${isValidSplit ? 'text-green-400' : 'text-red-400'}`}>
            Total: {totalSplit}%
          </span>
        </div>
        
        {collaborators.map((collab, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={collab.address}
              onChange={(e) => updateCollaborator(index, 'address', e.target.value)}
              placeholder="0x..."
              className="flex-1 px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            <input
              type="number"
              value={collab.split}
              onChange={(e) => updateCollaborator(index, 'split', e.target.value)}
              placeholder="%"
              className="w-20 px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            {collaborators.length > 1 && (
              <button
                onClick={() => removeCollaborator(index)}
                className="px-3 py-3 bg-red-600 hover:bg-red-700 rounded-lg"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        
        <button
          onClick={addCollaborator}
          className="w-full mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
        >
          + Add Collaborator
        </button>
      </div>

      {/* Actions */}
      {step === 'form' && (
        <button
          onClick={handleApprove}
          disabled={!isValidSplit || !amount || !description || collaborators.some(c => !c.address)}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Approve USDC
        </button>
      )}

      {step === 'approve' && (
        <div className="space-y-3">
          {isApproving || isApproveConfirming ? (
            <div className="text-center text-gray-400">
              {isApproving ? 'Confirm in wallet...' : 'Waiting for confirmation...'}
            </div>
          ) : isApproveConfirmed ? (
            <button
              onClick={handleCreate}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
            >
              Create Escrow
            </button>
          ) : null}
        </div>
      )}

      {step === 'create' && (isCreating || isCreateConfirming) && (
        <div className="text-center text-gray-400">
          {isCreating ? 'Confirm in wallet...' : 'Creating escrow...'}
        </div>
      )}
    </div>
  )
}
