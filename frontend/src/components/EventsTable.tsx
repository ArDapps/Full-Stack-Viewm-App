import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { decodeEventLog } from "viem";

interface BaseEvent {
  transactionHash: `0x${string}`;
  blockNumber: number;
  timestamp: number;
  from: `0x${string}`;
}

interface CounterEvent extends BaseEvent {
  type: "increment" | "decrement";
}

interface NameChangeEvent extends BaseEvent {
  type: "nameChange";
  oldName: string;
  newName: string;
}

type Event = CounterEvent | NameChangeEvent;

interface EventsTableProps {
  contractAddress: string;
  contractType: "counter" | "nameRegistry";
}

const NAME_REGISTRY_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "changer", type: "address" },
      { indexed: false, name: "oldName", type: "string" },
      { indexed: false, name: "newName", type: "string" },
    ],
    name: "NameChanged",
    type: "event",
  },
] as const;

export function EventsTable({
  contractAddress,
  contractType,
}: EventsTableProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;

    const fetchEvents = async () => {
      try {
        const blockNumber = await publicClient.getBlockNumber();
        const fromBlock = BigInt(0);

        let logs;
        if (contractType === "counter") {
          const [incrementLogs, decrementLogs] = await Promise.all([
            publicClient.getLogs({
              address: contractAddress as `0x${string}`,
              fromBlock,
              toBlock: blockNumber,
              event: {
                type: "event",
                name: "CounterIncremented",
                inputs: [
                  { name: "from", type: "address", indexed: true },
                  { name: "value", type: "uint256", indexed: false },
                ],
              },
            }),
            publicClient.getLogs({
              address: contractAddress as `0x${string}`,
              fromBlock,
              toBlock: blockNumber,
              event: {
                type: "event",
                name: "CounterDecremented",
                inputs: [
                  { name: "from", type: "address", indexed: true },
                  { name: "value", type: "uint256", indexed: false },
                ],
              },
            }),
          ]);

          const processedEvents = await Promise.all([
            ...incrementLogs.map(async (log) => {
              const block = await publicClient.getBlock({
                blockNumber: log.blockNumber,
              });
              return {
                type: "increment" as const,
                transactionHash: log.transactionHash,
                blockNumber: Number(log.blockNumber),
                timestamp: Number(block.timestamp),
                from: log.topics[1] as `0x${string}`,
              };
            }),
            ...decrementLogs.map(async (log) => {
              const block = await publicClient.getBlock({
                blockNumber: log.blockNumber,
              });
              return {
                type: "decrement" as const,
                transactionHash: log.transactionHash,
                blockNumber: Number(log.blockNumber),
                timestamp: Number(block.timestamp),
                from: log.topics[1] as `0x${string}`,
              };
            }),
          ]);

          setEvents(
            processedEvents.sort((a, b) => b.blockNumber - a.blockNumber)
          );
        } else {
          // Name Registry Events
          const nameChangeLogs = await publicClient.getLogs({
            address: contractAddress as `0x${string}`,
            fromBlock,
            toBlock: blockNumber,
            event: {
              type: "event",
              name: "NameChanged",
              inputs: [
                { name: "changer", type: "address", indexed: true },
                { name: "oldName", type: "string", indexed: false },
                { name: "newName", type: "string", indexed: false },
              ],
            },
          });

          const processedEvents = await Promise.all(
            nameChangeLogs.map(async (log) => {
              const block = await publicClient.getBlock({
                blockNumber: log.blockNumber,
              });
              const { args } = decodeEventLog({
                abi: NAME_REGISTRY_ABI,
                data: log.data,
                topics: log.topics,
              });
              return {
                type: "nameChange" as const,
                transactionHash: log.transactionHash,
                blockNumber: Number(log.blockNumber),
                timestamp: Number(block.timestamp),
                from: log.topics[1] as `0x${string}`,
                oldName: args.oldName,
                newName: args.newName,
              };
            })
          );

          setEvents(
            processedEvents.sort((a, b) => b.blockNumber - a.blockNumber)
          );
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();

    const unwatch = publicClient.watchBlockNumber({
      onBlockNumber: () => {
        fetchEvents();
      },
    });

    return () => {
      unwatch();
    };
  }, [contractAddress, contractType, publicClient]);

  const renderEventType = (event: Event) => {
    if (event.type === "nameChange") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-900/50 text-purple-400 border border-purple-500/20">
          name change
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          event.type === "increment"
            ? "bg-green-900/50 text-green-400 border border-green-500/20"
            : "bg-red-900/50 text-red-400 border border-red-500/20"
        }`}
      >
        {event.type}
      </span>
    );
  };

  const renderEventDetails = (event: Event) => {
    if (event.type === "nameChange") {
      return (
        <span className="text-gray-300">
          <span className="text-gray-500">Changed from</span>{" "}
          <span className="font-medium">{event.oldName}</span>{" "}
          <span className="text-gray-500">to</span>{" "}
          <span className="font-medium">{event.newName}</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-200">
          Transaction History
        </h2>
        <div className="h-8 w-8 text-gray-400 animate-spin">
          {events.length === 0 && "⟳"}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-gray-400 p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
          No transactions yet
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700/50">
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  From
                </th>
                {contractType === "nameRegistry" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Details
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {events.map((event) => (
                <tr
                  key={event.transactionHash}
                  className="bg-gray-800/20 hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderEventType(event)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {`${event.from.slice(0, 6)}...${event.from.slice(-4)}`}
                  </td>
                  {contractType === "nameRegistry" && (
                    <td className="px-6 py-4 text-sm">
                      {renderEventDetails(event)}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={`https://etherscan.io/tx/${event.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {`${event.transactionHash.slice(
                        0,
                        6
                      )}...${event.transactionHash.slice(-4)}`}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDistanceToNow(new Date(event.timestamp * 1000), {
                      addSuffix: true,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
