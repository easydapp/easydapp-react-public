import {
    InnerViewMetadata,
    match_inner_view_metadata,
} from '@jellypack/runtime/lib/model/components/view/inner';
import { bool_view_supported_types } from '@jellypack/runtime/lib/model/components/view/inner/bool';
import { image_view_supported_types } from '@jellypack/runtime/lib/model/components/view/inner/image';
import { table_view_supported_types } from '@jellypack/runtime/lib/model/components/view/inner/table';
import { text_view_supported_types } from '@jellypack/runtime/lib/model/components/view/inner/text';
import { link_type_is_match_js_value } from '@jellypack/types/lib/types';

export const proxy_image_src = (value: string | number[], width?: number): string | undefined => {
    if (Array.isArray(value) && !value.find((item) => !Number.isInteger(item)))
        return `data:image/png;base64${window.btoa(String.fromCharCode(...new Uint8Array(value)))}`;
    if (typeof value === 'string') {
        if (value.startsWith('https://p.easydapp.ai?url=')) return value;
        if (value.startsWith('https://'))
            return `https://p.easydapp.ai?url=${encodeURIComponent(value)}${
                width !== undefined ? `&width=${width}` : ''
            }`;
        if (value.startsWith('data:image/')) return value;
    }
};

export const is_image_value = (value: any): boolean => {
    if (Array.isArray(value) && !value.find((item) => !Number.isInteger(item))) return true;
    if (typeof value === 'string') return true;
    return false;
};

export const is_table_value = (value: any): boolean => {
    if (typeof value === 'object') {
        const headers = value.headers;
        if (!Array.isArray(headers) || headers.find((item) => typeof item !== 'string'))
            return false;
        const rows = value.rows;
        if (!Array.isArray(rows)) return false;
        for (const row of rows) {
            if (!Array.isArray(row) || row.find((item) => typeof item !== 'string')) return false;
        }
        return true;
    }
    return false;
};

export const is_html_value = (value: any): boolean => {
    if (typeof value === 'object') {
        const image = value.image;
        if (typeof image !== 'object') return false;
        for (const key in image) if (!is_image_value(image[key])) return false;
        const text = value.text;
        if (typeof text !== 'object') return false;
        for (const key in image) if (typeof image[key] !== 'string') return false;
        return true;
    }
    return false;
};

export const check_inner_view_value = (inner: InnerViewMetadata, value: any): boolean => {
    return match_inner_view_metadata(inner, {
        text: () => {
            for (const ty of text_view_supported_types()) {
                if (link_type_is_match_js_value(ty, value)) return true;
            }
            return false;
        },
        bool: () => {
            for (const ty of bool_view_supported_types()) {
                if (link_type_is_match_js_value(ty, value)) return true;
            }
            return false;
        },
        image: () => {
            for (const ty of image_view_supported_types()) {
                if (link_type_is_match_js_value(ty, value)) return true;
            }
            return false;
        },
        table: () => {
            for (const ty of table_view_supported_types()) {
                if (link_type_is_match_js_value(ty, value)) return true;
            }
            return false;
        },
        html: () => is_html_value(value),
        array: (array) => {
            if (!Array.isArray(value)) return false;
            for (const item of value) {
                if (!check_inner_view_value(array.inner, item)) return false;
            }
            return true;
        },
        object: (object) => {
            if (typeof value !== 'object') return false;
            for (const item of object.inner) {
                if (!check_inner_view_value(item.inner, value[item.key])) return false;
            }
            return true;
        },
    });
};
