import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentCode } from '@jellypack/runtime/lib/model/components/code';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useEffect } from 'react';

export function ComponentCodeView({
    runtime,
    link,
    updated,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    code: ComponentCode;
}) {
    // const component = runtime.component(link);
    // console.debug(`🚀 ~ component:`, component);

    useEffect(() => {
        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, updated]);

    // if (!runtime.should_show(link)) return <></>; // No interface itself
    return <></>;
}
