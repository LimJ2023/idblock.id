import { LoadingTable } from "@/components/tables/common";
import { queries } from "@/queries";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "@toss/error-boundary";
import { columns as txsColumns } from "../components/table-columns/txs";
import { TxsTable } from "@/components/tables/txs-table";
import { Link } from "react-router-dom";

const ScanRootPage = () => {
  console.log("🔄 ScanRootPage 렌더링 시작");
  
  const { data: result, isLoading, error, isError } = useQuery({
    ...queries.txs.all,
    // 임시로 자동 새로고침 비활성화 (버그 해결 후 다시 활성화)
    refetchInterval: false,
    // 에러 재시도 제한
    retry: 1,
    // 에러 발생 시 재시도 지연
    retryDelay: 5000,
    // 백그라운드 리페치 비활성화
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  console.log("📋 쿼리 상태:", { result, isLoading, error, isError });

  // 로딩 중인 경우
  if (isLoading) {
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
            💡 데이터베이스에서 트랜잭션 정보를 로딩 중...
          </div>
        </header>
        <section className="flex-1">
          <div className="flex w-full flex-col gap-4 rounded-3xl bg-white p-6">
            <LoadingTable columns={txsColumns} />
          </div>
        </section>
      </main>
    );
  }

  // 에러가 발생한 경우
  if (isError) {
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
          <div className="px-4 text-sm text-red-600">
            ❌ 데이터 로딩 중 오류가 발생했습니다.
          </div>
        </header>
        <section className="flex-1">
          <div className="flex w-full flex-col gap-4 rounded-3xl bg-white p-6">
            <div className="p-8 text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                데이터 로드 실패
              </h3>
              <p className="text-gray-600 mb-4">
                {error?.message || "알 수 없는 오류가 발생했습니다."}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                브라우저 개발자도구(F12) → Console 탭에서 자세한 에러 확인 가능
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // 데이터가 없는 경우 처리
  if (!result) {
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
            ⚠️ 데이터를 불러올 수 없습니다.
          </div>
        </header>
        <section className="flex-1">
          <div className="flex w-full flex-col gap-4 rounded-3xl bg-white p-6">
            <div className="p-8 text-center">
              <p className="text-gray-600">데이터가 없습니다.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

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
          💡 데이터베이스에서 트랜잭션 정보를 가져왔습니다. (자동 새로고침 임시 비활성화)
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
                    렌더링 오류
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {props.error.message}
                  </p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    페이지 새로고침
                  </button>
                </div>
              );
            }}
            onError={(error) => {
              console.error("🚨 에러 바운더리:", error);
            }}
          >
            <TxsTable columns={txsColumns} result={result!} />
          </ErrorBoundary>
        </div>
      </section>
    </main>
  );
};

export { ScanRootPage };
