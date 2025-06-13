import { QrScanDialog } from "@/components/dialogs/qr-scan-dialog";
import { Camera } from "lucide-react";

const QrPage = () => {
  //   const { data: result } = useSuspenseQuery({ ...queries.faq.all });

  return (
    <main className="flex h-dvh w-full flex-col border bg-white text-[#1E1E1E]">
      <header className="p-5">
        <h1 className="px-4 py-2 text-3xl font-semibold text-[#1E1E1E]">
          QR 촬영
        </h1>
      </header>

      <section className="h-full w-full items-center justify-center border-t border-[#E5E7EB] bg-[#FAFBFC] p-6">
        <div className="flex h-full w-full items-center justify-center rounded-3xl border border-[#E5E7EB] bg-white px-10 py-10">
          <div className="flex w-[20rem] flex-col items-center justify-center gap-6">
            <div className="flex h-[127px] w-[127px] items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F7F7F7]">
              <Camera size={56} strokeWidth={1} color="#555555" />
            </div>
            <div className="text-base text-[#666666]">
              QR코드를 촬영해 방문객을 승인할 수 있습니다.
            </div>
            <QrScanDialog />
          </div>
        </div>
      </section>
    </main>
  );
};

export { QrPage };
