import { BlockDetail } from "@/api/polygon.api";
import { ChevronLeft } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";

// Wei를 ETH로 변환하는 함수
function weiToEth(weiValue: string): string {
  const wei = BigInt(weiValue);
  const eth = Number(wei) / 1e18;
  return eth.toFixed(6);
}

const BlockDetailPage = () => {
  const data = useLoaderData() as BlockDetail;
  console.log("Block data", data);
  return (
    <div className="flex min-h-full w-full flex-col border bg-neutral-100 p-8">
      <Link to={"/"} className="px-4">
        <img src="/idblock.png" alt="logo" className="max-w-36" />
      </Link>
      <h1 className="flex px-4 py-6 text-lg font-semibold">
        <Link to={".."}>
          <ChevronLeft />{" "}
        </Link>
        Block #{parseInt(data.number, 16)}
      </h1>
      <main className="flex h-full w-full flex-col gap-4 rounded-3xl bg-white px-6 py-10 text-sm">
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Block Height :
          </div>
          <div className="flex-1">{parseInt(data.number, 16)}</div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Timestamp:
          </div>
          <div className="flex-1">
            {data.timeStamp ? (() => {
              const date = dayjs(parseInt(data.timeStamp) * 1000);
              return date.format("YYYY-MM-DD HH:mm:ss");
            })() : 'N/A'}
          </div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Block:
          </div>
          <div className="flex-1">
            <span className="font-bold text-primary">
              {data.transactions?.length} transaction
            </span>{" "}
            in this block
          </div>
        </div>

        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Difficulty :
          </div>
          <div className="flex-1">{data.difficulty}</div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Total Difficulty :
          </div>
          <div className="flex-1">{data.totalDifficulty}</div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Size :
          </div>
          <div className="flex-1">{parseInt(data.size ?? "0", 16)} bytes</div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Gas Used :
          </div>
          <div className="flex-1">{parseInt(data.gasUsed, 16)}</div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Gas Limit :
          </div>
          <div className="flex-1">{parseInt(data.gasLimit, 16)}</div>
        </div>
        
        {/* 트랜잭션 목록 표시 */}
        {data.transactions && data.transactions.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">Transactions</h2>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TxHash</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead></TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Gas Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.map((tx, index) => (
                    <TableRow key={tx.hash || index}>
                      <TableCell>
                        <Link to={`/tx/${tx.hash}`}>
                          <div className="min-h-6 max-w-32 items-center overflow-hidden text-ellipsis whitespace-nowrap font-bold text-primary">
                            {tx.hash}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="min-h-6 max-w-32 items-center overflow-hidden text-ellipsis whitespace-nowrap">
                          {'fromAddress' in tx ? (tx as unknown as {fromAddress: string}).fromAddress : tx.from}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="w-full rounded-md border border-emerald-600 border-opacity-25 bg-emerald-600/10 px-1.5 py-1.5 text-xs text-emerald-600">
                          IN
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="min-h-6 max-w-32 items-center overflow-hidden text-ellipsis whitespace-nowrap">
                          {'toAddress' in tx ? (tx as unknown as {toAddress: string}).toAddress : tx.to}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-h-6 items-center justify-center gap-2">
                          <span>{weiToEth(tx.value)}</span>
                          <span>ETH</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-h-6 items-center justify-center">
                          {tx.gas}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export { BlockDetailPage };
