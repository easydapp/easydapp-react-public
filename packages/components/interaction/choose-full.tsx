import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentInteraction } from '@jellypack/runtime/lib/model/components/interaction';
import {
    InteractionChooseFullMetadata,
    InteractionChooseFullMetadataStyle,
} from '@jellypack/runtime/lib/model/components/interaction/choose_full';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useCallback, useEffect, useState } from 'react';
import Button from '../../common/button';

type ChooseItem = {
    option: string;
    value: string;
};

export function ComponentInteractionChooseFullView({
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
    metadata: InteractionChooseFullMetadata;
}) {
    const [error, setError] = useState<string>();

    const [value, setValue] = useState<string>();
    const [values, setValues] = useState<ChooseItem[]>();

    useEffect(() => {
        if (runtime.should_show(link)) {
            // Read the output value
            const value = runtime.find_value<string>(link, 0);
            setValue(value?.value);

            // Calculate input value
            const values: ChooseItem[] | undefined = runtime.input_value<ChooseItem[]>(
                metadata.values,
                [
                    {
                        array: {
                            object: [
                                { key: 'option', ty: 'text' },
                                { key: 'value', ty: 'text' },
                            ],
                        },
                    },
                ],
            );
            setValues(values);
        }

        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, metadata, updated]);

    const onChoose = (value: string) => {
        // console.debug(`🚀 ~ onChange ~ value:`, value);
        runtime.refresh_interaction(link, value); // renew
    };

    const [inputValue, setInputValue] = useState<string | undefined>(metadata.form?.default);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        // console.debug(`🚀 ~ onChange ~ value:`, value);
        runtime.validate_form(link, value).then((error) => {
            if (error) {
                setError(error);
                setInputValue(undefined); // renew
                return;
            }
            setError(undefined);
            setInputValue(value); // renew
        });
    };

    const onConfirm = useCallback(() => {
        setLoading(true);
        setTimeout(() => setLoading(false), inputValue !== undefined ? 333 : 100);
        runtime.refresh_interaction(link, inputValue);
        setValue(inputValue);
    }, [runtime, link, inputValue]);

    const onClean = useCallback(() => {
        runtime.refresh_interaction(link, undefined);
        setValue(undefined);
    }, [runtime, link]);

    const [loading, setLoading] = useState(false);

    // * custom style
    const custom = parse_custom_style<InteractionChooseFullMetadataStyle>(metadata.style);

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
                            onClick={() => onClean()}
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
                    <div className="ez-flex ez-w-full ez-flex-col">
                        <div
                            className="ez-grid ez-grid-cols-2 ez-items-center ez-gap-2"
                            style={{
                                gridTemplateColumns:
                                    custom?.style?.gridTemplateColumns ||
                                    'repeat(2, minmax(0, 1fr))',
                            }}
                        >
                            {values.map((item, index) => (
                                <Button
                                    key={index}
                                    loading={loading}
                                    onClick={() => onChoose(item.value)}
                                    buttonText={item.option || ''}
                                    style={{
                                        color: custom?.style?.color || '#ffffff',
                                        backgroundColor:
                                            custom?.style?.backgroundColor || '#000000',
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

                        {metadata.form !== undefined && (
                            <>
                                <div className="ez-flex ez-h-[44px] ez-w-full ez-items-center ez-rounded-[8px] ez-border ez-border-[#DDD] ez-px-[12px] ez-font-['JetBrainsMono']">
                                    <input
                                        className="flex ez-h-full ez-flex-1 ez-outline-none"
                                        defaultValue={inputValue}
                                        onChange={onChange}
                                        placeholder={custom?.formPlaceholder}
                                    ></input>
                                    {custom?.formSuffix && (
                                        <p className="ez-font-['JetBrainsMono'] ez-text-lg ez-font-medium ez-text-black">
                                            {custom.formSuffix}
                                        </p>
                                    )}
                                </div>
                                {error && (
                                    <div className="ez-flex ez-w-full ez-items-center ez-justify-center ez-font-['JetBrainsMono'] ez-text-base ez-text-[#ff5b5b]">
                                        {error}
                                    </div>
                                )}

                                {!error && inputValue && (
                                    <Button
                                        loading={loading}
                                        onClick={onConfirm}
                                        buttonText={metadata.form.confirm ?? 'Confirm'}
                                        style={{
                                            color: custom?.style?.color || '#ffffff',
                                            backgroundColor:
                                                custom?.style?.backgroundColor || '#000000',
                                            borderRadius: custom?.style?.borderRadius || '0.5rem',
                                            fontWeight: custom?.style?.fontWeight || '400',
                                        }}
                                    ></Button>
                                )}
                            </>
                        )}
                    </div>
                )
            }
        </div>
    );
}
