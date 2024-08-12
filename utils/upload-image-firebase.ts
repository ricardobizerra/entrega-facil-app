import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadImageAsync(uri: string): Promise<string> {
  const blob: Blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const newUri = uri.split("/");

  const fileRef = ref(getStorage(), `images/${newUri[newUri.length - 1]}`);
  const result = await uploadBytes(fileRef, blob as Blob);

  return await getDownloadURL(fileRef);
}