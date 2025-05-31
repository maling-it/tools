// Text escaping utilities
export const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export const unescapeHtml = (safe) => {
    return safe
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
};

export const escapeXml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
};

export const unescapeXml = (safe) => {
    return safe
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&apos;/g, "'");
};

// Text transformation utilities
export const textStats = (text) => {
    const totalWords = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const uniqueWords = [...new Set(text.toLowerCase().match(/\b\w+\b/g) || [])].length;
    const totalLines = text.split('\n').length;
    const totalCharacters = text.length;
    const totalCharactersNoSpaces = text.replace(/\s/g, '').length;

    return {
        totalWords,
        uniqueWords,
        totalLines,
        totalCharacters,
        totalCharactersNoSpaces
    };
};

// Copy to clipboard utility
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
};
