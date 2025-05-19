import { BlockDetail } from "@/api/polygon.api";
import { formatDistanceToNow, fromUnixTime } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";

const BlockDetailPage = () => {
  const data = useLoaderData() as BlockDetail;

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
            {formatDistanceToNow(fromUnixTime(parseInt(data.timestamp, 16)))}
          </div>
        </div>
        <div className="flex">
          <div className="w-1/4 flex-shrink-0 flex-grow-0 text-[#6c757d]">
            Block:
          </div>
          <div className="flex-1">
            <span className="font-bold text-primary">
              {data.transactions.length} transaction
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
          <div className="flex-1">{parseInt(data.size, 16)} bytes</div>
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
      </main>
    </div>
  );
};

export { BlockDetailPage };
