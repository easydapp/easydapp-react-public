import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import { InnerViewMetadata } from '@jellypack/runtime/lib/model/components/view/inner';
import { InnerViewArrayMetadataStyle } from '@jellypack/runtime/lib/model/components/view/inner/array';
import { InnerComponentView } from '.';

export function InnerArrayView({
    value,
    inner,
    customStyle,
}: {
    value: any[];
    inner: InnerViewMetadata;
    customStyle?: string;
}) {
    // * custom style
    const custom = parse_custom_style<InnerViewArrayMetadataStyle>(customStyle);
    console.log('🚀 ~ custom:', custom);

    return (
        <div className={`ez-flex ez-w-full ez-flex-col`}>
            {value !== undefined && (
                <>
                    {value.map((item, index) => (
                        <InnerComponentView key={index} inner={inner} value={item} />
                    ))}
                </>
            )}
        </div>
    );
}
