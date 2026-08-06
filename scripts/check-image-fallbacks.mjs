import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const distRoot = resolve('dist');
const rasterUrlPattern = /\.(?:avif|gif|jpe?g|png|webp)(?:[?#][^\s"']*)?$/i;
const fallbackUrlPattern = /\.(?:jpe?g|png)(?:[?#][^\s"']*)?$/i;

const getAttribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, 'i'));
  return match?.[1] ?? match?.[2];
};

const getFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? getFiles(path) : [path];
  }));

  return nestedFiles.flat();
};

const htmlFiles = (await getFiles(distRoot)).filter((path) => extname(path) === '.html');
const errors = [];
let rasterImageCount = 0;

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, 'utf8');
  const page = relative(distRoot, htmlFile).replaceAll('\\', '/');
  const pictureBlocks = [...html.matchAll(/<picture\b[^>]*>[\s\S]*?<\/picture>/gi)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length,
    html: match[0]
  }));

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = getAttribute(tag, 'src');
    const srcset = getAttribute(tag, 'srcset');
    const isRaster = [src, srcset]
      .filter(Boolean)
      .some((value) => value.split(',').some((candidate) => rasterUrlPattern.test(candidate.trim().split(/\s+/)[0])));

    if (!isRaster) continue;
    rasterImageCount += 1;

    const picture = pictureBlocks.find((block) => match.index >= block.start && match.index < block.end);
    if (!picture) {
      errors.push(`${page}: raster <img> is not wrapped in <picture>: ${tag}`);
      continue;
    }

    if (!src || !fallbackUrlPattern.test(src)) {
      errors.push(`${page}: fallback <img> must use JPEG or PNG, found ${src ?? 'no src'}`);
    }

    if (srcset && /\.webp(?:[?#\s,]|$)/i.test(srcset)) {
      errors.push(`${page}: fallback <img> srcset contains WebP: ${srcset}`);
    }

    const hasWebpSource = [...picture.html.matchAll(/<source\b[^>]*>/gi)].some((sourceMatch) => {
      const type = getAttribute(sourceMatch[0], 'type');
      const sourceSrcset = getAttribute(sourceMatch[0], 'srcset');
      return type?.toLowerCase() === 'image/webp' && Boolean(sourceSrcset && /\.webp(?:[?#\s,]|$)/i.test(sourceSrcset));
    });

    if (!hasWebpSource) {
      errors.push(`${page}: <picture> has no WebP <source> for fallback ${src ?? 'without src'}`);
    }
  }
}

if (rasterImageCount === 0) {
  errors.push('No raster images were found in dist; the check did not exercise any output.');
}

if (errors.length > 0) {
  console.error(`Image fallback check failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${rasterImageCount} raster images across ${htmlFiles.length} built pages.`);
}
