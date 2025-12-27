export function preloadImages(urls: string[]) {
  return Promise.allSettled(
    urls.map(
      (src) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load: ${src}`));
          img.src = src;
        }),
    ),
  );
}