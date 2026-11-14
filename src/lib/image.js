// Browser-side image helpers

export const isHeic = (file) => /\.hei[cf]$/i.test(file.name) || /image\/hei[cf]/i.test(file.type);

export const convertHeic = async (file, type = 'image/jpeg', quality = 0.9) => {
    const { default: heic2any } = await import('heic2any');
    const result = await heic2any({ blob: file, toType: type, quality });
    return Array.isArray(result) ? result[0] : result;
};

export const readAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
        reader.readAsDataURL(file);
    });

// Re-encodes any browser-decodable image (e.g. WEBP) as PNG bytes.
export const imageToPngBytes = async (blob) => {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0);
    bitmap.close();
    const png = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    return new Uint8Array(await png.arrayBuffer());
};

const A4 = [595.28, 841.89];

// Builds a PDF with one image per page. `pageSize` is "image" (page matches the image) or "a4" (image fitted with margin).
export const imagesToPdf = async (files, { pageSize = 'image' } = {}) => {
    const { PDFDocument } = await import('pdf-lib');
    const pdf = await PDFDocument.create();

    for (const file of files) {
        let blob = file;
        if (isHeic(file)) blob = await convertHeic(file, 'image/jpeg');

        const bytes = new Uint8Array(await blob.arrayBuffer());
        let image;
        if (blob.type === 'image/jpeg') image = await pdf.embedJpg(bytes);
        else if (blob.type === 'image/png') image = await pdf.embedPng(bytes);
        else image = await pdf.embedPng(await imageToPngBytes(blob));

        if (pageSize === 'a4') {
            const margin = 36;
            const page = pdf.addPage(A4);
            const scale = Math.min((A4[0] - margin * 2) / image.width, (A4[1] - margin * 2) / image.height, 1);
            const width = image.width * scale;
            const height = image.height * scale;
            page.drawImage(image, { x: (A4[0] - width) / 2, y: (A4[1] - height) / 2, width, height });
        } else {
            const page = pdf.addPage([image.width, image.height]);
            page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
    }

    return pdf.save();
};

export const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
