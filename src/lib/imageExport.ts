import { toJpeg, toPng } from 'html-to-image';
import { triggerDownload } from './download';

// Rasterise a DOM node to an image and download it — for people who want to
// drop the invoice into WhatsApp. html-to-image serialises the node into an
// SVG <foreignObject>, paints it to a canvas, and reads back a data URL: it
// runs entirely in the browser and makes no network request.

export type ImageFormat = 'png' | 'jpeg';

interface Options {
  format: ImageFormat;
  filename: string;
  /** Resolution multiplier — 2 gives crisp output on retina / when zoomed. */
  pixelRatio?: number;
}

export async function downloadNodeAsImage(
  node: HTMLElement,
  { format, filename, pixelRatio = 2 }: Options,
): Promise<void> {
  // A white background matters for JPEG, which has no alpha channel (otherwise
  // rounded corners render black). PNG keeps it clean too.
  const common = { pixelRatio, backgroundColor: '#ffffff', cacheBust: true };

  const dataUrl =
    format === 'png' ? await toPng(node, common) : await toJpeg(node, { ...common, quality: 0.95 });

  triggerDownload(dataUrl, filename);
}
