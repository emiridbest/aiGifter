import { Providers } from "../app/providers";
import { getSession } from "../lib/auth";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { ThemeProvider } from "../components/ThemeProvider";

import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "../components/ui/sonner";


const appUrl = process.env.NEXT_PUBLIC_URL
export const metadata: Metadata = {
  title: 'AI Gifter',
  description: 'Claim free usdc from faucet daily',
  metadataBase: new URL("https://aibasefaucet.vercel.app/"),
  openGraph: {
    images: [
      'https://github.com/emiridbest/aiGifter/blob/main/public/baseFaucet.png'
    ],
    title: 'Claim Free tokens',
    description: 'Claim free usdc from faucet daily',
    type: 'website',
  },
  other: {
    frame: JSON.stringify({
      name: "AI Gifter",
      version: "1",
      iconUrl: "https://aibasefaucet.vercel.app/",
      homeUrl: "https://aibasefaucet.vercel.app/",
      buttonTitle: "Open Base Faucet",
      splashImageUrl: "https://github.com/emiridbest/aiGifter/blob/main/public/baseFaucet.png",
      splashBackgroundColor: "#3730a3",
      webhookUrl: "https://api.neynar.com/f/app/9b0eeef4-765a-467d-b78c-8a6590e4d99d/event",
      subtitle: "Claim usdc from faucet",
      description: "Claim free usdc from faucet daily",
      primaryCategory: "utility",
      tagline: "Claim free tokends daily",
      ogTitle: "Claim Free tokens"
    }),
    accountAssociation: JSON.stringify({
    "header": "eyJmaWQiOjg0OTM2MywidHlwZSI6ImF1dGgiLCJrZXkiOiIweGI4YzE5OEU4ZjU2MzA5NkM5RGYwMDY3ZTdFNjRBNERBOGMxMjlkNUEifQ",
    "payload": "eyJkb21haW4iOiJhaWJhc2VmYXVjZXQudmVyY2VsLmFwcCJ9",
    "signature": "sIYI84jo4Pa17p060MkV0R2Cpa0uh5MJGm6B8H5lTO85DlsPn6C4Hb/LLOKW96akFyT7Z4/0kEaQwcI+38OQ3Rs="
    })
  }
}
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Providers session={session}>
            <Header />
            {children}
            <Toaster />
          {/*  <Footer /> */}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}