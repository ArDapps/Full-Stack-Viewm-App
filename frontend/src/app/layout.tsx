import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Counter dApp",
  description: "A simple counter dApp using Foundry and Next.js",
};

function RootLayoutBody({ children }: { children: React.ReactNode }) {
  return (
    <body className={inter.className}>
      <Providers>{children}</Providers>
    </body>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <RootLayoutBody>{children}</RootLayoutBody>
    </html>
  );
}
