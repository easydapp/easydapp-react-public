import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentInteraction } from '@jellypack/runtime/lib/model/components/interaction';
import {
    InteractionChooseMetadata,
    InteractionChooseMetadataStyle,
} from '@jellypack/runtime/lib/model/components/interaction/choose';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useCallback, useEffect, useState } from 'react';
import Button from '../../common/button';

type ChooseItem = {
    name: string;
    value: string;
};

export function ComponentInteractionChooseView({
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
    metadata: InteractionChooseMetadata;
}) {
    const [value, setValue] = useState<string>();
    const [values, setValues] = useState<ChooseItem[]>();
    const [loading, setLoading] = useState<boolean>(false);

    const onChoose = useCallback(
        (value: string) => {
            // console.debug(`🚀 ~ onChange ~ value:`, value);
            setLoading(true);
            runtime.refresh_interaction(link, value); // renew
            setValue(value);
            setLoading(false);
        },
        [runtime, link],
    );

    const onClean = useCallback(() => {
        setLoading(true);
        runtime.refresh_interaction(link, undefined);
        setValue(undefined);
        setLoading(false);
    }, [runtime, link]);

    // * custom style
    const custom = parse_custom_style<InteractionChooseMetadataStyle>(metadata.style);

    useEffect(() => {
        if (runtime.should_show(link)) {
            // Read the output value
            const value = runtime.find_value<string>(link, 0);
            setValue(value?.value);

            // Calculate input value
            let values: ChooseItem[] | undefined = [];
            for (let i = 0; i < metadata.values.length; i++) {
                const { name, value: input_value } = metadata.values[i];
                const value = runtime.input_value<string>(input_value, ['text']);
                if (value === undefined) {
                    values = undefined;
                    break;
                }
                values.push({ name, value });
            }
            setValues(values);
        }

        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, metadata, updated]);

    return (
        <div
            className="w-full"
            style={{
                paddingTop: custom?.style?.paddingTop || '5px',
                paddingBottom: custom?.style?.paddingBottom || '5px',
            }}
        >
            {
                // Already determined parameters
                values !== undefined && value !== undefined && (
                    <div className={`ez-flex ez-w-full ez-flex-col`}>
                        <div className="ez-mb-1 ez-flex ez-w-full ez-font-['JetBrainsMono'] ez-text-sm ez-font-medium ez-text-black">
                            {custom?.outputLabel ? `${custom.outputLabel}: ` : ''} {value}
                        </div>
                        <Button
                            loading={loading}
                            onClick={() => !loading && onClean()}
                            buttonText="Clean"
                            style={{
                                color: custom?.style?.color || '#ffffff',
                                backgroundColor: custom?.style?.backgroundColor || '#000000',
                                borderRadius: custom?.style?.borderRadius || '0.5rem',
                                fontWeight: custom?.style?.fontWeight || '400',
                            }}
                        ></Button>
                    </div>
                )
            }

            {
                // Input parameter OK
                values !== undefined && value === undefined && (
                    <div
                        className="ez-grid ez-grid-cols-2 ez-items-center ez-gap-2"
                        style={{
                            gridTemplateColumns:
                                custom?.style?.gridTemplateColumns || 'repeat(2, minmax(0, 1fr))',
                        }}
                    >
                        {values.map((item, index) => (
                            <Button
                                key={index}
                                loading={loading}
                                onClick={() => !loading && onChoose(item.value)}
                                buttonText={item.name || ''}
                                style={{
                                    color: custom?.style?.color || '#ffffff',
                                    backgroundColor: custom?.style?.backgroundColor || '#000000',
                                    borderRadius: custom?.style?.borderRadius || '0.5rem',
                                    fontWeight: custom?.style?.fontWeight || '400',
                                }}
                                className={
                                    (custom?.style?.gridTemplateColumns ===
                                        'repeat(2, minmax(0, 1fr))' &&
                                        values?.length % 2 === 1 &&
                                        values?.length - 1 === index &&
                                        'ez-col-span-full',
                                    custom?.style?.gridTemplateColumns ===
                                        'repeat(3, minmax(0, 1fr))' &&
                                        values?.length % 3 === 2 &&
                                        values?.length - 1 === index &&
                                        'ez-col-span-full',
                                    custom?.style?.gridTemplateColumns ===
                                        'repeat(3, minmax(0, 1fr))' &&
                                        values?.length % 3 === 2 &&
                                        values?.length - 2 === index &&
                                        'ez-col-span-full',
                                    custom?.style?.gridTemplateColumns ===
                                        'repeat(3, minmax(0, 1fr))' &&
                                        values?.length % 3 === 1 &&
                                        values?.length - 1 === index &&
                                        'ez-col-span-full')
                                }
                            ></Button>
                        ))}
                    </div>
                )
            }
        </div>
    );
}
