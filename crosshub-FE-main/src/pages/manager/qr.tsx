import { QrScanDialog } from "@/components/dialogs/qr-scan-dialog";
import { Camera } from "lucide-react";

const QrPage = () => {
  //   const { data: result } = useSuspenseQuery({ ...queries.faq.all });

  return (
    <main className="flex h-full w-full flex-col bg-neutral-100 p-8">
      <header className="mb-10 flex w-full flex-col gap-2 py-6">
        <div className="flex justify-between px-4">
          <h1 className="text-4xl font-semibold">QR 촬영</h1>
        </div>
      </header>
      <section className="flex w-full flex-1 flex-col items-center justify-center gap-6 rounded-3xl p-6">
        <Camera size={120} strokeWidth={1} />
        <div className="mb-10 text-xl">
          QR코드를 촬영하시려면 아래 버튼을 눌러주세요.
        </div>
        <QrScanDialog />
      </section>
    </main>
  );
};

export { QrPage };
