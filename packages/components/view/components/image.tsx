import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import { InnerViewImageMetadataStyle } from '@jellypack/runtime/lib/model/components/view/inner/image';
import { useEffect, useRef, useState } from 'react';
import { parseStyleWithImportant } from '../../../common/utils';
import { proxy_image_src } from '../common';

export function InnerImageView({
    value,
    href,
    customStyle,
}: {
    value: string | number[];
    href?: string;
    customStyle?: string;
}) {
    const [error, setError] = useState<string>();
    const [src, setSrc] = useState<string>();

    useEffect(() => {
        const src = proxy_image_src(value, 800);
        if (src) setSrc(src);
        else setError(`Unsupported image source: ${value}`);
    }, [value]);

    // * custom style
    const custom = parse_custom_style<InnerViewImageMetadataStyle>(customStyle);
    const imageElementRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        if (custom?.style && imageElementRef.current) {
            const styleWithImportant = parseStyleWithImportant(custom.style);

            Object.entries(styleWithImportant).forEach(([key, value]) => {
                if (imageElementRef.current) {
                    imageElementRef.current.style.setProperty(key, value, 'important');
                }
            });
        }
    }, [custom?.style]);

    return (
        <>
            {error ? (
                <div className="ez-flex ez-w-full ez-items-center ez-justify-center ez-font-['JetBrainsMono'] ez-text-base ez-text-[#ff5b5b]">
                    {error}
                </div>
            ) : (
                <>
                    {href && (
                        <a href={href} target="_blank">
                            {src && (
                                <img
                                    className="ez-aspect-auto ez-w-full ez-rounded-xl ez-object-cover ez-object-center"
                                    style={{ ...custom?.style }}
                                    src={src}
                                    ref={imageElementRef}
                                />
                            )}
                        </a>
                    )}
                    {!href && (
                        <>
                            {src && (
                                <img
                                    className="ez-aspect-auto ez-w-full ez-rounded-xl ez-object-cover ez-object-center"
                                    style={{ ...custom?.style }}
                                    src={src}
                                    ref={imageElementRef}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </>
    );
}
