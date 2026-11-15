// Code and document formatters
import { format } from 'sql-formatter';
import { marked } from 'marked';
import cronstrue from 'cronstrue';
import { diffLines, diffWords } from 'diff';

export const SQL_DIALECTS = ['sql', 'mysql', 'postgresql', 'sqlite', 'mariadb', 'transactsql', 'bigquery', 'plsql'];

export const formatSql = (text, { language = 'sql', tabWidth = 2, keywordCase = 'upper' } = {}) => {
    try {
        return format(text, { language, tabWidth, keywordCase });
    } catch (error) {
        // The parser's message continues with a dump of the token; the first line says what is wrong.
        throw new Error(`Could not format the SQL: ${error.message.split('\n')[0].replace(/\s*Unexpected .*$/, '')}`.trim());
    }
};

export const markdownToHtml = (markdown) => marked.parse(markdown, { async: false, gfm: true });

// Text and JSON diff. Returns parts of { type: "added" | "removed" | "same", value }.
const toParts = (changes) => changes.map((c) => ({ type: c.added ? 'added' : c.removed ? 'removed' : 'same', value: c.value }));

export const textDiff = (a, b, { mode = 'lines' } = {}) => toParts(mode === 'words' ? diffWords(a, b) : diffLines(a, b));

const sortKeys = (value) => {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value !== null && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortKeys(value[k])]));
    return value;
};

export const jsonDiff = (a, b) => {
    const normalize = (text, name) => {
        try {
            return JSON.stringify(sortKeys(JSON.parse(text)), null, 2) + '\n';
        } catch (e) {
            throw new Error(`${name} is not valid JSON: ${e.message}`);
        }
    };
    return toParts(diffLines(normalize(a, 'The first JSON'), normalize(b, 'The second JSON')));
};

// Cron
export const explainCron = (expression) => {
    const fields = expression.trim().split(/\s+/);
    if (fields.length !== 5) throw new Error('A cron expression has five fields: minute hour day-of-month month day-of-week.');
    try {
        return cronstrue.toString(expression.trim(), { throwExceptionOnParseError: true, use24HourTimeFormat: true });
    } catch (error) {
        // cronstrue throws plain strings such as "Error: minutes part must be >= 0 and <= 59".
        throw new Error(`Invalid cron expression: ${String(error?.message ?? error).replace(/^Error:\s*/, '')}`);
    }
};

const FIELD_RANGES = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];

const parseCronField = (field, [min, max], index) => {
    const values = new Set();
    for (const part of field.split(',')) {
        const [rangePart, stepPart] = part.split('/');
        const step = stepPart === undefined ? 1 : Number(stepPart);
        if (!Number.isInteger(step) || step < 1) throw new Error(`Invalid step in "${part}".`);
        let start;
        let end;
        if (rangePart === '*') [start, end] = [min, max];
        else if (rangePart.includes('-')) [start, end] = rangePart.split('-').map(Number);
        else {
            start = Number(rangePart);
            end = stepPart === undefined ? start : max;
        }
        if (![start, end].every(Number.isInteger) || start < min || end > max || start > end) throw new Error(`Value out of range in "${part}".`);
        for (let v = start; v <= end; v += step) values.add(index === 4 && v === 7 ? 0 : v);
    }
    return values;
};

// Weekdays accept 0-7 (both 0 and 7 are Sunday). Next run times for a standard 5 field expression, computed in the given local time.
export const nextCronRuns = (expression, count = 5, from = new Date()) => {
    const fields = expression.trim().split(/\s+/);
    if (fields.length !== 5) throw new Error('A cron expression has five fields.');
    const [minutes, hours, days, months, weekdays] = fields.map((f, i) => parseCronField(f, FIELD_RANGES[i], i));
    const dayRestricted = fields[2] !== '*';
    const weekdayRestricted = fields[4] !== '*';

    const runs = [];
    const cursor = new Date(from);
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1);
    for (let i = 0; i < 366 * 24 * 60 && runs.length < count; i++) {
        const dayOk = dayRestricted && weekdayRestricted
            ? days.has(cursor.getDate()) || weekdays.has(cursor.getDay())
            : days.has(cursor.getDate()) && weekdays.has(cursor.getDay());
        if (months.has(cursor.getMonth() + 1) && dayOk && hours.has(cursor.getHours()) && minutes.has(cursor.getMinutes())) {
            runs.push(new Date(cursor));
        }
        cursor.setMinutes(cursor.getMinutes() + 1);
    }
    return runs;
};
