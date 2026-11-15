import { describe, expect, it } from 'vitest';
import { buildGitignore, dockerRunToCompose, dockerRunToComposeText, ibanReport, jsonToSchema, shellSplit, validateIban } from './backlog.js';

describe('validateIban', () => {
    it('accepts real examples, with spaces and lowercase', () => {
        expect(validateIban('GB82 WEST 1234 5698 7654 32').valid).toBe(true);
        expect(validateIban('de89370400440532013000').valid).toBe(true);
        expect(validateIban('NL91ABNA0417164300').valid).toBe(true);
    });
    it('explains why an IBAN is wrong', () => {
        expect(validateIban('GB82 WEST 1234 5698 7654 33').reason).toMatch(/check digits/);
        expect(validateIban('GB82WEST12345698765').reason).toMatch(/has 22 characters, this one has 19/);
        expect(validateIban('ID1234567890').reason).toMatch(/not a country that uses IBANs/);
        expect(validateIban('hello').reason).toMatch(/starts with two letters/);
    });
    it('reports one line per IBAN', () => {
        expect(ibanReport('GB82 WEST 1234 5698 7654 32\nbad')).toBe('Valid: GB82 WEST 1234 5698 7654 32 (GB)\nInvalid: bad - An IBAN starts with two letters (the country) and two check digits, followed by letters and digits.');
    });
});

describe('jsonToSchema', () => {
    it('infers objects, arrays, formats and required keys', () => {
        const schema = JSON.parse(jsonToSchema('{"id":1,"price":9.5,"email":"a@b.co","tags":["x"],"when":"2026-01-02","ok":true,"n":null}'));
        expect(schema.$schema).toContain('2020-12');
        expect(schema.properties.id.type).toBe('integer');
        expect(schema.properties.price.type).toBe('number');
        expect(schema.properties.email).toEqual({ type: 'string', format: 'email' });
        expect(schema.properties.when.format).toBe('date');
        expect(schema.properties.tags).toEqual({ type: 'array', items: { type: 'string' } });
        expect(schema.properties.n.type).toBe('null');
        expect(schema.required).toHaveLength(7);
    });
    it('merges array items and only requires keys every item has', () => {
        const schema = JSON.parse(jsonToSchema('[{"a":1,"b":"x"},{"a":2}]'));
        expect(schema.items.required).toEqual(['a']);
        expect(Object.keys(schema.items.properties)).toEqual(['a', 'b']);
    });
    it('can leave out required keys and formats', () => {
        const schema = JSON.parse(jsonToSchema('{"e":"a@b.co"}', { required: false, formats: false }));
        expect(schema.required).toBeUndefined();
        expect(schema.properties.e).toEqual({ type: 'string' });
    });
    it('throws on invalid JSON', () => {
        expect(() => jsonToSchema('{nope')).toThrow(SyntaxError);
    });
});

describe('buildGitignore', () => {
    it('combines templates and understands aliases', () => {
        const text = buildGitignore('JS, mac, vscode');
        expect(text).toContain('node_modules/');
        expect(text).toContain('.DS_Store');
        expect(text).toContain('.vscode/*');
    });
    it('lists the options for an unknown name', () => {
        expect(() => buildGitignore('cobol')).toThrow(/Unknown template: cobol\. Available: node/);
        expect(() => buildGitignore('')).toThrow(/at least one/);
    });
});

describe('shellSplit', () => {
    it('handles quotes, escapes and line continuations', () => {
        expect(shellSplit(`docker run -e "A=b c" -e 'D=e' \\\n  img cmd\\ x`)).toEqual(['docker', 'run', '-e', 'A=b c', '-e', 'D=e', 'img', 'cmd x']);
        expect(() => shellSplit('echo "open')).toThrow(/not closed/);
    });
});

describe('dockerRunToCompose', () => {
    it('converts a typical command', () => {
        const { yaml, notes } = dockerRunToCompose('docker run -d --name web -p 8080:80 -v data:/var/lib -v ./site:/usr/share/nginx/html:ro -e MODE=prod --restart unless-stopped --rm nginx:1.27');
        expect(yaml).toContain('services:\n  web:\n    image: nginx:1.27');
        expect(yaml).toContain('container_name: web');
        expect(yaml).toContain('restart: unless-stopped');
        expect(yaml).toContain('      - "8080:80"');
        expect(yaml).toContain('      - ./site:/usr/share/nginx/html:ro');
        expect(yaml).toContain('volumes:\n  data:');
        expect(notes[0]).toMatch(/--rm/);
    });
    it('keeps the command, flags with = and combined short flags', () => {
        const { yaml } = dockerRunToCompose('docker run -dit --network=host --env-file .env alpine sh -c "echo hi"');
        expect(yaml).toContain('stdin_open: true');
        expect(yaml).toContain('tty: true');
        expect(yaml).toContain('network_mode: host');
        expect(yaml).toContain('command: ["sh", "-c", "echo hi"]');
    });
    it('declares custom networks as external', () => {
        expect(dockerRunToCompose('docker run --network mynet redis').yaml).toContain('networks:\n  mynet:\n    external: true');
    });
    it('explains mistakes', () => {
        expect(() => dockerRunToCompose('docker ps')).toThrow(/Start with "docker run"/);
        expect(() => dockerRunToCompose('docker run -d')).toThrow(/No image found/);
        expect(() => dockerRunToCompose('docker run -p')).toThrow(/needs a value/);
    });
    it('adds notes as comments in the text version', () => {
        expect(dockerRunToComposeText('docker run --rm busybox')).toContain('# Note: --rm');
    });
});
