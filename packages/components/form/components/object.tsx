import { deepClone } from '@jellypack/runtime/lib/common/clones';
import { same } from '@jellypack/runtime/lib/common/same';
import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { FormMetadataObjectStyle } from '@jellypack/runtime/lib/model/components/form';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { ObjectSubitem } from '@jellypack/types/lib/types';
import { useCallback, useEffect, useState } from 'react';
import { InnerComponentFormView } from '.';

export function InnerComponentFormObjectView({
    runtime,
    link,
    onValue,
    subitems,
    defaultValue,
    customStyle,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    onValue: (value: Record<string, any> | undefined) => void;
    subitems: ObjectSubitem[];
    defaultValue?: Record<string, any>;
    customStyle?: string;
}) {
    const [value, setValue] = useState<Record<string, any>>();

    useEffect(() => {
        if (value === undefined && defaultValue !== undefined) {
            setValue(defaultValue);
            if (runtime.should_show(link) || defaultValue === undefined) onValue(defaultValue);
        }
    }, [onValue, defaultValue, value, runtime, link]);

    const onChange = useCallback(
        (key: string, newValue: any) => {
            let v = value;
            if (v === undefined) v = {};
            if (same(v[key], newValue)) return;

            v[key] = newValue;
            setValue(v);

            const checkValue = (
                value: Record<string, any> | undefined,
                subitems: ObjectSubitem[],
            ) => {
                if (value === undefined) return undefined;
                const v: Record<string, any> = {};
                for (const subitem of subitems) {
                    if (value[subitem.key] === undefined) return undefined;
                    v[subitem.key] = deepClone(value[subitem.key]);
                }
                return v;
            };

            const next = checkValue(v, subitems);
            if (runtime.should_show(link) || next === undefined) onValue(next);
        },
        [onValue, value, subitems, runtime, link],
    );

    // * custom style
    const custom = parse_custom_style<FormMetadataObjectStyle>(customStyle);

    if (!runtime.should_show(link)) return <></>;
    return (
        <div
            className="ez-flex ez-w-full ez-flex-col"
            style={{
                paddingTop: custom?.style?.paddingTop || '5px',
                paddingBottom: custom?.style?.paddingBottom || '5px',
            }}
        >
            {subitems.map((subitem, index) => (
                <div className="ez-flex ez-w-full ez-flex-col" key={index}>
                    <div className="ez-ez-w-full ez-mb-1 ez-flex ez-font-['JetBrainsMono'] ez-text-sm ez-font-medium ez-text-black">
                        {subitem.key}
                    </div>
                    <InnerComponentFormView
                        runtime={runtime}
                        link={link}
                        onValue={(v) => onChange(subitem.key, v)}
                        output={subitem.ty}
                        defaultValue={defaultValue ? defaultValue[subitem.key] : undefined}
                        customStyle={custom?.subitems ? custom.subitems[index] : undefined}
                    />
                </div>
            ))}
        </div>
    );
}
