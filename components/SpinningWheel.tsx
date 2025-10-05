"use client";
import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Sparkles, Gift } from "lucide-react";

interface SpinningWheelProps {
    onSpin?: (percentage: number) => void;
    isSpinning?: boolean;
}

export default function SpinningWheel({ onSpin, isSpinning = false }: SpinningWheelProps) {
    const [currentPercentage, setCurrentPercentage] = useState<number | null>(null);
    const [spinning, setSpinning] = useState(false);

    const handleSpin = useCallback(() => {
        if (spinning || isSpinning) return;
        
        setSpinning(true);
        setCurrentPercentage(null);
        
        // Generate random percentage between 1-20
        const randomPercentage = Math.floor(Math.random() * 20) + 1;
        
        // Simulate spinning animation
        setTimeout(() => {
            setCurrentPercentage(randomPercentage);
            setSpinning(false);
            onSpin?.(randomPercentage);
        }, 3000); // 3 second spin animation
    }, [spinning, isSpinning, onSpin]);

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
            <div className="relative">
                {/* Spinning Wheel */}
                <div className={`w-48 h-48 rounded-full border-8 border-purple-500 bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 shadow-2xl transition-all duration-300 ${
                    spinning ? 'animate-spin' : ''
                }`}>
                    
                    {/* Wheel Segments Visual */}
                    <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                        {/* Percentage Display */}
                        <div className="text-center">
                            {spinning ? (
                                <div className="flex flex-col items-center">
                                    <Sparkles className="h-8 w-8 text-purple-500 animate-pulse mb-2" />
                                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                                        Spinning...
                                    </span>
                                </div>
                            ) : currentPercentage ? (
                                <div className="flex flex-col items-center">
                                    <Gift className="h-8 w-8 text-yellow-500 mb-2" />
                                    <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                        {currentPercentage}%
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Lucky!
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Gift className="h-8 w-8 text-purple-500 mb-2" />
                                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                                        Mystery Box
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        1-20% of faucet
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Pointer */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-red-500"></div>
                    </div>
                </div>
            </div>
            
            <Button 
                onClick={handleSpin}
                disabled={spinning || isSpinning}
                className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all"
            >
                {spinning || isSpinning ? (
                    <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Spinning...
                    </>
                ) : (
                    <>
                        <Gift className="h-4 w-4 mr-2" />
                        Spin the Wheel!
                    </>
                )}
            </Button>
            
            {currentPercentage && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        You won <span className="font-bold text-purple-600 dark:text-purple-400">{currentPercentage}%</span> of the faucet balance!
                        <br/>Now type, Send it, to claim your reward.
                    </p>
                </div>
            )}
        </div>
    );
}
