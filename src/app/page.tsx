'use client'

import React, { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants'
import { parseEther } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, Loader2, Send, Wallet, History, Sparkles } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function CoffeeApp() {
  const { isConnected } = useAccount()
  const { writeContract, isPending, isSuccess, error } = useWriteContract()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  // 1. Data Read (Total Memos)
  const { data: memos, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getMemos',
  })

  // 2. Buy Coffee Function
  const handleBuyCoffee = () => {
    if (!name || !message) return
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'buyCoffee',
      args: [name, message],
      value: parseEther('0.001'),
    }, {
      onSuccess: () => {
        setName('')
        setMessage('')
        // Optionally refetch memos after a delay or listen to event
        setTimeout(() => refetch(), 5000) 
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Abstract Background Shapes Removed */}

      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-10 glass-panel border-b-0 rounded-none sticky top-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Coffee className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            CoffeeDApp
          </span>
        </div>
        <ConnectButton showBalance={false} chainStatus="icon" />
      </header>

      <main className="flex-grow container mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8 z-10">
        
        {/* Left Column: Buy Coffee Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 max-w-xl mx-auto w-full"
        >
          <div className="glass-panel p-8 rounded-2xl">
            <h1 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Buy me a Coffee
            </h1>
            <p className="text-neutral-400 mb-8">
              Support the build with 0.001 ETH and leave a message on the blockchain.
            </p>

            {isConnected ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Alice"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Message
                  </label>
                  <textarea
                    placeholder="Great work on the DApp!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleBuyCoffee}
                    disabled={isPending || !name || !message}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send 0.001 ETH
                      </>
                    )}
                  </button>
                  
                  {error && (
                    <p className="text-red-400 text-sm mt-3 bg-red-900/20 p-2 rounded border border-red-900/50">
                      Error: {error.message.split('.')[0]}
                    </p>
                  )}
                  
                  {isSuccess && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-green-400 text-sm mt-3 flex items-center gap-2 bg-green-900/20 p-2 rounded border border-green-900/50"
                    >
                      <Sparkles className="w-4 h-4" />
                      Transaction Sent! Thanks for the coffee.
                    </motion.p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 rounded-xl bg-white/5 border border-dashed border-white/10">
                <Wallet className="w-12 h-12 text-neutral-500" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Wallet Not Connected</h3>
                  <p className="text-neutral-400 text-sm max-w-xs mx-auto mt-1">
                    Please connect your wallet to start sending coffee and writing memos.
                  </p>
                </div>
                {/* RainbowKit Connect Button wrapper to look like a button if needed, but the header one is fine. 
                    We can just point them to the header or render another custom one. */}
                <div className="mt-4">
                  <ConnectButton />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Memos Feed */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 max-w-xl mx-auto w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <History className="text-blue-500" />
              Recent Memos
            </h2>
            <button 
              onClick={() => refetch()} 
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Refresh
            </button>
          </div>
          
          <div className="glass-panel rounded-2xl p-1 max-h-[600px] overflow-y-auto custom-scrollbar">
            {Array.isArray(memos) && memos.length > 0 ? (
               <div className="flex flex-col gap-2 p-4">
                 {[...memos].reverse().map((memo: any, idx: number) => (
                   <motion.div 
                     key={idx}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: idx * 0.05 }}
                     className="bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors"
                   >
                     <div className="flex justify-between items-start mb-2">
                       <span className="font-bold text-blue-300">{memo.name}</span>
                       <span className="text-xs text-neutral-500 font-mono">
                         {new Date(Number(memo.timestamp) * 1000).toLocaleDateString()}
                       </span>
                     </div>
                     <p className="text-neutral-200 text-sm leading-relaxed">"{memo.message}"</p>
                     <div className="mt-2 text-[10px] text-neutral-600 font-mono truncate">
                       From: {memo.from}
                     </div>
                   </motion.div>
                 ))}
               </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                <Coffee className="w-10 h-10 mb-2 opacity-20" />
                <p>No memos found yet.</p>
                <p className="text-xs">Be the first to send one!</p>
              </div>
            )}
          </div>
        </motion.div>

      </main>
    </div>
  )
}
