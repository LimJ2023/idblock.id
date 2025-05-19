import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const Success = <T>(value: T): Success<T> => ({ success: true, value });
const Failure = <E>(error: E): Failure<E> => ({ success: false, error });

const Range = function* (from = 0, to = 0, step = 1) {
  for (let i = from; i <= to; i += step) {
    yield i;
  }
};

const dataUrlToBlob = (dataURI: string) => {
  const byteString = atob(dataURI.split(",")[1]);

  // separate out the mime component
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
};

const blobTodataURL = async (blob: Blob) => {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
    };

    reader.readAsDataURL(blob);
  });
};

const getMIMETypeFromDataURI = (dataURI: string) => {
  const dataType = dataURI.split(",")[0];
  const types = dataType.split(":")[1];

  return types.split(";")[0];
};

export {
  blobTodataURL,
  cn,
  dataUrlToBlob,
  Failure,
  getMIMETypeFromDataURI,
  Range,
  Success,
};
