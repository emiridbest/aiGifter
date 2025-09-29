"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  useConnect,
  useAccount,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useChainId
} from "wagmi";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { cn } from "../lib/utils";


import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { config } from "./providers/WagmiProvider";
import { stableTokenABI } from "@celo/abis";
import { toast } from "sonner";

export default function Header() {
  // Token addresses
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  
  // State
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [baseBalance, setbaseBalance] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const baseChainId = config.chains[0].id;
  const publicClient = usePublicClient({ chainId: baseChainId });
  const {
    switchChain,
    error: switchChainError,
    isError: isSwitchChainError,
    isPending: isSwitchChainPending,
  } = useSwitchChain();

  const chainId = useChainId();


  const usdcResult = useReadContract({
    abi: stableTokenABI,
    address: USDC_ADDRESS,
    functionName: "balanceOf",
    args: [address ?? "0x"],
    query: { enabled: !!address && isConnected }
  });
 

  const handleSwitchChain = useCallback(() => {
    switchChain({ chainId: baseChainId });
  }, [switchChain, baseChainId]);
  // Auto-connect and network switching for Farcaster
  useEffect(() => {
    const switchTobase = async () => {
      if (!isConnected || isConnected && chainId !== baseChainId) {
        try {
          toast.info("Switching to base network...");
          handleSwitchChain();
          await new Promise(resolve => setTimeout(resolve, 3000));
          if (chainId == baseChainId) {
            const connector = connectors.find((c) => c.id === "miniAppConnector") || connectors[0];
            connect({
              connector,
              chainId: baseChainId,
            });
            toast.success("Connected to base network successfully!");
          } else {
            throw new Error("Failed to switch to base network");
          }
        } catch (error) {
          console.error("Connection error:", error);
        }
      }
    };

    switchTobase();
  }, [connect, connectors, chainId, baseChainId, handleSwitchChain, isConnected]);


  // Fetch balances
  useEffect(() => {
    if (isConnected && address && publicClient ) {
      const fetchbaseBalance = async () => {
        try {
          const balance = await publicClient.getBalance({ address });
          setbaseBalance(Number(balance));
        } catch (error) {
          console.error("Error fetching base balance:", error);
        }
      };

      if (usdcResult.data) {
        setUsdcBalance(Number(usdcResult.data));
      }

      fetchbaseBalance();
    }
  }, [
    isConnected,
    address,
    publicClient,
    usdcResult.data,
  ]);

  // Click outside handler for dropdown
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Format address for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Format balance for display
  const formatBalance = (balance: number, decimals: number = 18) => {
    return (balance / Math.pow(10, decimals)).toFixed(4);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-purple-200  shadow-sm">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
           
            <span className="ml-2 font-bold text-lg text-purple-600 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>Mystery Box</span>
          </div>

          {/* Connection Status & Controls */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
               
                {/* Mobile View */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Bars3Icon className="h-5 w-5 text-purple-700" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px]">
                      <div className="flex flex-col space-y-4 mt-8">
                        {/* Wallet Info */}
                        <div className="bg-purple-800 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-white/70 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {address ? address.substring(2, 4).toUpperCase() : ''}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{formatAddress(address)}</p>
                              <p className="text-xs text-purple-500">Connected</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>base:</span>
                              <span className="font-medium">{formatBalance(baseBalance)}</span>
                            </div>
                            
                          </div>
                        </div>
                        
                        {/* Navigation */}
                        <Link
                          href="/"
                          className={cn(
                            "py-3 px-4 rounded-lg transition-all duration-300 text-center",
                            pathname === "/"
                              ? "bg-purple text-white"
                              : "hover:bg-purple-100 bg-purple-800"
                          )}
                        >
                          Home
                        </Link>
                        
                        {/* Disconnect Button */}
                        <Button
                          variant="outline"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => disconnect()}
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <Button
                className="rounded-full bg-purple-900 font-medium"
                onClick={() => {
                  const connector = connectors.find((c) => c.id === "miniAppConnector") || connectors[1];
                  connect({ connector, chainId: baseChainId });
                }}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


declare global {
  interface Window {
    ethereum: any;
    farcaster: any;
  }
}
