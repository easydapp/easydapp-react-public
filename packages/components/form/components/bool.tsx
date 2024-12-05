import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { FormMetadataBoolStyle } from '@jellypack/runtime/lib/model/components/form';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import Switch from 'rc-switch';
import '../../../assets/css/rc-switch.scss';
import { useCallback, useEffect, useState } from 'react';

export function InnerComponentFormBoolView({
    runtime,
    link,
    onValue,
    defaultValue,
    customStyle,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    onValue: (value: boolean | undefined) => void;
    defaultValue?: boolean;
    customStyle?: string;
}) {
    const [value, setValue] = useState<boolean>();

    useEffect(() => {
        if (value === undefined && defaultValue !== undefined) {
            setValue(defaultValue);
            if (runtime.should_show(link) || defaultValue === undefined) onValue(defaultValue);
        }
    }, [onValue, defaultValue, value, runtime, link]);

    const onChange = useCallback(
        (input_value: boolean) => {
            if (input_value === value) return;
            setValue(input_value);
            if (runtime.should_show(link) || input_value === undefined) onValue(input_value);
        },
        [onValue, value, runtime, link],
    );

    // * custom style
    const custom = parse_custom_style<FormMetadataBoolStyle>(customStyle);

    if (!runtime.should_show(link)) return <></>;
    return (
        <div
            className="ez-switch ez-flex ez-w-full ez-items-center ez-gap-x-2"
            style={{
                paddingTop: custom?.style?.paddingTop || '5px',
                paddingBottom: custom?.style?.paddingBottom || '5px',
            }}
        >
            {!custom?.label && value && custom?.trueText && (
                <div className="ez-font-['JetBrainsMono'] ez-text-sm ez-font-normal ez-leading-[18px] ez-text-black">
                    {custom.trueText}
                </div>
            )}
            <Switch defaultChecked={value} onChange={(val) => onChange(val)} />
            {!custom?.label && value && custom?.falseText && (
                <div className="ez-font-['JetBrainsMono'] ez-text-sm ez-font-normal ez-leading-[18px] ez-text-black">
                    {custom.falseText}
                </div>
            )}
        </div>
    );
}
