import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { FormMetadataNumberStyle } from '@jellypack/runtime/lib/model/components/form';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useCallback, useEffect, useState } from 'react';
import { isValidNumber } from '../../../data/numbers';

export function InnerComponentFormNumberView({
    runtime,
    link,
    onValue,
    defaultValue,
    customStyle,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    onValue: (value: number | undefined) => void;
    defaultValue?: number;
    customStyle?: string;
}) {
    const [value, setValue] = useState<string>();

    useEffect(() => {
        if (value === undefined && defaultValue !== undefined) {
            setValue(defaultValue.toString());
            if (runtime.should_show(link) || defaultValue === undefined) onValue(defaultValue);
        }
    }, [onValue, defaultValue, value, runtime, link]);

    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const input_value = event.target.value;
            if (input_value.length === 0) {
                setValue(input_value);
                onValue(undefined);
                return;
            }

            if (
                input_value.startsWith('-')
                    ? isValidNumber(input_value.substring(1), 15)
                    : isValidNumber(input_value, 15)
            ) {
                if (input_value === value) return;
                console.log('input number', value, '->', input_value);
                setValue(input_value);
                const next = parseFloat(input_value);
                if (runtime.should_show(link) || next === undefined) onValue(next);
            }
        },
        [onValue, value, runtime, link],
    );

    // * custom style
    const custom = parse_custom_style<FormMetadataNumberStyle>(customStyle);

    if (!runtime.should_show(link)) return <></>;
    return (
        <div
            className="flex ez-w-full"
            style={{
                paddingTop: custom?.style?.paddingTop || '5px',
                paddingBottom: custom?.style?.paddingBottom || '5px',
            }}
        >
            <div
                className="ez-flex ez-h-[44px] ez-w-full ez-items-center ez-border ez-border-[#DDD] ez-px-[12px] ez-font-['JetBrainsMono']"
                style={{
                    borderRadius: custom?.style?.borderRadius || '0.5rem',
                    borderStyle: custom?.style?.borderStyle || 'solid',
                }}
            >
                <input
                    placeholder={custom?.placeholder}
                    className="ez-flex ez-h-[42px] ez-flex-1 ez-appearance-none ez-outline-none placeholder:ez-text-[#999]"
                    type="number"
                    value={value ?? ''}
                    onChange={onChange}
                ></input>
                {custom?.suffix && (
                    <p className="ez-font-['JetBrainsMono'] ez-text-sm ez-font-normal ez-leading-[18px] ez-text-black">
                        {custom?.suffix}
                    </p>
                )}
            </div>
        </div>
    );
}
