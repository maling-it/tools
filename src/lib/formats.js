// Data format conversions: YAML, TOML, JSON and XML
import YAML from 'yaml';
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';

const toJson = (value, indent = 2) => JSON.stringify(value, null, indent);

const requireObject = (value, format) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${format} needs an object at the top level.`);
    }
    return value;
};

export const yamlToJson = (text, indent = 2) => toJson(YAML.parse(text), indent);
export const jsonToYaml = (text) => YAML.stringify(JSON.parse(text), { indent: 2 }).trimEnd();
export const tomlToJson = (text, indent = 2) => toJson(parseToml(text), indent);
export const jsonToToml = (text) => stringifyToml(requireObject(JSON.parse(text), 'TOML')).trimEnd();
export const yamlToToml = (text) => stringifyToml(requireObject(YAML.parse(text), 'TOML')).trimEnd();
export const tomlToYaml = (text) => YAML.stringify(parseToml(text), { indent: 2 }).trimEnd();

const escapeXml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const tagName = (name) => {
    const cleaned = String(name).replace(/[^A-Za-z0-9_.-]/g, '_');
    return /^[A-Za-z_]/.test(cleaned) ? cleaned : `_${cleaned}`;
};

const toXml = (name, value, depth) => {
    const pad = '  '.repeat(depth);
    const tag = tagName(name);
    if (Array.isArray(value)) return value.map((item) => toXml(name, item, depth)).join('\n');
    if (value === null || value === undefined) return `${pad}<${tag}/>`;
    if (typeof value !== 'object') return `${pad}<${tag}>${escapeXml(value)}</${tag}>`;

    // Follows the conventions of the XML to JSON tool: "@name" is an attribute, "#text" is text content.
    const attributes = Object.entries(value)
        .filter(([key]) => key.startsWith('@'))
        .map(([key, v]) => ` ${tagName(key.slice(1))}="${escapeXml(v)}"`)
        .join('');
    const text = value['#text'] !== undefined ? escapeXml(value['#text']) : '';
    const children = Object.entries(value)
        .filter(([key]) => !key.startsWith('@') && key !== '#text')
        .map(([key, v]) => toXml(key, v, depth + 1))
        .join('\n');

    if (!children) return text ? `${pad}<${tag}${attributes}>${text}</${tag}>` : `${pad}<${tag}${attributes}/>`;
    return `${pad}<${tag}${attributes}>${text ? text : ''}\n${children}\n${pad}</${tag}>`;
};

export const jsonToXml = (text, { root = 'root' } = {}) => {
    const data = JSON.parse(text);
    const keys = data !== null && typeof data === 'object' && !Array.isArray(data) ? Object.keys(data) : [];
    // A single top-level key becomes the root element, anything else is wrapped.
    if (keys.length === 1 && !keys[0].startsWith('@') && keys[0] !== '#text') {
        return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(keys[0], data[keys[0]], 0)}`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(root, data, 0)}`;
};
