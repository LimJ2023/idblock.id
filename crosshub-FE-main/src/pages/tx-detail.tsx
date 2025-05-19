// import { cn } from "@/lib/utils";
import { TxDetail } from "@/api/polygon.api";
import { queries } from "@/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "@toss/error-boundary";
import { formatDistanceToNow, fromUnixTime } from "date-fns";
import { ChevronLeft, Loader } from "lucide-react";
import { Suspense } from "react";
import { Link, useLoaderData } from "react-router-dom";

const TxDetailPage = () => {
  const data = useLoaderData() as TxDetail;
  console.log(data);
  const { data: result } = useSuspenseQuery({
    ...queries.txs.block(data.blockNumber),
  });
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
          <div className="flex-1">{data.hash}</div>
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
        <ErrorBoundary
          renderFallback={() => <>Error</>}
          onError={(error) => console.error(error)}
        >
          <Suspense fallback={<Loader />}>
            <div className="flex">
              <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
                Timestamp
              </div>
              <div className="flex-1">
                {result.success &&
                  formatDistanceToNow(
                    fromUnixTime(parseInt(result.value.timestamp, 16)),
                  )}
              </div>
            </div>
          </Suspense>
        </ErrorBoundary>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            From :
          </div>
          <div className="flex-1 font-bold text-primary">{data.from}</div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            To :
          </div>
          <div className="flex-1 font-bold text-primary">{data.to}</div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Value :
          </div>
          <div className="flex-1">{data.value} ETH</div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Gas Price :
          </div>
          <div className="flex-1">{data.gasPrice} ETH</div>
        </div>
      </main>
    </div>
  );
};

export { TxDetailPage };
