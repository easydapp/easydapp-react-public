import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentParam } from '@jellypack/runtime/lib/model/components/param';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useEffect } from 'react';

export function ComponentParamView({
    runtime,
    link,
    updated,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    param: ComponentParam;
}) {
    // const component = runtime.component(link);
    // console.debug(`🚀 ~ component:`, component);

    useEffect(() => {
        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, updated]);

    // if (!runtime.should_show(link)) return <></>; // no deps
    return <></>;
}
