import { ErrorTable, LoadingTable } from "@/components/tables/common";
import { queries } from "@/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "@toss/error-boundary";
import { Suspense } from "react";
import { columns as txsColumns } from "../components/table-columns/txs";
import { TxsTable } from "@/components/tables/txs-table";
import { Link } from "react-router-dom";

const ScanRootPage = () => {
  console.log("🔄 ScanRootPage 렌더링 시작");
  
  const { data: result } = useSuspenseQuery({
    ...queries.txs.all,
    refetchInterval: 10000,
  });

  console.log("📋 쿼리 결과:", result);

  return (
    <main className="flex min-h-full w-full flex-col bg-neutral-100 p-8">
      <Link to={"/"} className="px-4">
        <img src="/idblock.png" alt="logo" className="max-w-36" />
      </Link>
      <header className="flex w-full flex-col gap-2 py-6">
        <div className="flex items-center justify-start gap-5 px-4">
          <h1 className="p-1 text-lg font-semibold leading-[1.35rem]">
            Contract (Database)
          </h1>
          <span>0x671645FC21615fdcAA332422D5603f1eF9752E03</span>
        </div>
        <div className="px-4 text-sm text-gray-600">
          💡 데이터베이스에서 트랜잭션 정보를 가져옵니다. (10초마다 자동 새로고침)
        </div>
      </header>
      <section className="flex-1">
        <div className="flex w-full flex-col gap-4 rounded-3xl bg-white p-6">
          <ErrorBoundary
            renderFallback={(props) => {
              console.error("🚨 ErrorBoundary 에러:", props.error);
              return (
                <div className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">
                    데이터 로드 실패
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {props.error.message}
                  </p>
                  <p className="text-sm text-gray-500">
                    브라우저 개발자도구(F12) → Console 탭에서 자세한 에러 확인 가능
                  </p>
                  <ErrorTable error={props.error} columns={txsColumns} />
                </div>
              );
            }}
            onError={(error) => console.error("🚨 에러 바운더리:", error)}
          >
            <Suspense fallback={<LoadingTable columns={txsColumns} />}>
              <TxsTable columns={txsColumns} result={result} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </main>
  );
};

export { ScanRootPage };
