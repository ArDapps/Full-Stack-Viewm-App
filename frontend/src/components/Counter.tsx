import { useState } from "react";
import {
  useAccount,
  useConnect,
  useReadContract,
  useWriteContract,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { localChain } from "../config/wagmi";
import { EventsTable } from "./EventsTable";

const COUNTER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const COUNTER_ABI = [
  {
    inputs: [],
    name: "getValue",
    outputs: [{ type: "uint256", name: "value" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "increment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decrement",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "CounterIncremented",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "CounterDecremented",
    type: "event",
  },
] as const;

export function Counter() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const { data: value } = useReadContract({
    address: COUNTER_ADDRESS,
    abi: COUNTER_ABI,
    functionName: "getValue",
    query: {
      refetchInterval: 1000,
    },
  });

  const { writeContract: increment } = useWriteContract();
  const { writeContract: decrement } = useWriteContract();

  const [selectedConnector, setSelectedConnector] = useState<
    "injected" | "walletconnect"
  >("injected");

  const handleConnect = () => {
    const connector =
      selectedConnector === "injected"
        ? injected()
        : walletConnect({
            projectId: "d15c9962dc1dc2991f11cdb24d16ae51",
            showQrModal: true,
          });
    connect({ connector });
  };

  const handleIncrement = async () => {
    if (chainId !== localChain.id) {
      await switchChain({ chainId: localChain.id });
      return;
    }
    increment({
      address: COUNTER_ADDRESS,
      abi: COUNTER_ABI,
      functionName: "increment",
    });
  };

  const handleDecrement = async () => {
    if (chainId !== localChain.id) {
      await switchChain({ chainId: localChain.id });
      return;
    }
    decrement({
      address: COUNTER_ADDRESS,
      abi: COUNTER_ABI,
      functionName: "decrement",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        {!isConnected ? (
          <div className="flex flex-col items-center space-y-2">
            <select
              className="input bg-gray-800 text-white"
              value={selectedConnector}
              onChange={(e) =>
                setSelectedConnector(
                  e.target.value as "injected" | "walletconnect"
                )
              }
            >
              <option value="injected">Browser Wallet</option>
              <option value="walletconnect">WalletConnect</option>
            </select>
            <button className="btn-primary" onClick={handleConnect}>
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-400">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <div className="text-6xl font-bold text-blue-400 tabular-nums">
              {value?.toString() || "0"}
            </div>
            <div className="flex space-x-4">
              <button className="btn-primary" onClick={handleIncrement}>
                Increment
              </button>
              <button className="btn-secondary" onClick={handleDecrement}>
                Decrement
              </button>
            </div>
            {chainId !== localChain.id && (
              <div className="text-sm text-red-400 bg-red-900/20 px-4 py-2 rounded-lg">
                Please switch to the Anvil network
              </div>
            )}
          </>
        )}
      </div>

      {/* Events Table */}
      <EventsTable contractAddress={COUNTER_ADDRESS} contractType="counter" />
    </div>
  );
}
