import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentView } from '@jellypack/runtime/lib/model/components/view';
import { ViewBoolMetadata } from '@jellypack/runtime/lib/model/components/view/bool';
import { bool_view_supported_types } from '@jellypack/runtime/lib/model/components/view/inner/bool';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useEffect, useState } from 'react';
import { InnerBoolView } from './components/bool';

export function ComponentViewBoolView({
    runtime,
    link,
    updated,
    metadata,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    view: ComponentView;
    metadata: ViewBoolMetadata;
}) {
    const [value, setValue] = useState<boolean>();

    useEffect(() => {
        const value = runtime.input_value<boolean>(metadata.value, bool_view_supported_types());

        setValue(value);

        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, updated, metadata]);

    if (value === undefined) return <></>;
    return (
        <div className="ez-flex ez-w-full">
            <InnerBoolView value={value} customStyle={metadata.style} />
        </div>
    );
}
