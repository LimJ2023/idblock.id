/* eslint-disable @typescript-eslint/no-explicit-any */
// file = Html5QrcodePlugin.jsx
import { cn } from "@/lib/utils";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
import { QrCode } from "lucide-react";
import { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

const qrcodeRegionId = "html5qr-code-full-region";

// Creates the configuration object for Html5QrcodeScanner.

const createConfig = (props: any) => {
  const config: any = {};
  if (props.fps) {
    config.fps = props.fps;
  }
  if (props.qrbox) {
    config.qrbox = props.qrbox;
  }
  if (props.aspectRatio) {
    config.aspectRatio = props.aspectRatio;
  }
  if (props.disableFlip !== undefined) {
    config.disableFlip = props.disableFlip;
  }
  return config;
};

const Html5QrcodePlugin = (
  props: Partial<
    Html5QrcodeScannerConfig & {
      verbose: boolean;
      qrCodeSuccessCallback: any;
      qrCodeErrorCallback: any;
      className?: string;
    }
  >,
) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const startScanning = async (): Promise<Html5QrcodeScanner> => {
      // Initialize and start the QR scanner
      // when component mounts
      const config = createConfig(props);
      const verbose = props.verbose === true;
      // Suceess callback is required.
      if (!props.qrCodeSuccessCallback) {
        throw "qrCodeSuccessCallback is required callback.";
      }
      const html5QrcodeScanner = new Html5QrcodeScanner(
        qrcodeRegionId,
        config,
        verbose,
      );

      await html5QrcodeScanner.render(
        props.qrCodeSuccessCallback,
        props.qrCodeErrorCallback,
      );
      return html5QrcodeScanner;
    };

    setTimeout(() => {
      const inputEl = document.querySelector(
        '#reader input[type="file"]',
      ) as HTMLInputElement;
      if (inputEl) {
        inputEl.style.padding = "12px";
        inputEl.style.borderRadius = "100%";
        inputEl.style.backgroundColor = "#e9f5ff";
      }
    }, 500);

    const initScanner = async () => {
      if (isMounted.current) {
        scannerRef.current = await startScanning();
      }
    };

    initScanner();

    // cleanup function when component will unmount
    return () => {
      isMounted.current = false;
      const clearScanner = async () => {
        try {
          if (scannerRef.current) await scannerRef.current.clear();
                  } catch {
            // QR 스캐너 정리 중 오류 발생 시 무시
          }
      };
      clearScanner();
    };
  }, []);

  useEffect(() => {
    const changeTexts = () => {
      const fileScanBtn = document.getElementById(
        "html5-qrcode-anchor-scan-type-change",
      );
      const dashboardCsr = document.getElementById(
        "html5qr-code-full-region__dashboard_section_csr",
      );

      if (fileScanBtn && dashboardCsr) {
        const isHidden =
          window.getComputedStyle(dashboardCsr).display === "none";

        if (isHidden) {
          fileScanBtn.innerText = "Scan with Camera";
        } else {
          fileScanBtn.innerText = "Scan with Image";
        }
      }

      const permissionCameraBtn = document.getElementById(
        "html5-qrcode-button-camera-permission",
      );
      if (permissionCameraBtn)
        permissionCameraBtn.innerText = "Request Camera Permission";

      const permissionFileBtn = document.getElementById(
        "html5-qrcode-button-file-selection",
      );
      if (permissionFileBtn) permissionFileBtn.innerText = "Upload Image";

      const dragFileScanText = document.querySelector(
        "#html5qr-code-full-region__dashboard_section > div > div:last-child > div",
      );
      if (dragFileScanText)
        dragFileScanText.innerHTML = "Or drag file here";

      const targetContainer = document.getElementById(
        "html5qr-code-full-region__scan_region",
      );
      if (!targetContainer) return;

      const statusText = document.querySelector(".qr-code-full-region > span");
      if (statusText && statusText.textContent?.includes("Scanning")) {
        statusText.textContent = "스캔 중입니다...";
      }

      const fileInputLabel = document.querySelector(
        "#html5-qrcode-button-file-selection + span",
      );
      if (fileInputLabel) fileInputLabel.textContent = "이미지 선택";

      const imageInfoText = document.querySelector(".html5-qrcode-text-tips");
      if (imageInfoText && imageInfoText.textContent?.includes("Upload")) {
        imageInfoText.textContent = "QR 코드가 포함된 이미지를 업로드하세요.";
      }
    };

    const changeImage = new MutationObserver(() => {
      const img = document.querySelector(
        "#html5qr-code-full-region__scan_region img",
      );
      const container = document.getElementById(
        "html5qr-code-full-region__scan_region",
      );

      if (img && container) {
        img.remove();

        const mountNode = document.createElement("div");
        mountNode.id = "html5qr-code-full-region__image";
        container.appendChild(mountNode);

        const root = ReactDOM.createRoot(mountNode);
        root.render(
          <div id="imageBox">
            <QrCode size={28} color="#FF5520" />
          </div>,
        );
      }
    });

    const target = document.getElementById("html5qr-code-full-region");
    const observer = new MutationObserver(() => {
      setTimeout(() => changeTexts(), 50);
    });

    if (target) {
      observer.observe(target, {
        childList: true,
        subtree: true,
      });
    }

    const targetImage = document.getElementById(
      "html5qr-code-full-region__scan_region",
    );
    if (targetImage) {
      changeImage.observe(targetImage, {
        childList: true,
        subtree: true,
      });
    }

    // 초기에도 한 번 적용
    setTimeout(() => changeTexts(), 500);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      id={qrcodeRegionId}
      className={cn("box-border w-full text-[#333333]", props.className)}
    />
  );
};
export default Html5QrcodePlugin;
