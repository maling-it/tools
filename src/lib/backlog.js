// Tools from the backlog: IBAN validator, JSON Schema generator, .gitignore generator, Docker run to Compose.

// ---------- IBAN ----------
// Length of the IBAN for each country that uses one (ISO 13616 registry).
const IBAN_LENGTHS = {
    AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27, MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, SA: 24, SC: 31, SE: 24, SI: 19, SK: 24, SM: 27, ST: 25, SV: 28, TL: 23, TN: 24, TR: 26, UA: 29, VA: 22, VG: 24, XK: 20
};

const ibanMod97 = (iban) => {
    const rearranged = iban.slice(4) + iban.slice(0, 4);
    let remainder = 0;
    for (const char of rearranged) {
        const digits = /[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char;
        for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
    }
    return remainder;
};

/** Checks an IBAN (spaces and case are ignored) and returns the details. */
export const validateIban = (input) => {
    const iban = String(input).replace(/[\s-]/g, '').toUpperCase();
    const country = iban.slice(0, 2);
    const result = { iban, valid: false, country, checkDigits: iban.slice(2, 4), formatted: iban.replace(/(.{4})/g, '$1 ').trim(), reason: '' };
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) result.reason = 'An IBAN starts with two letters (the country) and two check digits, followed by letters and digits.';
    else if (!IBAN_LENGTHS[country]) result.reason = `${country} is not a country that uses IBANs.`;
    else if (iban.length !== IBAN_LENGTHS[country]) result.reason = `An IBAN from ${country} has ${IBAN_LENGTHS[country]} characters, this one has ${iban.length}.`;
    else if (ibanMod97(iban) !== 1) result.reason = 'The check digits do not match, so there is probably a typing mistake.';
    else result.valid = true;
    return result;
};

/** One IBAN per line, in, text out. */
export const ibanReport = (text) =>
    text
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line) => {
            const r = validateIban(line);
            return r.valid ? `Valid: ${r.formatted} (${r.country})` : `Invalid: ${line.trim()} - ${r.reason}`;
        })
        .join('\n');

// ---------- JSON Schema ----------
const typeOf = (value) => (value === null ? 'null' : Array.isArray(value) ? 'array' : Number.isInteger(value) ? 'integer' : typeof value);

