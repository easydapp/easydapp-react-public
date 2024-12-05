// Whether to specify the number of accuracy
export const isValidNumber = (value: string | undefined, max_decimals?: number): boolean => {
    if (value === undefined) return false;
    if (max_decimals === undefined) return !!value.match(/^[1-9]\d*$/);
    if (max_decimals <= 0) throw new Error(`decimal can not be ${max_decimals}`);
    if (max_decimals === 1)
        return (
            !!value.match(/^[1-9]\d*(\.[0-9])?$/) ||
            !!value.match(/^0(\.[0-9])?$/) ||
            !!value.match(/^[1-9]\d*\.$/) ||
            !!value.match(/^0\.$/)
        );
    return (
        RegExp(`^[1-9]\\d*(\\.\\d{1,${max_decimals}})?$`).test(value) ||
        RegExp(`^0(\\.\\d{1,${max_decimals}})?$`).test(value) ||
        RegExp(`^[1-9]\\d*\\.$`).test(value) ||
        RegExp(`^0\\.$`).test(value)
    );
};

// Calculate the number according to the index
export const exponentNumber = (value: string, decimals: number): string => {
    if (decimals !== Math.floor(decimals)) throw new Error(`decimals must be a integer`);
    if (decimals === 0) return value;
    switch (value.split('.').length) {
        case 1:
            value = value + '.'; // Add without decimal points
            break;
        case 2:
            // There are 1 decimal point
            break;
        default:
            throw new Error(`can not calculate number: ${value}`);
    }
    const chars = value.split('');

    // First increase 0 in the corresponding direction 0
    const zeros: string[] = [];
    const d = Math.abs(decimals);
    for (let i = 0; i < d; i++) zeros.push('0');
    if (decimals > 0) chars.splice(chars.length, 0, ...zeros);
    else chars.splice(0, 0, ...zeros);

    // Mobile decimal point
    const index = chars.findIndex((s) => s === '.');
    chars.splice(index, 1); // Remove the decimal point
    chars.splice(index + decimals, 0, '.'); // Insert a decimal point

    // Remove the subsequent 0
    do {
        const current = chars.length - 1;
        if (chars[current] === '0') chars.splice(current, 1);
    } while (chars[chars.length - 1] === '0');

    // Remove the previous 0
    do {
        if (chars[0] === '0') chars.splice(0, 1);
    } while (chars[0] === '0');

    value = chars.join('');
    if (value.startsWith('.')) value = '0' + value;
    if (value.endsWith('.')) value = value.substring(0, value.length - 1);
    return value;
};

// Digital plus a comma every 3 digits
export const thousandComma = (text_number: string): string => {
    const splits = text_number.split('.');
    const res1: string[] = [];
    const res2: string[] = [];
    splits[0]
        .split('')
        .reverse()
        .map((item, i) => {
            if (i % 3 == 0 && i != 0) res1.push(',');
            res1.push(item);
        });
    if (splits.length > 1) {
        splits[1].split('').map((item, i) => {
            if (i % 3 == 0 && i != 0) res2.push(',');
            res2.push(item);
        });
    }
    return res1.reverse().join('') + (splits.length > 1 ? '.' + res2.join('') : '');
};

// Digital plus a comma every 3 digits // ? Only the integer part requires a comma separation
export const thousandCommaOnlyInteger = (text_number: string): string => {
    const splits = text_number.split('.');
    const res1: string[] = [];
    splits[0]
        .split('')
        .reverse()
        .map((item, i) => {
            if (i % 3 == 0 && i != 0) res1.push(',');
            res1.push(item);
        });
    return res1.reverse().join('') + (splits.length > 1 ? '.' + splits[1] : '');
};
