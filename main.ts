import { firefox, Page } from "playwright";
import { URL } from "./constants";
import { getText } from "./tesseract";
import { autoEnterCode, getUserAgent, ocrImg } from "./utils/helper";

async function main() {
  const browser = await firefox.launch({ headless: false });
  let page = await browser.newPage();
  const context = await browser.newContext({
    userAgent: getUserAgent(),
  });
  await page.goto(URL.HOME_PAGE);
  await page.click("#LCSD_4");

  context.on("request", (data) => {
    console.log(data);
  });

  page = await page.waitForEvent("popup");
  await page.waitForLoadState("networkidle");

  console.log(await page.evaluate("location.href"));
  await page.setViewportSize({ width: 400, height: 900 });

  async function slideBtn() {
    const slideBtn = await page.locator("#continueId > button").boundingBox();
    if (slideBtn) {
      await page.mouse.move(slideBtn.x + slideBtn.width / 2, slideBtn.y + slideBtn.height / 2);
      await page.mouse.down({
        button: "left",
      });
      await page.mouse.move(
        slideBtn.x + slideBtn.width / 2 + 150,
        slideBtn.y + slideBtn.height / 2,
        {
          steps: 5000,
        }
      );
      await page.mouse.up();
    }
  }


  let code = ''
  let result: string | boolean = false;
  let attempt = 0
  do {
    attempt++
    console.log('attempt:', attempt)
    code = await ocrImg(page)
    if (code.length === 4) {
      result = await autoEnterCode(code, page);
      console.log('result of attempt', attempt, result)
    }
  } while (!result || typeof result === 'string');
  console.log('OCR success')

  slideBtn();
}

main();