const FORMATS = [
    ['date-time', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/],
    ['date', /^\d{4}-\d{2}-\d{2}$/],
    ['email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/],
    ['uri', /^https?:\/\/\S+$/],
    ['uuid', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i]
];

const inferSchema = (value, options) => {
    const type = typeOf(value);
    if (type === 'object') {
        const keys = Object.keys(value);
        const schema = { type: 'object', properties: Object.fromEntries(keys.map((k) => [k, inferSchema(value[k], options)])) };
        if (options.required && keys.length) schema.required = keys;
        return schema;
    }
    if (type === 'array') {
        const items = value.map((v) => inferSchema(v, options));
        const unique = [...new Map(items.map((i) => [JSON.stringify(i), i])).values()];
        if (unique.length === 0) return { type: 'array' };
        if (unique.length === 1) return { type: 'array', items: unique[0] };
        // Several shapes of the same object type are merged by keeping every property.
        if (unique.every((i) => i.type === 'object')) return { type: 'array', items: mergeObjects(unique, options) };
        return { type: 'array', items: { anyOf: unique } };
    }
    if (type === 'string' && options.formats) {
        const found = FORMATS.find(([, re]) => re.test(value));
        if (found) return { type, format: found[0] };
    }
    return { type };
};

const mergeObjects = (schemas, options) => {
    const properties = {};
    for (const s of schemas) for (const [k, v] of Object.entries(s.properties)) properties[k] = properties[k] ? { anyOf: [...new Map([...(properties[k].anyOf ?? [properties[k]]), v].map((i) => [JSON.stringify(i), i])).values()] } : v;
    for (const [k, v] of Object.entries(properties)) if (v.anyOf?.length === 1) properties[k] = v.anyOf[0];
    const merged = { type: 'object', properties };
    if (options.required) {
        const required = Object.keys(properties).filter((k) => schemas.every((s) => k in s.properties));
        if (required.length) merged.required = required;
    }
    return merged;
};

/** Infers a JSON Schema (draft 2020-12) from a sample JSON document. */
export const jsonToSchema = (text, { required = true, formats = true, title = '' } = {}) => {
    const schema = { $schema: 'https://json-schema.org/draft/2020-12/schema', ...(title ? { title } : {}), ...inferSchema(JSON.parse(text), { required, formats }) };
    return JSON.stringify(schema, null, 2);
};

// ---------- .gitignore ----------
export const GITIGNORE_TEMPLATES = {
    node: ['# Node.js', 'node_modules/', 'npm-debug.log*', 'yarn-debug.log*', 'yarn-error.log*', 'pnpm-debug.log*', '.npm/', '.eslintcache', 'dist/', 'build/', 'coverage/', '*.tsbuildinfo'],
    python: ['# Python', '__pycache__/', '*.py[cod]', '*.egg-info/', '.venv/', 'venv/', '.pytest_cache/', '.mypy_cache/', '.ruff_cache/', 'dist/', 'build/', '.coverage', 'htmlcov/'],
    java: ['# Java', '*.class', '*.jar', '*.war', 'target/', '.gradle/', 'build/', 'out/', 'hs_err_pid*'],
    go: ['# Go', '*.exe', '*.test', '*.out', 'vendor/', 'bin/', 'go.work'],
    rust: ['# Rust', 'target/', '**/*.rs.bk'],
    dotnet: ['# .NET', 'bin/', 'obj/', '*.user', '*.suo', '.vs/', 'TestResults/', '*.nupkg'],
    php: ['# PHP', 'vendor/', 'composer.phar', '.phpunit.result.cache', 'storage/*.key'],
    ruby: ['# Ruby', '*.gem', '.bundle/', 'vendor/bundle/', 'log/', 'tmp/', 'coverage/'],
    swift: ['# Swift and Xcode', '.build/', 'DerivedData/', '*.xcuserstate', 'xcuserdata/', 'Pods/'],
    unity: ['# Unity', '[Ll]ibrary/', '[Tt]emp/', '[Oo]bj/', '[Bb]uild/', '[Ll]ogs/', 'UserSettings/', '*.csproj', '*.sln'],
    macos: ['# macOS', '.DS_Store', '.AppleDouble', '.LSOverride', '._*'],
    windows: ['# Windows', 'Thumbs.db', 'ehthumbs.db', 'Desktop.ini', '$RECYCLE.BIN/'],
    linux: ['# Linux', '*~', '.directory', '.Trash-*'],
    vscode: ['# Visual Studio Code', '.vscode/*', '!.vscode/settings.json', '!.vscode/extensions.json', '!.vscode/launch.json'],
    jetbrains: ['# JetBrains IDEs', '.idea/', '*.iml', 'out/'],
    vim: ['# Vim', '*.swp', '*.swo', 'Session.vim', '.netrwhist'],
    env: ['# Environment and secrets', '.env', '.env.*', '!.env.example', '*.pem', '*.key'],
    logs: ['# Logs', '*.log', 'logs/'],
    docker: ['# Docker', '.docker/', 'docker-compose.override.yml']
};

/** Builds a .gitignore from a list of names such as "node, macos, vscode". */
export const buildGitignore = (names) => {
    const list = (Array.isArray(names) ? names : String(names).split(/[\s,]+/))
        .map((n) => n.trim().toLowerCase())
        .filter(Boolean);
    const aliases = { js: 'node', javascript: 'node', typescript: 'node', ts: 'node', py: 'python', csharp: 'dotnet', 'c#': 'dotnet', mac: 'macos', osx: 'macos', intellij: 'jetbrains', idea: 'jetbrains' };
    const resolved = [...new Set(list.map((n) => aliases[n] ?? n))];
    const unknown = resolved.filter((n) => !GITIGNORE_TEMPLATES[n]);
    if (unknown.length) throw new Error(`Unknown template: ${unknown.join(', ')}. Available: ${Object.keys(GITIGNORE_TEMPLATES).join(', ')}.`);
    if (!resolved.length) throw new Error(`Name at least one template. Available: ${Object.keys(GITIGNORE_TEMPLATES).join(', ')}.`);
    return resolved.map((n) => GITIGNORE_TEMPLATES[n].join('\n')).join('\n\n') + '\n';
};

// ---------- docker run to Compose ----------
/** Splits a shell command into words, honoring quotes, escapes and line continuations. */
export const shellSplit = (input) => {
    const text = input.replace(/\\\r?\n/g, ' ');
    const words = [];
    let word = '';
    let quote = '';
    let started = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quote) {
            if (c === quote) quote = '';
            else if (c === '\\' && quote === '"' && /["\\$`]/.test(text[i + 1] ?? '')) word += text[++i];
            else word += c;
        } else if (c === '"' || c === "'") {
            quote = c;
            started = true;
        } else if (c === '\\' && i + 1 < text.length) {
            word += text[++i];
            started = true;
        } else if (/\s/.test(c)) {
            if (started || word) words.push(word);
            word = '';
            started = false;
        } else {
            word += c;
            started = true;
        }
    }
    if (quote) throw new Error(`A ${quote} quote is not closed.`);
    if (started || word) words.push(word);
    return words;
};

// Values like 8080:80 are quoted because YAML 1.1 parsers read some of them as base-60 numbers.
const yamlString = (value) => (/^[\w./:@%+=,-]+$/.test(value) && !/^\d+:\d+/.test(value) && !/^(true|false|yes|no|null|on|off|~|\d+(\.\d+)?)$/i.test(value) ? value : JSON.stringify(value));

// Flags that take a value, mapped to the Compose key they fill.
const VALUE_FLAGS = {
    '--name': 'name', '-p': 'ports', '--publish': 'ports', '-v': 'volumes', '--volume': 'volumes', '-e': 'environment', '--env': 'environment', '--env-file': 'env_file',
    '--restart': 'restart', '--network': 'network', '--net': 'network', '-w': 'working_dir', '--workdir': 'working_dir', '-u': 'user', '--user': 'user', '--entrypoint': 'entrypoint',
    '-h': 'hostname', '--hostname': 'hostname', '--cap-add': 'cap_add', '--cap-drop': 'cap_drop', '-l': 'labels', '--label': 'labels', '--memory': 'mem_limit', '-m': 'mem_limit',
    '--cpus': 'cpus', '--add-host': 'extra_hosts', '--device': 'devices', '--dns': 'dns', '--platform': 'platform', '--pull': null, '--log-driver': null, '--stop-signal': 'stop_signal', '--health-cmd': 'healthcheck', '--tmpfs': 'tmpfs', '--link': 'links'
};
const BOOLEAN_FLAGS = { '--privileged': 'privileged', '-i': 'stdin_open', '--interactive': 'stdin_open', '-t': 'tty', '--tty': 'tty', '--init': 'init', '--read-only': 'read_only' };
const IGNORED_FLAGS = new Set(['-d', '--detach', '--rm', '--sig-proxy=false']);

/** Converts a `docker run` command into a docker-compose.yml. Returns { yaml, notes }. */
export const dockerRunToCompose = (command) => {
    const words = shellSplit(command.trim());
    if (words[0] === 'sudo') words.shift();
    if (words[0] === 'docker') words.shift();
    if (words[0] === 'container') words.shift();
    if (words[0] !== 'run') throw new Error('Start with "docker run", followed by options, the image and an optional command.');
    words.shift();

    const spec = { environment: [], ports: [], volumes: [], labels: [], cap_add: [], cap_drop: [], extra_hosts: [], devices: [], dns: [], tmpfs: [], links: [], env_file: [] };
    const notes = [];
    let image = '';
    let i = 0;
    for (; i < words.length; i++) {
        const word = words[i];
        if (!word.startsWith('-') || word === '-') {
            image = word;
            i++;
            break;
        }
        if (IGNORED_FLAGS.has(word)) {
            if (word === '--rm') notes.push('--rm has no Compose equivalent: use `docker compose run --rm` instead.');
            continue;
        }
        const [flag, inline] = word.startsWith('--') && word.includes('=') ? [word.slice(0, word.indexOf('=')), word.slice(word.indexOf('=') + 1)] : [word, undefined];
        if (BOOLEAN_FLAGS[flag]) {
            spec[BOOLEAN_FLAGS[flag]] = true;
            continue;
        }
        // Short flags can be combined, for example -dit.
        if (/^-[a-zA-Z]{2,}$/.test(word) && [...word.slice(1)].every((c) => ['d', 'i', 't'].includes(c))) {
            for (const c of word.slice(1)) if (c === 'i') spec.stdin_open = true; else if (c === 't') spec.tty = true;
            continue;
        }
        // -p8080:80 style: a short flag with its value attached.
        const attached = /^-[pveulwhm]./.test(word) && !word.startsWith('--') ? [word.slice(0, 2), word.slice(2)] : null;
        const [name, value] = attached ?? [flag, inline];
        if (!(name in VALUE_FLAGS)) {
            notes.push(`Unknown option ${name} was skipped.`);
            if (inline === undefined && words[i + 1] && !words[i + 1].startsWith('-') && !attached && words.slice(i + 2).some((w) => !w.startsWith('-'))) i++;
            continue;
        }
        const val = value ?? words[++i];
        if (val === undefined) throw new Error(`The option ${name} needs a value.`);
        const key = VALUE_FLAGS[name];
        if (key === null) notes.push(`${name} was skipped.`);
        else if (key === 'environment') spec.environment.push(val);
        else if (Array.isArray(spec[key])) spec[key].push(val);
        else spec[key] = val;
    }
    if (!image) throw new Error('No image found. Put the image name after the options, for example "nginx:latest".');
    const args = words.slice(i);

    const service = spec.name || image.split('/').pop().split(':')[0].split('@')[0] || 'app';
    const lines = ['services:', `  ${service}:`, `    image: ${yamlString(image)}`];
    const scalar = (key, value) => value !== undefined && value !== '' && lines.push(`    ${key}: ${typeof value === 'boolean' ? value : yamlString(String(value))}`);
    const list = (key, items) => {
        if (!items.length) return;
        lines.push(`    ${key}:`);
        for (const item of items) lines.push(`      - ${yamlString(item)}`);
    };
    if (spec.name) scalar('container_name', spec.name);
    scalar('hostname', spec.hostname);
    scalar('restart', spec.restart);
    scalar('user', spec.user);
    scalar('working_dir', spec.working_dir);
    scalar('platform', spec.platform);
    scalar('stop_signal', spec.stop_signal);
    scalar('privileged', spec.privileged);
    scalar('stdin_open', spec.stdin_open);
    scalar('tty', spec.tty);
    scalar('init', spec.init);
    scalar('read_only', spec.read_only);
    scalar('mem_limit', spec.mem_limit);
    if (spec.cpus) scalar('cpus', spec.cpus);
    if (spec.entrypoint) lines.push(`    entrypoint: ${yamlString(spec.entrypoint)}`);
    if (args.length) lines.push(`    command: [${args.map((a) => JSON.stringify(a)).join(', ')}]`);
    list('ports', spec.ports);
    list('volumes', spec.volumes);
    list('environment', spec.environment);
    list('env_file', spec.env_file);
    list('labels', spec.labels);
    list('cap_add', spec.cap_add);
    list('cap_drop', spec.cap_drop);
    list('extra_hosts', spec.extra_hosts);
    list('devices', spec.devices);
    list('dns', spec.dns);
    list('tmpfs', spec.tmpfs);
    list('links', spec.links);
    if (spec.network) {
        if (['host', 'none', 'bridge'].includes(spec.network)) scalar('network_mode', spec.network);
        else {
            lines.push('    networks:', `      - ${yamlString(spec.network)}`);
            lines.push('', 'networks:', `  ${yamlString(spec.network)}:`, '    external: true');
        }
    }
    if (spec.healthcheck) lines.push('    healthcheck:', `      test: ["CMD-SHELL", ${JSON.stringify(spec.healthcheck)}]`);
    // Named volumes (not paths) must be declared at the top level.
    const named = [...new Set(spec.volumes.map((v) => v.split(':')[0]).filter((v) => v && !/^[./~$]/.test(v) && !v.includes('/')))];
    if (named.length) lines.push('', 'volumes:', ...named.map((n) => `  ${yamlString(n)}:`));
    return { yaml: lines.join('\n') + '\n', notes };
};

/** Text in, text out for the tool page: the YAML, followed by notes as comments. */
export const dockerRunToComposeText = (command) => {
    const { yaml, notes } = dockerRunToCompose(command);
    return notes.length ? `${yaml}\n${notes.map((n) => `# Note: ${n}`).join('\n')}\n` : yaml;
};
