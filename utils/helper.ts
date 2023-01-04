import { Page } from "playwright";
import { getText } from "../tesseract";
import USER_AGENTS from '../userAgents.json'

export function getUserAgent(): string {
  const length = USER_AGENTS.length;
  return USER_AGENTS[Math.floor(Math.random() * length + 1)];
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function ocrImg(page: Page) {
  console.log("..........getting Image for OCR..........");
  await page.evaluate(async () => {

    function waitForChange(target: HTMLElement) {
      return new Promise<void>(resolve => {
        const observer = new MutationObserver(mutations => {
          observer.disconnect();
          resolve();
        })
        
        observer.observe(target, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeOldValue: true,
          characterData: true,
          characterDataOldValue: true
        })
      })
    }

      const regenImgBtn = document.querySelector(".actionBtnSmall") as HTMLButtonElement;
      const observedElement = document.querySelector("#imageCaptchaDivision") as HTMLElement;
      regenImgBtn.click();
      await waitForChange(observedElement);
  });
  
  // await page.waitForTimeout(1000);

  const cleanedImg = await getCleanedImg(page);
  let recognizedText = await getText(cleanedImg);
  recognizedText = recognizedText.trim();
  const uniqueCode = [...new Set(recognizedText)].join("");
  console.log({ uniqueCode });
  return uniqueCode;
}

export async function getCleanedImg(page: Page) {
  return await page.evaluate(() => {
    function setPixelRGB(pixel: Uint8ClampedArray, index: number, rgbValue: number) {
      pixel[index] = rgbValue;
      pixel[index + 1] = rgbValue;
      pixel[index + 2] = rgbValue;
    }

    function getNeighborIndices(i: number, n: number, img: HTMLImageElement) {
      const neighborIndices = [];
      const neighborLength = n % 2 === 0 ? n - 1 : n;

      for (let x = 0; x < neighborLength; x++) {
        for (let y = 0; y < neighborLength; y++) {
          const offsetX = -Math.floor(neighborLength / 2) + x;
          const offsetY = -Math.floor(neighborLength / 2) + y;
          const index = i + 4 * offsetY + img.width * 4 * offsetX;
          if (index === i) continue;
          neighborIndices.push(index);
        }
      }
      return neighborIndices;
    }

    const img = document.querySelector("#inputTextWrapper img") as HTMLImageElement;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const src = img.src;
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const THRESHOLD = 100;
    const pixelDataArray = imageData.data;
    const WHITE = 255;
    const BLACK = 0;
    const pixelCountThreshold = 5;

    for (let i = 0; i < pixelDataArray.length; i += 4) {
      let r = pixelDataArray[i];
      let g = pixelDataArray[i + 1];
      let b = pixelDataArray[i + 2];
      let a = pixelDataArray[i + 3];

      /* CONVERT TO BLACK AND WHITE */
      const newValue = (r + g + b) / 3;
      pixelDataArray[i] = newValue;
      pixelDataArray[i + 1] = newValue;
      pixelDataArray[i + 2] = newValue;

      if (newValue > THRESHOLD) {
        pixelDataArray[i] = 255;
        pixelDataArray[i + 1] = 255;
        pixelDataArray[i + 2] = 255;
      } else {
        pixelDataArray[i] = 0;
        pixelDataArray[i + 1] = 0;
        pixelDataArray[i + 2] = 0;
      }
    }

    const pixelDataArrayF1 = new Uint8ClampedArray(pixelDataArray);

    /* 
        neighbor length = 1, neighbor count = 8
        neighbor length = 2, neighbor count = 24
        neighbor length = 3, neighbor count = 48
        neighbor length = n, neighbor count = n^2 * 4 + 4n 
      */
    /* REMOVING NOISE */
    for (let i = 0; i < pixelDataArray.length; i += 4) {
      const neighbor = getNeighborIndices(i, 3, img);
      let blackPixelCount = 0;
      for (let index of neighbor) {
        if (index < 0 || index > pixelDataArray.length) continue;
        if (pixelDataArray[index] === BLACK) {
          blackPixelCount++;
        }
      }
      if (blackPixelCount < pixelCountThreshold) {
        setPixelRGB(pixelDataArrayF1, i, WHITE);
      }

      const xDirectionPercentage = (i % (img.width * 4)) / (img.width * 4);
      if (xDirectionPercentage < 0.05) {
        setPixelRGB(pixelDataArrayF1, i, WHITE);
      }
      if (xDirectionPercentage > 0.95) {
        setPixelRGB(pixelDataArrayF1, i, WHITE);
      }

      const yDirectionPercentage = Math.floor(i / (img.width * 4)) / img.height;
      if (yDirectionPercentage < 0.1) {
        setPixelRGB(pixelDataArrayF1, i, WHITE);
      }

      if (yDirectionPercentage > 0.9) {
        setPixelRGB(pixelDataArrayF1, i, WHITE);
      }
    }

    imageData.data.set(pixelDataArrayF1);
    ctx.putImageData(imageData, 0, 0);

    const cleanedImageURL = canvas.toDataURL();

    /* SEND RESULTS BACK TO APP */
    return Promise.resolve(cleanedImageURL);
  });
}

export async function autoEnterCode(code: string, page: Page) {
  console.log("..........auto entering code..........");
  const result = await page.evaluate((code) => {
    try {
      const clickedBtn = document.querySelector('[sel="true"]');
      if (clickedBtn) {
        (clickedBtn as HTMLButtonElement).click();
      }
      const btns = document.querySelector("#virtualKeysWrapper")?.children;
      if (!btns) {
        return false;
      }

      let clickCount = 0;

      loop1: for (let letter of code) {
        loop2: for (let i = 0; i < btns.length; i++) {
          if (btns[i].textContent === letter) {
            const button = btns[i] as HTMLButtonElement;
            clickCount++;
            button.click();
            continue loop1;
          }
        }
      }

      if (clickCount !== 4) {
        return false;
      }

      return true;
    } catch (error) {
      return JSON.stringify(error);
    }
  }, code);

  return result;
}
