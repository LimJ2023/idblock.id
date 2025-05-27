/* eslint-disable @typescript-eslint/no-explicit-any */
// file = Html5QrcodePlugin.jsx
import { Html5QrcodeScanner } from "html5-qrcode";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
import { useEffect, useRef } from "react";

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
      console.log("render html5QrcodeScanner");
      await html5QrcodeScanner.render(
        props.qrCodeSuccessCallback,
        props.qrCodeErrorCallback,
      );
      return html5QrcodeScanner;
    };

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
        } catch (error) {
          console.log("Failed to clear html5QrcodeScanner. ", error);
        }
      };
      clearScanner();
    };
  }, []);

  return <div id={qrcodeRegionId} />;
};
export default Html5QrcodePlugin;
