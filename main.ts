import { firefox, Page } from "playwright";
import { URL } from "./constants";
import { ScriptResult } from "./model";
import { getText } from "./tesseract";
import {
  autoEnterCode,
  enterPage,
  getUserAgent,
  ocrImg,
  slideBtn,
} from "./utils/helper";

type EnquireOptions = {
  agent: string;
};
async function autoEnquire({ agent }: EnquireOptions) {
  const browser = await firefox.launch({ headless: false });
  let homePage = await browser.newPage({ userAgent: agent });
  await homePage.goto(URL.HOME_PAGE);
  await homePage.click("#LCSD_4");

  const page = await homePage.waitForEvent("popup");
  await page.waitForLoadState("networkidle");

  const firstPage = browser.contexts()[0].pages()[0];
  console.log("first page url:", firstPage.url());
  await firstPage.setViewportSize({ width: 0, height: 0 });

  if (page.url().includes("warning")) {
    const errorMsg = await page.locator(".errorMsg").innerText();
    throw new Error(errorMsg);
  }
  // console.log(await page.evaluate('location.href'));
  await page.setViewportSize({ width: 400, height: 600 });

  let isInsideEnquiryPage = false;
  do {
    isInsideEnquiryPage = await enterPage(page);
  } while (!isInsideEnquiryPage);

  console.log("You are now inside Enquiry Page");
}

try {
  autoEnquire({ agent: getUserAgent() });
} catch (error) {
  console.log(error);
}
