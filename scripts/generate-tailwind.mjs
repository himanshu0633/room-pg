import { compile } from 'tailwindcss';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const OUT_FILE = path.join(SRC_DIR, 'tailwind.generated.css');

const isSourceFile = (name) => /\.(jsx?|tsx?|html)$/.test(name);

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(full);
    if (isSourceFile(entry.name)) return [full];
    return [];
  }));
  return files.flat();
}

function extractClasses(content) {
  const classes = new Set();
  const patterns = [
    /className\s*=\s*"([^"]+)"/g,
    /className\s*=\s*'([^']+)'/g,
    /className\s*=\s*\{`([\s\S]*?)`\}/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const raw = match[1].replace(/\$\{[^}]+\}/g, ' ');
      for (const token of raw.split(/\s+/)) {
        const cls = token.trim();
        if (!cls) continue;
        if (cls.includes('{') || cls.includes('}')) continue;
        classes.add(cls);
      }
    }
  }

  return classes;
}

async function buildTailwindCss(candidates) {
  const compiler = await compile('@import "tailwindcss";', {
    base: ROOT,
    loadStylesheet: async (id, base) => {
      const filePath = id === 'tailwindcss'
        ? path.join(ROOT, 'node_modules', 'tailwindcss', 'index.css')
        : path.resolve(base, id);

      return {
        path: filePath,
        base: path.dirname(filePath),
        content: await fs.readFile(filePath, 'utf8'),
      };
    },
  });

  return compiler.build([...candidates]);
}

async function main() {
  const files = await collectFiles(SRC_DIR);
  const allClasses = new Set();

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    extractClasses(content).forEach((cls) => allClasses.add(cls));
  }

  const css = await buildTailwindCss(allClasses);
  await fs.writeFile(OUT_FILE, css);

  console.log(`Generated ${path.relative(ROOT, OUT_FILE)} with ${allClasses.size} classes`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
