import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentView } from '@jellypack/runtime/lib/model/components/view';
import { ViewImageMetadata } from '@jellypack/runtime/lib/model/components/view/image';
import { image_view_supported_types } from '@jellypack/runtime/lib/model/components/view/inner/image';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useEffect, useState } from 'react';
import { InnerImageView } from './components/image';

export function ComponentViewImageView({
    runtime,
    link,
    updated,
    metadata,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    view: ComponentView;
    metadata: ViewImageMetadata;
}) {
    const [value, setValue] = useState<string | number[]>();
    const [href, setHref] = useState<string>();

    useEffect(() => {
        const value = runtime.input_value<string | number[]>(
            metadata.value,
            image_view_supported_types(),
        );

        setValue(value);

        if (metadata.href) {
            const href = runtime.input_value<string>(metadata.href, ['text']);
            if (href && href.startsWith('https://')) {
                setHref(href);
            }
        }

        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, updated, metadata]);

    if (value === undefined) return <></>;
    return (
        <div className="ez-flex ez-w-full">
            <InnerImageView value={value} href={href} customStyle={metadata.style} />
        </div>
    );
}
