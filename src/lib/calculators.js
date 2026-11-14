// Calculators

const num = (value, name) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) throw new Error(`${name} must be a positive number.`);
    return n;
};

const TO_FEET = { ft: 1, in: 1 / 12, yd: 3, m: 3.28084, cm: 0.0328084 };

export const volumeFromDimensions = ({ length, width, depth, lengthUnit = 'ft', depthUnit = 'in' }) => {
    const feet = num(length, 'Length') * TO_FEET[lengthUnit];
    const wide = num(width, 'Width') * TO_FEET[lengthUnit];
    const deep = num(depth, 'Depth') * TO_FEET[depthUnit];
    const cubicFeet = feet * wide * deep;
    return { cubicFeet, cubicYards: cubicFeet / 27, cubicMeters: cubicFeet * 0.0283168 };
};

export const concrete = ({ wastePercent = 10, ...dimensions }) => {
    const volume = volumeFromDimensions(dimensions);
    const factor = 1 + num(wastePercent, 'Waste') / 100;
    const cubicFeet = volume.cubicFeet * factor;
    return {
        cubicFeet,
        cubicYards: cubicFeet / 27,
        cubicMeters: cubicFeet * 0.0283168,
        bags60: Math.ceil(cubicFeet / 0.45),
        bags80: Math.ceil(cubicFeet / 0.6)
    };
};

export const dirt = ({ wastePercent = 0, ...dimensions }) => {
    const volume = volumeFromDimensions(dimensions);
    const factor = 1 + num(wastePercent, 'Waste') / 100;
    const cubicYards = volume.cubicYards * factor;
    // Loose topsoil weighs roughly 1.1 to 1.4 tons per cubic yard; 1.25 is used as an estimate.
    return { cubicFeet: volume.cubicFeet * factor, cubicYards, cubicMeters: volume.cubicMeters * factor, tons: cubicYards * 1.25 };
};

export const capRate = ({ price, income, expenses = 0 }) => {
    const p = num(price, 'Property price');
    if (p === 0) throw new Error('Property price must be greater than zero.');
    const noi = num(income, 'Income') - num(expenses, 'Expenses');
    return { noi, capRate: (noi / p) * 100 };
};

export const averageCost = (entries) => {
    const valid = entries.filter((entry) => entry.amount > 0);
    const totalAmount = valid.reduce((sum, entry) => sum + entry.amount, 0);
    const totalCost = valid.reduce((sum, entry) => sum + entry.amount * entry.price, 0);
    return { totalAmount, totalCost, average: totalAmount > 0 ? totalCost / totalAmount : 0 };
};

export const parseTradeLines = (text) => {
    const entries = [];
    for (const [index, raw] of text.split(/\r?\n/).entries()) {
        const line = raw.trim();
        if (!line) continue;
        const [amount, price] = line.split(/[,;\t ]+/).map(Number);
        if (!Number.isFinite(amount) || !Number.isFinite(price)) {
            if (index === 0) continue; // header row
            throw new Error(`Line ${index + 1} must look like "amount,price".`);
        }
        entries.push({ amount, price });
    }
    return entries;
};

const toMinutes = (time) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
};

// Minutes worked between two HH:MM times, minus a break; end earlier than start means overnight.
export const workMinutes = (start, end, breakMinutes = 0) => {
    const s = toMinutes(start);
    const e = toMinutes(end);
    if (s === null || e === null) return 0;
    const span = e >= s ? e - s : e + 24 * 60 - s;
    return Math.max(0, span - Number(breakMinutes || 0));
};

export const formatMinutes = (minutes) => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
