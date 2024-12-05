import { deepClone } from '@jellypack/runtime/lib/common/clones';
import { same } from '@jellypack/runtime/lib/common/same';
import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { FormMetadataArrayStyle } from '@jellypack/runtime/lib/model/components/form';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { LinkType } from '@jellypack/types';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useState } from 'react';
import { InnerComponentFormView } from '.';
import Icon from '../../../common/icon';

const checkValue = (value: { key: string; value: any }[] | undefined) => {
    if (value === undefined) return undefined;
    const v = [];
    for (let i = 0; i < value.length; i++) {
        if (value[i].value === undefined) return undefined;
        v[i] = deepClone(value[i].value);
    }
    return v;
};

export function InnerComponentFormArrayView({
    runtime,
    link,
    onValue,
    subtype,
    defaultValue,
    customStyle,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    onValue: (value: any[] | undefined) => void;
    subtype: LinkType;
    defaultValue?: any[];
    customStyle?: string;
}) {
    const [value, setValue] = useState<{ key: string; value: any }[]>();

    useEffect(() => {
        if (value === undefined && defaultValue !== undefined) {
            setValue(
                defaultValue.map((value) => ({
                    key: nanoid(),
                    value,
                })),
            );
            if (runtime.should_show(link) || defaultValue === undefined) onValue(defaultValue);
        }
    }, [onValue, defaultValue, value, runtime, link]);

    const onIncrement = useCallback(() => {
        let v = value ?? [];
        v = [...v];

        v.push({ key: nanoid(), value: undefined });

        setValue(v);

        const next = checkValue(v);
        if (runtime.should_show(link) || next === undefined) onValue(next);
    }, [onValue, value, runtime, link]);

    const onDelete = useCallback(
        (key: string) => {
            if (value === undefined) return;
            const index = value.findIndex((v) => v.key === key);
            if (index < 0 || value.length <= index) return;

            const v = value.filter((v) => v.key !== key);

            setValue(v);

            const next = checkValue(v);
            if (runtime.should_show(link) || next === undefined) onValue(next);
        },
        [onValue, value, runtime, link],
    );

    const onChange = useCallback(
        (key: string, newValue: any) => {
            let v = value ?? [];
            const index = v.findIndex((v) => v.key === key);
            if (index < 0 || v.length <= index) return;

            if (same(v[index]?.value, newValue)) return;

            v = [...v];

            v[index] = { key: v[index]?.key ?? nanoid(), value: newValue };

            setValue(v);

            const next = checkValue(v);
            if (runtime.should_show(link) || next === undefined) onValue(next);
        },
        [onValue, value, runtime, link],
    );

    // * custom style
    const custom = parse_custom_style<FormMetadataArrayStyle>(customStyle);

    if (!runtime.should_show(link)) return <></>;
    return (
        <div
            className="ez-flex ez-w-full ez-flex-col"
            style={{
                paddingTop: custom?.style?.paddingTop || '5px',
                paddingBottom: custom?.style?.paddingBottom || '5px',
            }}
        >
            {value !== undefined && (
                <div className="ez-mt-1 ez-flex ez-w-full ez-flex-col">
                    {value.map((item, index) => (
                        <div
                            className="ez-flex ez-w-full ez-items-center ez-gap-x-[11px]"
                            key={item.key}
                        >
                            <InnerComponentFormView
                                runtime={runtime}
                                link={link}
                                onValue={(v) => onChange(item.key, v)}
                                output={subtype}
                                defaultValue={defaultValue ? defaultValue[index] : undefined}
                                customStyle={custom?.subtype}
                            />
                            <div
                                className="ez-flex ez-cursor-pointer"
                                onClick={() => onDelete(item.key)}
                            >
                                <Icon name="icon-reduce" className="ez-h-11 ez-w-11"></Icon>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="ez-flex ez-w-full ez-cursor-pointer" onClick={onIncrement}>
                <Icon name="icon-push" className="ez-h-11 ez-w-11"></Icon>
            </div>
        </div>
    );
}
