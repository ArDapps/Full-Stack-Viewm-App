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
import { parseEther } from "viem";
import { EventsTable } from "./EventsTable";

const NAME_REGISTRY_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const NAME_REGISTRY_ABI = [
  {
    inputs: [],
    name: "getName",
    outputs: [{ type: "string", name: "name" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "string", name: "newName" }],
    name: "changeName",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ type: "address", name: "owner" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "changer",
        type: "address",
      },
      {
        indexed: false,
        name: "oldName",
        type: "string",
      },
      {
        indexed: false,
        name: "newName",
        type: "string",
      },
    ],
    name: "NameChanged",
    type: "event",
  },
] as const;

export function NameRegistry() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [newName, setNewName] = useState("");

  const { data: currentName } = useReadContract({
    address: NAME_REGISTRY_ADDRESS,
    abi: NAME_REGISTRY_ABI,
    functionName: "getName",
    query: {
      refetchInterval: 1000,
    },
  });

  const { data: contractOwner } = useReadContract({
    address: NAME_REGISTRY_ADDRESS,
    abi: NAME_REGISTRY_ABI,
    functionName: "owner",
    query: {
      refetchInterval: 1000,
    },
  });

  const { writeContract: changeName } = useWriteContract();

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

  const handleChangeName = async () => {
    if (chainId !== localChain.id) {
      await switchChain({ chainId: localChain.id });
      return;
    }
    changeName({
      address: NAME_REGISTRY_ADDRESS,
      abi: NAME_REGISTRY_ABI,
      functionName: "changeName",
      args: [newName],
      value: parseEther("0.001"),
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
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-purple-400">
                Current Name
              </h2>
              <p className="text-3xl font-bold">
                {currentName || "Loading..."}
              </p>
            </div>
            {contractOwner && (
              <div className="text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg">
                Contract Owner: {contractOwner?.slice(0, 6)}...
                {contractOwner?.slice(-4)}
              </div>
            )}
            <div className="flex flex-col space-y-2 w-full max-w-md">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
                className="input"
              />
              <button
                className="btn-primary"
                onClick={handleChangeName}
                disabled={!newName}
              >
                Change Name (0.001 ETH)
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

      {/* Add Events Table */}
      <EventsTable
        contractAddress={NAME_REGISTRY_ADDRESS}
        contractType="nameRegistry"
      />
    </div>
  );
}
