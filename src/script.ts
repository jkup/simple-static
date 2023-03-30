import * as fs from "fs";
import * as path from "path";
import * as marked from "marked";

interface Page {
  title: string;
  content: string;
  filename: string;
}

function readPages(dir: string): Page[] {
  const files = fs.readdirSync(dir);
  const pages: Page[] = [];

  for (const file of files) {
    const filename = path.join(dir, file);
    const stat = fs.statSync(filename);

    if (stat.isDirectory()) {
      continue;
    }

    if (!filename.endsWith(".md")) {
      continue;
    }

    const content = fs.readFileSync(filename, "utf8");
    const title = content.split("\n")[0].replace("#", "").trim();

    pages.push({
      title,
      content: marked(content),
      filename,
    });
  }

  return pages;
}

function renderPage(page: Page): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${page.title}</title>
      </head>
      <body>
        <article>
          ${page.content}
        </article>
      </body>
    </html>
  `;
}

function generateSite(pages: Page[], outputDir: string): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  for (const page of pages) {
    const html = renderPage(page);
    const outputFile = path.join(
      outputDir,
      path.basename(page.filename, ".md") + ".html"
    );
    fs.writeFileSync(outputFile, html);
  }
}

const pages = readPages("content");
generateSite(pages, "output");
