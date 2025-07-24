import { useState } from "react";
import { TxsTable, TxsStats } from "@/components/tables/txs-table";
import { columns as txsColumns } from "../components/table-columns/txs";
import { Link } from "react-router-dom";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 컨트랙트 주소 정보
const CONTRACT_ADDRESSES = [
  {
    address: "0x671645FC21615fdcAA332422D5603f1eF9752E03",
    name: "Main Contract",
    description: "Main Contract"
  },
  {
    address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", 
    name: "Identity Verification Contract",
    description: "Identity Verification Contract"
  },
  {
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    name: "Badge Issuance Contract", 
    description: "Badge Issuance Contract"
  }
];

const ScanRootPage = () => {
  const [selectedContract, setSelectedContract] = useState(CONTRACT_ADDRESSES[0]);

  return (
    <main className="flex min-h-full w-full flex-col bg-neutral-100 p-8">
      <Link to={"/"} className="px-4">
        <img src="/idblock.png" alt="logo" className="max-w-36" />
      </Link>
      <header className="flex w-full flex-col gap-2 py-6">
        <div className="flex items-center justify-start gap-10 px-4">
          <h1 className="p-1 text-lg font-semibold leading-[1.35rem]">
            Contract : 
          </h1>
          {CONTRACT_ADDRESSES.map((contract) => (
            <Button key={contract.address} onClick={() => setSelectedContract(contract) } variants={"secondary"} className={cn(
              "min-w-0 max-w-md truncate font-mono",
              selectedContract.address === contract.address ? "bg-primary text-white" : "bg-white text-primary"
            )} style={
              {width: "200px",
                height: "60px"
              }
            }>
              {contract.name}
            </Button>
          )
          )}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variants="secondary" className="min-w-0 max-w-md truncate">
                {selectedContract.address}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              {CONTRACT_ADDRESSES.map((contract) => (
                <DropdownMenuItem
                  key={contract.address}
                  onClick={() => setSelectedContract(contract)}
                  className="flex flex-col items-start p-4"
                >
                  <div className="font-medium text-sm">{contract.name}</div>
                  <div className="text-xs text-gray-500 font-mono break-all">
                    {contract.address}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {contract.description}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </header>
      <section className="flex-1 space-y-6">
        {/* 트랜잭션 통계 구역 */}
        <div className="flex w-full flex-col gap-4 rounded-3xl bg-white p-6">
          <TxsStats contractAddress={selectedContract.address} />
        </div>
        
        {/* 트랜잭션 테이블 구역 */}
        <div className="flex w-full flex-col gap-4 rounded-3xl bg-white p-6">
          <TxsTable 
            columns={txsColumns} 
            caption={`Transaction List - ${selectedContract.name}`}
            contractAddress={selectedContract.address}
          />
        </div>
      </section>
    </main>
  );
};

export { ScanRootPage };
