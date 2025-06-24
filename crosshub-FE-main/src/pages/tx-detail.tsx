// import { cn } from "@/lib/utils";
import { TxDetail } from "@/api/polygon.api";
import { ChevronLeft } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";
import dayjs from "dayjs";

// Wei를 ETH로 변환하는 함수
function weiToEth(weiValue: string): string {
  if (!weiValue || weiValue === '0') return '0';
  try {
    const wei = BigInt(weiValue);
    const eth = Number(wei) / 1e18;
    return eth.toFixed(6);
  } catch (error) {
    console.error('Wei to ETH conversion error:', error);
    return '0';
  }
}

// Wei를 Gwei로 변환하는 함수 (Gas Price용)
function weiToGwei(weiValue: string): string {
  if (!weiValue || weiValue === '0') return '0';
  try {
    const wei = BigInt(weiValue);
    const gwei = Number(wei) / 1e9;
    return gwei.toFixed(2);
  } catch (error) {
    console.error('Wei to Gwei conversion error:', error);
    return '0';
  }
}

const TxDetailPage = () => {
  const data = useLoaderData() as TxDetail;
  return (
    <div className="flex min-h-full w-full flex-col border bg-neutral-100 p-8">
      <Link to={"/"} className="px-4">
        <img src="/idblock.png" alt="logo" className="max-w-36" />
      </Link>
      <h1 className="flex px-4 py-6 text-lg font-semibold">
        <Link to={".."}>
          <ChevronLeft />{" "}
        </Link>
        Transaction Details
      </h1>
      <main className="flex h-full w-full flex-col gap-4 rounded-3xl bg-white px-6 py-10 text-sm">
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Transaction Hash:
          </div>
          <div className="flex-1">{data.hash}</div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Status:
          </div>
          <div className="flex-1">
            <span className="rounded-md bg-emerald-600/10 px-2 py-1 text-xs text-emerald-600">
              Success
            </span>
          </div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Block:
          </div>
          <Link to={`/block/${data.blockNumber}`}>
            <div className="flex-1 font-bold text-primary">
              {parseInt(data.blockNumber, 16)}
            </div>
          </Link>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Timestamp:
          </div>
          <div className="flex-1">
            {('timeStamp' in data && data.timeStamp) ? (() => {
              const timestamp = (data as unknown as {timeStamp: string}).timeStamp;
              const date = dayjs(parseInt(timestamp) * 1000);
              return date.format("YYYY-MM-DD HH:mm:ss");
            })() : 'N/A'}
          </div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            From :
          </div>
          <div className="flex-1 font-bold text-primary">
            {'fromAddress' in data ? (data as unknown as {fromAddress: string}).fromAddress : data.from || 'N/A'}
          </div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            To :
          </div>
          <div className="flex-1 font-bold text-primary">
            {'toAddress' in data ? (data as unknown as {toAddress: string}).toAddress : data.to || 'N/A'}
          </div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Value :
          </div>
          <div className="flex-1">
            {weiToEth(data.value)} ETH
          </div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Gas Price :
          </div>
          <div className="flex-1">
            {weiToGwei(data.gasPrice)} Gwei
          </div>
        </div>
      </main>
    </div>
  );
};

export { TxDetailPage };
