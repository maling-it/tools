// Favicon files: an ICO container for PNG images, the HTML snippet and the web manifest.

/** Wraps PNG images in an .ico file. pngs: [{ size, data: Uint8Array }], sizes up to 256. */
export const buildIco = (pngs) => {
    if (!pngs.length) throw new Error('Add at least one image to put in the .ico file.');
    const headerSize = 6 + 16 * pngs.length;
    const total = pngs.reduce((n, p) => n + p.data.length, headerSize);
    const out = new Uint8Array(total);
    const view = new DataView(out.buffer);
    view.setUint16(2, 1, true); // type: icon
    view.setUint16(4, pngs.length, true);
    let offset = headerSize;
    pngs.forEach((png, i) => {
        if (png.size < 1 || png.size > 256) throw new Error('Icon sizes in an .ico file go from 1 to 256 pixels.');
        const entry = 6 + 16 * i;
        out[entry] = png.size === 256 ? 0 : png.size;
        out[entry + 1] = png.size === 256 ? 0 : png.size;
        view.setUint16(entry + 4, 1, true); // color planes
        view.setUint16(entry + 6, 32, true); // bits per pixel
        view.setUint32(entry + 8, png.data.length, true);
        view.setUint32(entry + 12, offset, true);
        out.set(png.data, offset);
        offset += png.data.length;
    });
    return out;
};

/** The files a site needs, apart from the images: the HTML for <head> and the web manifest. */
export const faviconMarkup = ({ name = 'My site', themeColor = '#ffffff', basePath = '/' } = {}) => {
    const clean = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const html = [
        `<link rel="icon" href="${clean}favicon.ico" sizes="48x48">`,
        `<link rel="icon" type="image/png" sizes="32x32" href="${clean}favicon-32x32.png">`,
        `<link rel="icon" type="image/png" sizes="16x16" href="${clean}favicon-16x16.png">`,
        `<link rel="apple-touch-icon" href="${clean}apple-touch-icon.png">`,
        `<link rel="manifest" href="${clean}site.webmanifest">`,
        `<meta name="theme-color" content="${themeColor}">`
    ].join('\n');
    const manifest = JSON.stringify(
        {
            name,
            short_name: name.slice(0, 12),
            icons: [
                { src: `${clean}android-chrome-192x192.png`, sizes: '192x192', type: 'image/png' },
                { src: `${clean}android-chrome-512x512.png`, sizes: '512x512', type: 'image/png' }
            ],
            theme_color: themeColor,
            background_color: themeColor,
            display: 'standalone'
        },
        null,
        2
    );
    return { html, manifest };
};

/** Image sizes (pixels) and the file names they are saved under. */
export const FAVICON_SIZES = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' }
];
