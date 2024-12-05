import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentConst } from '@jellypack/runtime/lib/model/components/constant';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useEffect } from 'react';

export function ComponentConstView({
    runtime,
    link,
    updated,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    constant: ComponentConst;
}) {
    // const component = runtime.component(link);
    // console.debug(`🚀 ~ component:`, component);

    useEffect(() => {
        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, updated]);

    // if (!runtime.should_show(link)) return <></>; // no deps
    return <></>;
}
