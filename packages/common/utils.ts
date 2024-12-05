import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const parseStyleWithImportant = (style: Record<string, string>, keys?: string[]) => {
    const formattedStyle: Record<string, string> = {};

    const convertToCSSKey = (key: string) => {
        return key.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`).toLowerCase();
    };

    const entriesToProcess = keys
        ? Object.entries(style).filter(([key]) => keys.includes(key))
        : Object.entries(style);

    entriesToProcess.forEach(([key, value]) => {
        const cssKey = convertToCSSKey(key);
        formattedStyle[cssKey] = `${value}`; // add !important
    });

    return formattedStyle;
};
