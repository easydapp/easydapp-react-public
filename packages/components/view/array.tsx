import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentView } from '@jellypack/runtime/lib/model/components/view';
import { ViewArrayMetadata } from '@jellypack/runtime/lib/model/components/view/array';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useEffect, useState } from 'react';
import { check_inner_view_value } from './common';
import { InnerComponentView } from './components';

export function ComponentViewArrayView({
    runtime,
    link,
    updated,
    metadata,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    view: ComponentView;
    metadata: ViewArrayMetadata;
}) {
    const [value, setValue] = useState<any[]>();

    useEffect(() => {
        const value = runtime.input_value<any[]>(metadata.value, (value: any): boolean => {
            // Determine whether it is correct
            if (!Array.isArray(value)) return false;
            for (const item of value) {
                if (!check_inner_view_value(metadata.inner, item)) {
                    return false;
                }
            }
            return true;
        });

        setValue(value);

        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, updated, metadata]);

    // * custom style
    // const custom = parse_custom_style<ViewArrayMetadataStyle>(metadata.style);

    if (value === undefined) return <></>;
    return (
        <div className="ez-flex ez-w-full">
            {value !== undefined && (
                <>
                    {value.map((item, index) => (
                        <InnerComponentView key={index} inner={metadata.inner} value={item} />
                    ))}
                </>
            )}
        </div>
    );
}
