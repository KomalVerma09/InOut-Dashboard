import React, { createContext, useContext, ReactNode } from 'react'
import { useAccount, useBalance, useDisconnect, useChainId } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { formatEther, formatUnits } from 'viem'
import { CONTRACTS } from '../contracts'
import { isPolygonNetwork } from '../config/web3Config'
import toast from 'react-hot-toast'

interface WalletContextType {
  // Connection state
  isConnected: boolean
  address: string | undefined
  chainId: number
  isWrongNetwork: boolean
  
  // Balances
  orionBalance: number
  usdtBalance: number
  maticBalance: number
  totalValue: number
  
  // Actions
  disconnect: () => void
  refetchBalances: () => Promise<void>
  
  // Loading states
  isLoading: boolean
  isRefreshing: boolean
  lastUpdated: Date | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null)
  
  // Get MATIC balance
  const { data: maticBalanceData, isLoading: maticLoading, refetch: refetchMatic } = useBalance({
    address,
    chainId: polygon.id,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000, // Auto-refetch every 10 seconds
    },
  })
  
  // Get USDT balance
  const { data: usdtBalanceData, isLoading: usdtLoading, refetch: refetchUsdt } = useBalance({
    address,
    token: CONTRACTS.USDT_TOKEN.address,
    chainId: polygon.id,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000, // Auto-refetch every 10 seconds
    },
  })
  
  // Get ORION balance (mock for now since contract might not be deployed)
  const { data: orionBalanceData, isLoading: orionLoading, refetch: refetchOrion } = useBalance({
    address,
    token: CONTRACTS.ORION_TOKEN.address,
    chainId: polygon.id,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000, // Auto-refetch every 10 seconds
    },
  })

  // Check if on wrong network
  const isWrongNetwork = isConnected && !isPolygonNetwork(chainId)

  // Parse balances
  const maticBalance = maticBalanceData ? parseFloat(formatEther(maticBalanceData.value)) : 0
  const usdtBalance = usdtBalanceData ? parseFloat(formatUnits(usdtBalanceData.value, 6)) : 5544.86 // Mock fallback
  const orionBalance = orionBalanceData ? parseFloat(formatEther(orionBalanceData.value)) : 18522.072520 // Mock fallback

  // Calculate total value (mock calculation)
  const totalValue = (maticBalance * 0.5) + usdtBalance + (orionBalance * 0.25) // Mock prices

  // Loading state
  const isLoading = maticLoading || usdtLoading || orionLoading

  // Manual balance refresh function
  const refetchBalances = React.useCallback(async () => {
    if (!address || !isConnected) return
    
    try {
      setIsRefreshing(true)
      console.log('🔄 Manually refreshing all balances...')
      
      // Refetch all balances in parallel
      await Promise.all([
        refetchMatic(),
        refetchUsdt(), 
        refetchOrion()
      ])
      
      setLastUpdated(new Date())
      console.log('✅ All balances refreshed successfully')
      
    } catch (error) {
      console.error('❌ Error refreshing balances:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [address, isConnected, refetchMatic, refetchUsdt, refetchOrion])

  // Auto-refresh balances when address changes
  React.useEffect(() => {
    if (address && isConnected) {
      setLastUpdated(new Date())
    }
  }, [address, isConnected])

  // Update lastUpdated when any balance changes
  React.useEffect(() => {
    if (maticBalanceData || usdtBalanceData || orionBalanceData) {
      setLastUpdated(new Date())
    }
  }, [maticBalanceData, usdtBalanceData, orionBalanceData])

  // Show network warnings
  React.useEffect(() => {
    if (!isConnected) return
    
    if (isConnected && isWrongNetwork) {
      toast.error('Wrong network! Please switch to Polygon network.', {
        duration: 5000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      })
    } else if (isConnected && !isWrongNetwork) {
      toast.success('Connected to Polygon network!', {
        style: {
          background: '#1e40af',
          color: '#fff',
          border: '1px solid #3b82f6',
        },
      })
    }
  }, [isConnected, isWrongNetwork])

  const contextValue: WalletContextType = {
    // Connection state
    isConnected,
    address,
    chainId,
    isWrongNetwork,
    
    // Balances
    orionBalance,
    usdtBalance,
    maticBalance,
    totalValue,
    
    // Actions
    disconnect,
    refetchBalances,
    
    // Loading states
    isLoading,
    isRefreshing,
    lastUpdated,
  }

  // Always render the provider, even if there are errors
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}