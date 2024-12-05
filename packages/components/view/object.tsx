import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentView } from '@jellypack/runtime/lib/model/components/view';
import { ViewObjectMetadata } from '@jellypack/runtime/lib/model/components/view/object';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useEffect, useState } from 'react';
import { check_inner_view_value } from './common';
import { InnerComponentView } from './components';

export function ComponentViewObjectView({
    runtime,
    link,
    updated,
    metadata,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    view: ComponentView;
    metadata: ViewObjectMetadata;
}) {
    const [value, setValue] = useState<Record<string, any>>();

    useEffect(() => {
        const value = runtime.input_value<Record<string, any>>(
            metadata.value,
            (value: any): boolean => {
                // Determine whether it is correct
                if (typeof value !== 'object') return false;
                for (const item of metadata.inner) {
                    if (!check_inner_view_value(item.inner, value[item.key])) {
                        return false;
                    }
                }
                return true;
            },
        );

        setValue(value);

        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, updated, metadata]);

    // * custom style
    // const custom = parse_custom_style<ViewObjectMetadataStyle>(metadata.style);

    if (value === undefined) return <></>;
    return (
        <div className="ez-flex ez-w-full ez-flex-col">
            {value !== undefined && (
                <>
                    {metadata.inner.map((item) => {
                        return (
                            <InnerComponentView
                                key={item.key}
                                inner={item.inner}
                                value={value[item.key]}
                            />
                        );
                    })}
                </>
            )}
        </div>
    );
}
