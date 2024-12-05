import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentView } from '@jellypack/runtime/lib/model/components/view';
import { text_view_supported_types } from '@jellypack/runtime/lib/model/components/view/inner/text';
import { ViewTextMetadata } from '@jellypack/runtime/lib/model/components/view/text';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useEffect, useState } from 'react';
import { thousandComma } from '../../data/numbers';
import { InnerTextView } from './components/text';

export function ComponentViewTextView({
    runtime,
    link,
    updated,
    metadata,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    view: ComponentView;
    metadata: ViewTextMetadata;
}) {
    const [value, setValue] = useState<string>();
    const [href, setHref] = useState<string>();

    useEffect(() => {
        const value = runtime.input_value<string | number>(
            metadata.value,
            text_view_supported_types(),
        );

        if (typeof value === 'string') setValue(value);
        else if (typeof value === 'number')
            setValue(thousandComma(`${value}`)); // Do the number types need to be divided according to the comma?
        else setValue(undefined);

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
            <InnerTextView value={value} href={href} customStyle={metadata.style} />
        </div>
    );
}
