// @ts-nocheck
import { EVMWalletClient } from '@goat-sdk/wallet-evm';
import { Tool } from '@goat-sdk/core';
import { z } from 'zod';
import { EsusuParameters, EmptyParameters, UserAddressParameters } from './parameters';
import { contractAddress, abi } from "../lib/utils";


export class MysteryBoxFaucetService {

    private readonly contractAddress: string = contractAddress;
    private readonly abi = abi;
    private client: EVMWalletClient;


    /**
     * Claims a random percentage of the MysteryBox faucet balance for a specified user.
     * This can only be called by the authorized AI.
     * @param params The parameters for the tool, including the recipient's address and an optional amount.
     * @returns A promise that resolves with a message indicating the result of the claim.
     */
    @Tool({
        name: 'claimForUser',
        description: 'Claim tokens from the MysteryBox faucet for a specific user with a random percentage (1-20%)',
        parameters: EsusuParameters,
    })
    public async claimForUser(
        walletClient: EVMWalletClient,
        // @ts-ignore
        params: EsusuParameters
    ) {
        if (!params.recipient) {
            return 'A recipient address must be provided to claim for a user.';
        }
        if (!walletClient) {
            return 'Error: Wallet client is not initialized. Please ensure the plugin is configured.';
        }

        try {
            const percentage = params.amount || Math.floor(Math.random() * 20) + 1;

            // Use the provided walletClient to send the transaction
            const tx = await walletClient.sendTransaction({
                to: this.contractAddress,
                abi: this.abi,
                functionName: 'claimForUser',
                args: [params.recipient, percentage]
            });

            // Wait for receipt if publicClient is available
            if (walletClient.publicClient && typeof walletClient.publicClient.waitForTransactionReceipt === 'function') {
                try {
                    const receipt = await walletClient.publicClient.waitForTransactionReceipt({ hash: tx });
                    if ((receipt as any).status === 'success' || (receipt as any).status === 1) {
                        return `Successfully initiated claim for ${percentage}% of the faucet balance for user ${params.recipient}. Transaction hash: ${tx}`;
                    }
                    return `Claim transaction for ${params.recipient} may have failed. Transaction hash: ${tx}`;
                } catch (receiptErr) {
                    // If waiting fails, still return tx hash so user can check manually
                    console.error('Error waiting for receipt:', receiptErr);
                    return `Transaction sent for ${params.recipient} (tx: ${tx}). Waiting for confirmation failed; please check the transaction status on the explorer.`;
                }
            }

            return `Transaction sent for ${params.recipient}. Transaction hash: ${tx}`;
        } catch (error: any) {
            console.error('Error claiming tokens for user:', error?.message ?? error);
            if (String(error?.message || '').includes('Wait for cooldown')) {
                const cooldownTime = await this.getTimeUntilNextClaim(walletClient, { userAddress: params.recipient });
                return `The user ${params.recipient} cannot claim yet. ${cooldownTime}`;
            }
            return `Failed to claim tokens for ${params.recipient}. ${error?.message ?? 'Unknown error.'}`;
        }
    }

    // @ts-ignore
    @Tool({
        name: 'fundFaucet',
        description: 'Fund the MysteryBox faucet with tokens'
    })
    async fundFaucet(
        walletClient: EVMWalletClient,
        parameters: EsusuParameters
    ): Promise<string> {
        if (!parameters.amount) {
            throw new Error('Amount is required');
        }
        if (!walletClient) {
            return 'Error: Wallet client is not available for funding.';
        }

        try {
            const tx = await walletClient.sendTransaction({
                to: this.contractAddress,
                abi: this.abi,
                functionName: 'fundFaucet',
                args: [parameters.amount]
            });
            return tx.hash;
        } catch (err: any) {
            console.error('Error funding faucet:', err?.message ?? err);
            return `Failed to fund faucet: ${err?.message ?? 'Unknown error'}`;
        }
    }

    // @ts-ignore
    @Tool({
        name: 'emergencyWithdraw',
        description: 'Emergency withdraw tokens from the faucet (owner only)'
    })
    async emergencyWithdraw(
        walletClient: EVMWalletClient,
        parameters: EsusuParameters
    ): Promise<string> {
        if (!parameters.amount) {
            throw new Error('Amount is required');
        }
        if (!walletClient) {
            return 'Error: Wallet client is not available for emergency withdraw.';
        }

        try {
            const tx = await walletClient.sendTransaction({
                to: this.contractAddress,
                abi: this.abi,
                functionName: 'emergencyWithdraw',
                args: [parameters.amount]
            });
            return tx.hash;
        } catch (err: any) {
            console.error('Error during emergency withdraw:', err?.message ?? err);
            return `Emergency withdraw failed: ${err?.message ?? 'Unknown error'}`;
        }
    }

    // @ts-ignore
    @Tool({
        name: 'getFaucetBalance',
        description: 'Get the current balance of the MysteryBox faucet'
    })
    async getFaucetBalance(
        walletClient: EVMWalletClient,
        // @ts-ignore
        params: EmptyParameters
    ): Promise<string> {
        try {
        if (!params.recipient) {
            return 'A recipient address must be provided to claim for a user.';
        }
        if (!walletClient) {
            return 'Error: Wallet client is not initialized. Please ensure the plugin is configured.';
        }


            // Prefer read if available
            const balance = await walletClient.sendTransaction({
                to: this.contractAddress,
                abi: this.abi,
                functionName: 'getFaucetBalance',
            });
            return String(balance);

        } catch (error: any) {
            console.error('Error getting faucet balance:', error?.message ?? error);
            return `Error: Could not retrieve faucet balance. ${error?.message ?? ''}`;
        }
    }


    // @ts-ignore
    @Tool({
        name: 'getTimeUntilNextClaim',
        description: 'Get the time until the next claim for a specific user'
    })
    public async getTimeUntilNextClaim(
        walletClient: EVMWalletClient,
        // @ts-ignore
        params: UserAddressParameters
    ): Promise<string> {
        if (!params.recipient) {
            return 'A recipient address must be provided to claim for a user.';
        }
        if (!walletClient) {
            return 'Error: Wallet client is not initialized. Please ensure the plugin is configured.';
        }
        try {
            const nextClaimTime = await walletClient.sendTransaction({
                to: this.contractAddress,
                abi: this.abi,
                functionName: 'getTimeUntilNextClaim',
                args: [params.userAddress]
            });

            const nextClaimDate = new Date(Number(nextClaimTime) * 1000);

            if (Number(nextClaimTime) === 0) {
                return 'This user has not claimed any tokens yet.';
            }

            return `The user next claimed tokens on: ${nextClaimDate.toLocaleString()}.`;
        } catch (error) {
            console.error('Error getting next claim time:', error);
            return 'Failed to get the next claim time.';
        }
    }
}