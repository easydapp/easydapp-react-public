import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentInteraction } from '@jellypack/runtime/lib/model/components/interaction';
import {
    InteractionChooseTipMetadata,
    InteractionChooseTipMetadataStyle,
} from '@jellypack/runtime/lib/model/components/interaction/choose_tip';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import Select, { Option } from 'rc-select';
import '../../assets/css/rc-select.scss';
import { useCallback, useEffect, useState } from 'react';
import Icon from '../../common/icon';

export function ComponentInteractionChooseTipView({
    runtime,
    link,
    updated,
    metadata,
}: {
    className?: string;
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    interaction: ComponentInteraction;
    metadata: InteractionChooseTipMetadata;
}) {
    const [value, setValue] = useState<number>();
    const [values, setValues] = useState<[string[], string[] | undefined]>();

    useEffect(() => {
        if (runtime.should_show(link)) {
            // Read the output value
            const value = runtime.find_value<number>(link, 0);
            setValue(value?.value);

            // Calculate input value
            const values: string[] | undefined = runtime.input_value<string[]>(metadata.values, [
                { array: 'text' },
            ]);
            let tips: string[] | undefined = undefined;
            if (metadata.tips) {
                tips = runtime.input_value<string[]>(metadata.tips, [{ array: 'text' }]);
            }
            setValues(values ? [values, tips] : undefined);
        }

        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, metadata, updated]);

    const onChoose = useCallback(
        (index: number) => {
            // console.debug(`🚀 ~ onChange ~ index:`, index);
            runtime.refresh_interaction(link, index); // renew
            setValue(index);
        },
        [runtime, link],
    );

    const onClean = useCallback(() => {
        runtime.refresh_interaction(link, undefined);
        setValue(undefined);
    }, [runtime, link]);

    // * custom style
    const custom = parse_custom_style<InteractionChooseTipMetadataStyle>(metadata.style);

    return (
        <div
            className="w-full"
            style={{
                paddingTop: custom?.style?.paddingTop || '5px',
                paddingBottom: custom?.style?.paddingBottom || '5px',
            }}
        >
            {
                // Already output
                values !== undefined && value !== undefined && (
                    <div className={`ez-flex ez-h-11 ez-w-full ez-flex-shrink-0 ez-flex-col`}>
                        <div className="ez-flex ez-h-full ez-w-full ez-flex-row ez-items-center ez-justify-between ez-rounded-lg ez-border ez-border-[#ddd] ez-px-2 ez-py-1">
                            <div className="ez-text-medium ez-font-['JetBrainsMono'] ez-text-[12px]">
                                {custom?.outputLabel ? `${custom.outputLabel}: ` : ''}
                                {values[0][value]}
                            </div>
                            <div onClick={onClean}>
                                <Icon
                                    className="ez-h-4 ez-w-4 ez-cursor-pointer ez-text-[#999]"
                                    name="icon-close"
                                ></Icon>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                // Input parameter OK
                values !== undefined && value === undefined && (
                    <div className={`ez-flex ez-w-full ez-flex-col ez-gap-y-2`}>
                        {values && (
                            <div
                                className={`ez-select ez-flex ez-h-11 ez-w-full ez-flex-shrink-0 ez-flex-col`}
                            >
                                <Select
                                    className="ez-w-full"
                                    placeholder={custom?.placeholder}
                                    onChange={(e) => {
                                        console.log(e);
                                        onChoose(Number(e));
                                    }}
                                >
                                    {values[0].map((item, index) => (
                                        <Option key={index}>
                                            <div className="ez-flex ez-h-[30px] ez-cursor-pointer ez-items-center ez-justify-between ez-px-[0px]">
                                                <span className="ez-font-['JetBrainsMono'] ez-text-[12px] ez-font-medium ez-text-black">
                                                    {item}
                                                </span>
                                                <span className="ez-font-['JetBrainsMono'] ez-text-[12px] ez-font-normal ez-leading-[18px] ez-text-[#666666]">
                                                    {values[1] ? values[1][index] : undefined}
                                                </span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </div>
                )
            }
        </div>
    );
}
