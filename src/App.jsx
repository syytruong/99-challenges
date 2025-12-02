import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDown, Search, X, RefreshCw, Loader2, Info } from 'lucide-react';

// --- CONSTANTS & CONFIG ---
const PRICES_URL = 'https://interview.switcheo.com/prices.json';
const IMG_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';

// --- MOCK SERVICES ---
const mockSwapTransaction = (fromToken, toToken, amount) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 90% success rate
      if (Math.random() > 0.1) {
        resolve({ status: 'success', hash: '0x123...abc' });
      } else {
        reject(new Error('Slippage tolerance exceeded. Please try again.'));
      }
    }, 1500);
  });
};

// --- COMPONENTS ---

// 1. Token Icon with robust fallback
const TokenIcon = ({ symbol, className = "w-6 h-6" }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`${className} bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 select-none`}>
        {symbol?.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={`${IMG_BASE_URL}${symbol}.svg`}
      alt={symbol}
      className={`${className} select-none`}
      onError={() => setError(true)}
    />
  );
};

// 2. Modal for selecting tokens
const TokenSelectModal = ({ isOpen, onClose, tokens, onSelect }) => {
  const [search, setSearch] = useState('');

  // Optimization: Memoize filtered list to prevent lag on large lists
  const filteredTokens = useMemo(() => {
    return tokens.filter(t => 
      t.currency.toLowerCase().includes(search.toLowerCase())
    );
  }, [tokens, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Select Token</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white text-slate-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredTokens.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No tokens found</div>
          ) : (
            filteredTokens.map((token) => (
              <button
                key={`${token.currency}-${token.price}-${Math.random()}`} 
                onClick={() => {
                  onSelect(token);
                  onClose();
                  setSearch('');
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0 text-left"
              >
                <TokenIcon symbol={token.currency} className="w-8 h-8" />
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">{token.currency}</span>
                  {token.price && (
                    <span className="text-xs text-slate-500">${token.price.toFixed(4)}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Main Application Component
const App = () => {
  // --- STATE ---
  const [prices, setPrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  
  // Form State
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [amount, setAmount] = useState('');
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null); // 'from' or 'to' or null
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(PRICES_URL);
        if (!response.ok) throw new Error('Failed to fetch prices');
        const data = await response.json();
        
        // Transform data: ensure uniqueness and proper formatting
        const uniqueTokens = Array.from(new Set(data.map(item => item.currency)))
          .map(currency => {
            return data.find(item => item.currency === currency);
          });

        setPrices(uniqueTokens);
        
        // Set defaults
        setFromToken(uniqueTokens.find(t => t.currency === 'ETH') || uniqueTokens[0]);
        setToToken(uniqueTokens.find(t => t.currency === 'USD') || uniqueTokens[1]);
      } catch (err) {
        console.error(err);
        setFeedback({ type: 'error', message: 'Failed to load token prices. Please refresh.' });
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPrices();
  }, []);

  // --- CALCULATIONS ---
  const exchangeRate = useMemo(() => {
    if (!fromToken || !toToken || !fromToken.price || !toToken.price) return 0;
    return fromToken.price / toToken.price;
  }, [fromToken, toToken]);

  const outputAmount = useMemo(() => {
    const val = parseFloat(amount);
    if (isNaN(val)) return '';
    return (val * exchangeRate).toFixed(6);
  }, [amount, exchangeRate]);

  // --- HANDLERS ---
  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleMaxClick = () => {
    setAmount('10.5432'); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await mockSwapTransaction(fromToken, toToken, amount);
      setFeedback({ type: 'success', message: `Successfully swapped ${amount} ${fromToken.currency} to ${outputAmount} ${toToken.currency}` });
      setAmount('');
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER HELPERS ---
  if (loadingPrices) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
         <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-slate-900 relative">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800/50">
        
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Swap</h1>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-1">
          
          {/* FROM Input Block */}
          <div className="bg-slate-50 p-4 rounded-2xl hover:bg-slate-100 transition-colors group border border-transparent focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-500">From</span>
              <span className="text-sm text-indigo-600 font-medium cursor-pointer hover:text-indigo-700" onClick={handleMaxClick}>
                Balance: 10.5432
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="0.0"
                className="bg-transparent text-3xl font-bold text-slate-800 w-full outline-none placeholder:text-slate-300"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setModalType('from')}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-200"
              >
                <TokenIcon symbol={fromToken?.currency} />
                <span className="font-bold text-slate-700">{fromToken?.currency}</span>
                <ArrowDown size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {amount && fromToken?.price ? `≈ $${(parseFloat(amount) * fromToken.price).toFixed(2)}` : '$0.00'}
            </div>
          </div>

          {/* Swap Indicator/Button */}
          <div className="relative h-4">
            <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
              <button 
                type="button"
                onClick={handleSwapTokens}
                className="bg-slate-100 p-2 rounded-xl border-4 border-white hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm active:rotate-180"
              >
                <ArrowDown size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* TO Input Block (Read Only) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-transparent">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-500">To</span>
            </div>
            
            <div className="flex items-center gap-4">
              <input 
                type="text" 
                readOnly
                placeholder="0.0"
                className="bg-transparent text-3xl font-bold text-slate-800 w-full outline-none placeholder:text-slate-300"
                value={outputAmount}
              />
              <button 
                type="button"
                onClick={() => setModalType('to')}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-200"
              >
                <TokenIcon symbol={toToken?.currency} />
                <span className="font-bold text-slate-700">{toToken?.currency}</span>
                <ArrowDown size={16} className="text-slate-400" />
              </button>
            </div>
             <div className="mt-2 text-sm text-slate-400">
             {outputAmount && toToken?.price ? `≈ $${(parseFloat(outputAmount) * toToken.price).toFixed(2)}` : '$0.00'}
            </div>
          </div>

          {/* Exchange Rate Info */}
          {exchangeRate > 0 && (
            <div className="px-2 py-3 flex items-center justify-between text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <Info size={14} /> Price
              </span>
              <span>
                1 {fromToken?.currency} = {exchangeRate.toFixed(5)} {toToken?.currency}
              </span>
            </div>
          )}

          {/* Action Button */}
          <button 
            type="submit"
            disabled={!amount || isSubmitting || parseFloat(amount) <= 0}
            className={`
              w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] mt-2 flex items-center justify-center gap-2
              ${!amount || parseFloat(amount) <= 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Swapping...
              </>
            ) : (
              !amount ? 'Enter Amount' : 'Swap Now'
            )}
          </button>
        </form>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`
          fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-xl font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 flex items-center gap-2
          ${feedback.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}
        `}>
          {feedback.type === 'success' ? (
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
          ) : (
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
          )}
          {feedback.message}
        </div>
      )}

      {/* Token Select Modal */}
      <TokenSelectModal 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)} 
        tokens={prices}
        onSelect={(token) => {
          if (modalType === 'from') setFromToken(token);
          if (modalType === 'to') setToToken(token);
        }}
      />
    </div>
  );
};

export default App;