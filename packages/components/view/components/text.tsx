import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import { InnerViewTextMetadataStyle } from '@jellypack/runtime/lib/model/components/view/inner/text';
import { useEffect, useRef } from 'react';
import { cn, parseStyleWithImportant } from '../../../common/utils';

export function InnerTextView({
    value,
    href,
    customStyle,
}: {
    value: string;
    href?: string;
    customStyle?: string;
}) {
    // * custom style
    const custom = parse_custom_style<InnerViewTextMetadataStyle>(customStyle);
    const textElementRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (custom?.style && textElementRef.current) {
            const styleWithImportant = parseStyleWithImportant(custom.style);

            Object.entries(styleWithImportant).forEach(([key, value]) => {
                if (textElementRef.current) {
                    textElementRef.current.style.setProperty(key, value, 'important');
                }
            });
        }
    }, [custom?.style]);

    return (
        <>
            {href && (
                <a href={href} target="_blank">
                    <div
                        className="ez-text-medium ez-inline-block ez-w-full ez-break-words ez-py-[5px] ez-text-left ez-font-['JetBrainsMono'] ez-text-[14px] ez-font-normal ez-leading-tight ez-text-black"
                        ref={textElementRef}
                    >
                        {value}
                    </div>
                </a>
            )}
            {/* {JSON.stringify(a)} */}
            {!href && (
                <div
                    className={cn(
                        "ez-text-medium ez-inline-block ez-w-full ez-break-words ez-py-[5px] ez-text-left ez-font-['JetBrainsMono'] ez-text-[14px] ez-font-normal ez-leading-tight ez-text-black",
                    )}
                    ref={textElementRef}
                >
                    {value}
                </div>
            )}
        </>
    );
}
