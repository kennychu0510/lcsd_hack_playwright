import { firefox } from "playwright";
import { URL, USER_AGENT } from "./constants";
import { getCleanedImg } from "./scripts/getCleanedImg";

async function main() {
  const browser = await firefox.launch({ headless: false });
  let page = await browser.newPage();
  const context = await browser.newContext({
    userAgent: USER_AGENT[0],
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

  console.log(await getCleanedImg(page));

  await browser.close();
}

main();
