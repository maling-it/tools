import { zipSync } from 'fflate';

// Makes names unique within a ZIP: "a.png", "a (2).png", "a (3).png".
export const uniqueName = (name, used) => {
    const clean = name.replace(/[\\/:*?"<>|]+/g, '_');
    if (!used.has(clean.toLowerCase())) {
        used.add(clean.toLowerCase());
        return clean;
    }
    const dot = clean.lastIndexOf('.');
    const stem = dot > 0 ? clean.slice(0, dot) : clean;
    const ext = dot > 0 ? clean.slice(dot) : '';
    for (let i = 2; ; i++) {
        const candidate = `${stem} (${i})${ext}`;
        if (!used.has(candidate.toLowerCase())) {
            used.add(candidate.toLowerCase());
            return candidate;
        }
    }
};

// files: [{ name, data: Uint8Array }]. Returns the ZIP as bytes. Images and archives are stored without compression.
export const createZip = (files) => {
    const used = new Set();
    const entries = {};
    for (const file of files) {
        const name = uniqueName(file.name, used);
        entries[name] = [file.data, { level: /\.(png|jpe?g|webp|gif|zip|gz|pdf)$/i.test(name) ? 0 : 6 }];
    }
    return zipSync(entries);
};

export const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadZip = (files, filename = 'mools.zip') => downloadBlob(new Blob([createZip(files)], { type: 'application/zip' }), filename);

export const textBytes = (text) => new TextEncoder().encode(text);
