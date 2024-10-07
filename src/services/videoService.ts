import puppeteer from "puppeteer-extra";
import * as cheerio from "cheerio";

let stealth = require("puppeteer-extra-plugin-stealth")();
puppeteer.use(stealth);

let chromePaths = require("chrome-paths");

export const extractVideoData = async (url: string): Promise<any> => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePaths.chrome,
  });

  const page = await browser.newPage();

  const client = await page.target().createCDPSession();

  await client.send("Network.enable");
  await client.send("Network.setRequestInterception", {
    patterns: [
      {
        urlPattern: "*",
      },
    ],
  });

  let videosUrls: string[] = [];

  const videoUrlPromise = new Promise<any>((resolve, reject) => {
    let idleTimeout: NodeJS.Timeout;

    client.on(
      "Network.requestIntercepted",
      async ({ interceptionId, request, responseHeaders, resourceType }) => {
        if (request.url.includes("m3u8") || request.url.includes("mp4")) {
          console.log(`URL do video encontrada: ${request.url}`);
          videosUrls.push(request.url);

          resolve(videosUrls);
        }

        client.send("Network.continueInterceptedRequest", {
          interceptionId,
        });

        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(async () => {
          if (videosUrls.length === 0) {
            reject("Nenhuma URL de vídeo m3u8 encontrada.");
          } else {
            resolve(videosUrls);
          }

          console.log("Nenhuma nova requisição. Fechando navegador...");
          console.log("URLs de vídeo encontradas:", videosUrls);

          await browser.close();
        }, 8000);
      }
    );
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const pageContent = await page.content();

  const $ = cheerio.load(pageContent);

  const pageText = await $.extract({
    text: "body",
    links: {
      selector: "a",
      value: "href",
    },
  });

  // @ts-ignore
  const formatedText = pageText?.text.replace(/\n/g, "");

  console.log(pageText);

  const videoUrls = await videoUrlPromise;

  return {
    videoUrl: videoUrls[0],
    videosUrls,
    formatedText,
  };
};
