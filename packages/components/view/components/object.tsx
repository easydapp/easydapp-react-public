import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import {
    InnerViewObjectItem,
    InnerViewObjectMetadataStyle,
} from '@jellypack/runtime/lib/model/components/view/inner/object';
import { InnerComponentView } from '.';

export function InnerObjectView({
    value,
    inner,
    customStyle,
}: {
    value: Record<string, any>;
    inner: InnerViewObjectItem[];
    customStyle?: string;
}) {
    // * custom style
    const custom = parse_custom_style<InnerViewObjectMetadataStyle>(customStyle);
    console.log('🚀 ~ custom:', custom);

    return (
        <div className={`ez-flex ez-w-full ez-flex-col`}>
            {value !== undefined && (
                <>
                    {inner.map((item) => (
                        <InnerComponentView
                            key={item.key}
                            inner={item.inner}
                            value={value[item.key]}
                        />
                    ))}
                </>
            )}
        </div>
    );
}
