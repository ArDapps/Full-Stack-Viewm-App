# دليل استخدام Wagmi في المشروع

## المحتويات

- [المكتبات المستخدمة](#المكتبات-المستخدمة)
- [الخطافات (Hooks)](#الخطافات-hooks)
- [التكوين (Configuration)](#التكوين-configuration)
- [أمثلة عملية](#أمثلة-عملية)

## المكتبات المستخدمة

```typescript
import {
  useAccount,
  useConnect,
  useReadContract,
  useWriteContract,
  useChainId,
  useSwitchChain,
  usePublicClient,
} from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
```

## الخطافات (Hooks)

### 1. useAccount

يستخدم للحصول على معلومات الحساب المتصل:

```typescript
const { address, isConnected } = useAccount();
// address: عنوان المحفظة المتصلة
// isConnected: حالة الاتصال (true/false)
```

### 2. useConnect

يستخدم لإدارة اتصال المحفظة:

```typescript
const { connect } = useConnect();

// مثال للاتصال بمحفظة MetaMask
connect({ connector: injected() });

// مثال للاتصال بـ WalletConnect
connect({
  connector: walletConnect({
    projectId: "YOUR_PROJECT_ID",
    showQrModal: true,
  }),
});
```

### 3. useReadContract

يستخدم لقراءة البيانات من العقد الذكي:

```typescript
const { data: value } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: "functionName",
  query: {
    refetchInterval: 1000, // تحديث كل ثانية
  },
});
```

### 4. useWriteContract

يستخدم لكتابة البيانات إلى العقد الذكي:

```typescript
const { writeContract } = useWriteContract();

// مثال للاستخدام
writeContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: "functionName",
  args: [arg1, arg2],
  value: parseEther("0.001"), // للمعاملات التي تتطلب إيثر
});
```

### 5. useChainId & useSwitchChain

يستخدم للتحقق من وتغيير الشبكة:

```typescript
const chainId = useChainId();
const { switchChain } = useSwitchChain();

// مثال للتحويل إلى شبكة محددة
if (chainId !== targetChainId) {
  await switchChain({ chainId: targetChainId });
}
```

### 6. usePublicClient

يستخدم للتفاعل مع الشبكة وقراءة الأحداث:

```typescript
const publicClient = usePublicClient();

// مثال لقراءة الأحداث
const logs = await publicClient.getLogs({
  address: CONTRACT_ADDRESS,
  event: CONTRACT_EVENT,
  fromBlock: BigInt(0),
  toBlock: "latest",
});
```

## التكوين (Configuration)

### تكوين Wagmi

```typescript
// wagmi.ts
import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

// تعريف شبكة محلية
export const localChain = {
  id: 31337,
  name: "Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
};

// إنشاء التكوين
export const config = createConfig({
  chains: [localChain, mainnet, sepolia],
  transports: {
    [localChain.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
```

## أمثلة عملية

### 1. ربط المحفظة

```typescript
function WalletConnect() {
  const { connect } = useConnect();
  const { isConnected, address } = useAccount();

  if (isConnected) {
    return <div>متصل: {address}</div>;
  }

  return (
    <button onClick={() => connect({ connector: injected() })}>
      اتصل بالمحفظة
    </button>
  );
}
```

### 2. قراءة قيمة من العقد

```typescript
function ContractReader() {
  const { data: value } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getValue",
  });

  return <div>القيمة: {value?.toString()}</div>;
}
```

### 3. كتابة قيمة إلى العقد

```typescript
function ContractWriter() {
  const { writeContract } = useWriteContract();

  const handleSubmit = async (newValue: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "setValue",
        args: [newValue],
      });
    } catch (error) {
      console.error("فشلت العملية:", error);
    }
  };

  return (
    <button onClick={() => handleSubmit("قيمة جديدة")}>تحديث القيمة</button>
  );
}
```

### 4. قراءة الأحداث

```typescript
function EventReader() {
  const publicClient = usePublicClient();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: CONTRACT_EVENT,
        fromBlock: BigInt(0),
      });
      setEvents(logs);
    };

    fetchEvents();
  }, [publicClient]);

  return (
    <div>
      {events.map((event) => (
        <div key={event.transactionHash}>حدث جديد: {event.args.value}</div>
      ))}
    </div>
  );
}
```

## ملاحظات مهمة

1. **التعامل مع الأخطاء**

```typescript
try {
  await writeContract({
    /* ... */
  });
} catch (error) {
  if (error.code === "ACTION_REJECTED") {
    // المستخدم رفض العملية
  } else {
    // خطأ آخر
  }
}
```

2. **تحديث البيانات تلقائياً**

```typescript
const { data } = useReadContract({
  // ...
  query: {
    refetchInterval: 1000, // تحديث كل ثانية
    refetchOnMount: true, // تحديث عند تحميل المكون
    refetchOnWindowFocus: true, // تحديث عند التركيز على النافذة
  },
});
```

3. **التحقق من الشبكة**

```typescript
const chainId = useChainId();
const { switchChain } = useSwitchChain();

useEffect(() => {
  if (chainId !== targetChainId) {
    switchChain({ chainId: targetChainId });
  }
}, [chainId]);
```
