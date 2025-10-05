import { createToolParameters } from '@goat-sdk/core';
import { z } from 'zod';

export const EmptyParameters = createToolParameters(z.object({}));

const USDC_TOKEN_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid address');

export class EsusuParameters extends createToolParameters(
    z.object({
        amount: z.number()
            .int('Percentage must be a whole number')
            .min(1, 'Percentage must be between 1 and 20')
            .max(20, 'Percentage must be between 1 and 20')
            .optional()
            .describe("Percentage amount to claim from the faucet (1-20%)"),
        account: addressSchema.optional().describe("Account address to check or interact with"),
        recipient: addressSchema.optional().describe("Recipient address for AI claims"),
        tokenAddress: addressSchema.optional().describe("Token address (optional)"),
        baseAddress: z.string().default(USDC_TOKEN_ADDRESS).describe("USDC token address on base"),
    })
) {}

export const UserAddressParameters = createToolParameters(
    z.object({
        userAddress: z.string().describe("The user's wallet address"),
    })
);