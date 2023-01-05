import { createWorker } from "tesseract.js";
const path = require("path");
let loading = "Loading.";

export async function getText(img: string) {
  const worker = await createWorker({
    langPath: path.join(__dirname, "..", "lang-data"),
    logger: (m) => {
      let message = (loading += ".");
      if (message.length > 20) {
        message = "Loading.";
      }
      console.log(message);
    },
  });

  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const {
    data: { text },
  } = await worker.recognize(img);
  console.log("OCR results: ", text);
  await worker.terminate();
  return text;
}
