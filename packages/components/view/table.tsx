import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentView } from '@jellypack/runtime/lib/model/components/view';
import { table_view_supported_types } from '@jellypack/runtime/lib/model/components/view/inner/table';
import { ViewTableMetadata } from '@jellypack/runtime/lib/model/components/view/table';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useEffect, useState } from 'react';
import { InnerTableView } from './components/table';

export function ComponentViewTableView({
    runtime,
    link,
    updated,
    metadata,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    view: ComponentView;
    metadata: ViewTableMetadata;
}) {
    const [value, setValue] = useState<{
        headers: string[];
        rows: string[][];
    }>();

    useEffect(() => {
        const value = runtime.input_value<{
            headers: string[];
            rows: string[][];
        }>(metadata.value, table_view_supported_types());

        setValue(value);

        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, updated, metadata]);

    if (value === undefined) return <></>;
    return (
        <div className="ez-flex ez-w-full">
            <InnerTableView value={value} customStyle={metadata.style} />
        </div>
    );
}
