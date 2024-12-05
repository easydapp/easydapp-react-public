// Static resources can use CDN proxy
export const cdn = (
    url: string | undefined,
    origin?: string, // If you need to complete the link, the source address used
    modify?: (cdn: string) => string, // If you want to modify the original URL
): string | undefined => {
    if (url === undefined) return undefined;
    if (!url.trim()) return url; // No content
    if (url.startsWith('https://p.easydapp.ai')) return url; // Already proxy
    // 0. Intercept the address that does not require proxy
    // for (const key of [
    //     'pk6rk-6aaaa-aaaae-qaazq-cai', // BTC Flower does not require proxy
    // ]) {
    //     if (url.indexOf(key) >= 0) return url;
    // }

    if (!url.match(/^https?:\/\//)) {
        // 0. If it is LocalHost, you don’t need an agent, asking for local resources
        if (location.origin === `http://localhost:5000`) {
            return url;
        }
        // 1. Make up the link
        url = `${
            origin ?? location.origin // If origin is empty, it means using the current access address
        }${url}`;
    }

    // 2. Check if you need to encode
    url = decodeURIComponent(url); // Decoding first to prevent the coded content that has already been encoded
    let path = (() => {
        let index = url.indexOf('/', 9); // Find the first /
        if (index >= 0) return url.substring(index);
        // If not /, see if there are parameters
        index = url.indexOf('?');
        if (index === -1) return '';
        return url.substring(index);
    })();
    url = encodeURIComponent(url); // encode

    // 3. Back to an agent
    if (path.indexOf('url=') >= 0) path = '';
    const hasSearch = path.indexOf('?') >= 0;

    let cdn = `https://p.easydapp.ai${path}${!hasSearch ? '?' : ''}${
        path.endsWith('?') ? '' : '&'
    }url=${url}`;
    if (modify) cdn = modify(cdn); // modify
    return cdn;
};

// The picture specify the deformation direction
export const cdn_by_resize = (
    url: string | undefined,
    {
        width,
        height,
        fit,
        quality,
    }: {
        width?: number;
        height?: number;
        fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
        quality?: number;
    },
    origin?: string,
) =>
    cdn(url, origin, (cdn) => {
        const changed = width || height || fit || quality;
        if (!changed) return cdn;
        const index = cdn.lastIndexOf('?');
        if (index === -1) cdn += '?';
        if (width) cdn += `${cdn.endsWith('?') ? '' : '&'}width=${width}`;
        if (height) cdn += `${cdn.endsWith('?') ? '' : '&'}height=${height}`;
        if (fit) cdn += `${cdn.endsWith('?') ? '' : '&'}fit=${fit}`;
        if (quality) cdn += `${cdn.endsWith('?') ? '' : '&'}quality=${quality}`;
        return cdn;
    });
