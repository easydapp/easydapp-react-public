import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentCondition } from '@jellypack/runtime/lib/model/components/condition';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useEffect } from 'react';

export function ComponentConditionView({
    runtime,
    link,
    updated,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    condition: ComponentCondition;
}) {
    // const component = runtime.component(link);
    // console.debug(`🚀 ~ component:`, component);

    useEffect(() => {
        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, updated]);

    // if (!runtime.should_show(link)) return <></>; // No interface itself
    return <></>;
}
