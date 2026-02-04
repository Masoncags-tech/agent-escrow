import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'AgentEscrow' }),
  ],
  transports: {
    [base.id]: http(),
  },
})

export const CONTRACT_ADDRESS = '0xefD02C79D9A386ebEcC9B16A2f43a7678a3F1b02' as const
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const
