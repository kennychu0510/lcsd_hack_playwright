import moment from "moment";
import { Browser, firefox, Page } from "playwright";
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

const ENQUIRY = {
  sportValue: 4,
  facilityTypeValue: 507,
  venueValue: 257,
  locationValue: 125005809,
  date: moment().add(1, "days").format("YYYYMMDD"),
  areaValue: "WTS",
  session: "PM",
};

type EnquireOptions = {
  agent?: string;
  browser: Browser;
};
async function autoEnquire(options: EnquireOptions) {
  const { agent, browser } = options;
  let userAgent = agent || getUserAgent();
  console.log("userAgent: ", userAgent);
  let homePage = await browser.newPage({ userAgent: userAgent });
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

  // page.on("request", (request) => {
  //   console.log(">>", request.method(), request.postDataJSON());
  // });

  let isInsideEnquiryPage = false;
  do {
    isInsideEnquiryPage = await enterPage(page);
  } while (!isInsideEnquiryPage);

  console.log("You are now inside Enquiry Page");

  const frame = page.frameLocator('frame[name="main"]').first();
  const datePanel = frame.locator("#DatePanel > select");
  const sessionTimePanel = frame.locator("#sessionTimePanel > select");
  const facilityPanel = frame.locator("#facilityPanel > select");
  const facilityTypePanel = frame.locator("#facilityTypePanel > select");
  const areaPanel = frame.locator("#areaPanel > select");
  const prefPanel = frame.locator("#preferencePanel");
  const venuePanel = frame.locator(".selectTextSize select").first();
  const locationPanel = frame.locator(
    ".formFieldSelectComponent40 > div > select"
  );
  const enquireButton = frame.locator(".actionBtnContinue");
  const resultsTable = frame.locator("#searchResultTable");
  const errorPanel = frame.locator("#errorPanel");

  await datePanel.selectOption({ value: ENQUIRY.date });
  await sessionTimePanel.selectOption({ value: ENQUIRY.session });
  await facilityPanel.selectOption({ value: String(ENQUIRY.sportValue) });
  await facilityTypePanel.selectOption({
    value: String(ENQUIRY.facilityTypeValue),
  });
  await areaPanel.selectOption({ value: ENQUIRY.areaValue });
  await venuePanel.selectOption({ value: String(ENQUIRY.venueValue) });
  await locationPanel.selectOption({ value: String(ENQUIRY.locationValue) });
}

(async () => {
  let browser = await firefox.launch({ headless: false });

  try {
    await autoEnquire({ browser });
  } catch (error) {
    if (JSON.stringify(error).includes("regen button not found")) {
      console.log("restarting browser");
      await browser.close();
      browser = await firefox.launch({ headless: false });
      await autoEnquire({ browser });
    }
    console.log(error);
  }
})();
