import { createConfig, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";

// Define local chain
export const localChain = {
  id: 31_337,
  name: "Anvil",
  network: "anvil",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
} as const;

// Configure wagmi
export const config = createConfig({
  chains: [localChain],
  connectors: [
    injected(),
    walletConnect({
      projectId: "d15c9962dc1dc2991f11cdb24d16ae51",
      showQrModal: true,
    }),
  ],
  transports: {
    [localChain.id]: http(),
  },
});
