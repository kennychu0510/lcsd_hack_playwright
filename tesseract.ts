import { createWorker } from "tesseract.js";
const path = require("path");
let loading = 'Loading.'
async function getText(img: string) {
  const worker = await createWorker({
    langPath: path.join(__dirname, "..", "lang-data"),
    logger: (m) => {
      console.log(loading += '.');
    },
  });

  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const {
    data: { text },
  } = await worker.recognize(img);
  console.log(text);
  await worker.terminate();
}

const img = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAAiCAYAAAAnOTVZAAABXklEQVRoQ+2Y2w7DIAxDx/9/9K5qxRAQU2y6au7jGkJyZgw03Z/Pzc8UgWSIU/zegw1xnqEhEhgaoiEyCBBy2BMN8UMgpbSjOOPEdmkl5vA2ijnE8r0KsBRi1OTMSmoBqs2Zz6MAKYPYaobVRGsJ135XK1IO8Qi0V9PRuJ4P1sYrfVMCcaZgZOxRm0ByH7GYv4QYqXwUpBziqKmjakHjtvlH40dA0iFGu+OruFIJs2MiZSkByr7ijBg7AjA6A/YgqgHKILaWwtbQKiWqjza7Vaz8KIuoAolBr3porhH/q8XSPbFXENIUEoNARPPMAvyZ5Zw3gjYfxUXvGfCky7l142h5YtkQ48ZS24yY4L7+eLYntswcBYg2Gl37enmiIxFag1SJpWeNHrjRJiLFt/JcBmJ5U2AXjoJeEbd0d17R0BlzGCKBuiEaIoEAIYWVaIgEAoQUVqIhEggQUliJBIgP5g9Kqpf/7ycAAAAASUVORK5CYII=`;
getText(img);
