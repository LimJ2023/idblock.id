import { TxsTable } from "@/components/tables/txs-table";
import { columns as txsColumns } from "../components/table-columns/txs";
import { Link } from "react-router-dom";

const ScanRootPage = () => {
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
          💡 Fetches transaction information from the database page by page.
        </div>
      </header>
      <section className="flex-1">
        <div className="flex w-full flex-col gap-4 rounded-3xl bg-white p-6">
          <TxsTable columns={txsColumns} caption="Transaction List" />
        </div>
      </section>
    </main>
  );
};

export { ScanRootPage };
