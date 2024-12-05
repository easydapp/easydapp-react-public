import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { proxy_image_src } from '../common';

export function InnerHtmlView({
    value,
    template,
}: {
    value: {
        image?: Record<string, string | number[]>;
        text?: Record<string, string>;
    };
    template: string;
    customStyle?: string;
}) {
    const [error, setError] = useState<string>();
    const [html, setHtml] = useState<string>();

    useEffect(() => {
        let html = template;
        if (value.image) {
            for (const [key, v] of Object.entries(value.image)) {
                const src = proxy_image_src(v, 600);
                if (src === undefined) return setError(`Unsupported image source: ${v}`);
                const placeholder = 'src="\\${' + key + '}"';
                html = html.replace(new RegExp(placeholder, 'g'), `src="${src}"`);
            }
        }
        if (value.text) {
            for (const [key, v] of Object.entries(value.text)) {
                if (v.indexOf('script') >= 0) return setError(`Can not contains script: ${v}`);
                let value = v;

                // ! Replace key chars
                value = value.replace(/>/g, '&gt');
                value = value.replace(/</g, '&lt');

                const placeholder = '\\${' + key + '}';
                html = html.replace(new RegExp(placeholder, 'g'), value);
            }
        }
        const cleanHTML = DOMPurify.sanitize(html);
        setHtml(cleanHTML);
    }, [value, template]);

    // * custom style
    // const custom = parse_custom_style<InnerViewHtmlMetadataStyle>(customStyle);

    return (
        <>
            {error && (
                <div className="ez-flex ez-w-full ez-items-center ez-justify-center ez-font-['JetBrainsMono'] ez-text-base ez-text-[#ff5b5b]">
                    {error}
                </div>
            )}
            {html && (
                <div
                    className="ez-flex ez-w-full ez-flex-col ez-items-start ez-justify-start ez-gap-2"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            )}
        </>
    );
}
