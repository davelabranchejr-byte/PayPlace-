import { Image } from 'react-native';

export async function printCalendar(render, sources) {
  const artwork = Object.fromEntries(Object.entries(sources).map(([key, source]) =>
    [key, new URL(Image.resolveAssetSource(source).uri, window.location.href).href]));
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;width:1px;height:1px;border:0;opacity:0;pointer-events:none';
  await new Promise((resolve, reject) => {
    frame.onload = () => {
      try {
        const target = frame.contentWindow;
        target.addEventListener('afterprint', () => frame.remove(), { once: true });
        target.print();
        resolve();
      } catch (error) { frame.remove(); reject(error); }
    };
    frame.srcdoc = render(artwork);
    document.body.appendChild(frame);
  });
}
