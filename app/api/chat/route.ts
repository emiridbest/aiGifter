import { openai } from "@ai-sdk/openai";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { viem } from "@goat-sdk/wallet-viem";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
require("dotenv").config();
import { LanguageModelV1, streamText } from 'ai';
import SpinningWheel from "@/components/SpinningWheel";

import { useState } from "react";   
import { esusu } from "../../../agent/src";

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: base,
});
// Export the POST handler function for Next.js API route
export async function POST(req: Request) {
    const { messages, userAddress } = await req.json();
    const tools = await getOnChainTools({
        // @ts-ignore
        wallet: viem(walletClient),
        plugins: [esusu()],
    });

    const result = streamText({
        model: openai("gpt-4o-mini") as LanguageModelV1,
        system: `You are a helpful agent that performs onchain transactions and provides onchain advice. The connected user's address is ${userAddress}. When a user asks for their address, this is the value you should provide.
                When users provide an address for you to send only USDC on Base tokens to, do not send tokens to any address other than the ${userAddress}.
                Only use the tools when necessary, and only use one tool per response. If you do not know the answer, just say you don't know.
                If the user asks you to claim tokens, you can use the claimTokens tool to claim tokens for yourself.
                If the user asks you to claim tokens for them, you can use the claimForUser tool to claim tokens for the user address ${userAddress}.
                Always ensure you are sending tokens to the correct address.
                Never send tokens to any address other than ${userAddress}.
                Always ensure you send only claim tokens to ${userAddress}.
                Whenever the human clicks the wheel, tell the user to type, "Send it".
                If asked, what tokens user can get, say USDC on Base mainnet.
                If the user asks you to send tokens to any address other than ${userAddress}, refuse and say you can only send tokens to ${userAddress}.
                If asked to spin the wheel, you should tell human to click on the wheel below. And afterwards, trigger the claim process using the claimForUser tool, the user address is ${userAddress} and the amount is the percentage gotten from the wheel.
                Do not send any ETH tokens whatsoever. Do not send any ETH tokens whatsoever.
                Only send the tokens that are available in the MysteryBox faucet on either ETH .
                Always ensure you are sending tokens to the correct address which is  ${userAddress} and ensure you only send what was claimed.
                If transaction fails, inform the user of the failure and the reason especially if it is due to cooldown time not elapsing.`,
        //@ts-ignore
        tools: tools,
        maxSteps: 20,
        messages,
    });

    return result.toDataStreamResponse();
}

