import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentView } from '@jellypack/runtime/lib/model/components/view';
import { ViewHtmlMetadata } from '@jellypack/runtime/lib/model/components/view/html';
import { image_view_supported_types } from '@jellypack/runtime/lib/model/components/view/inner/image';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { useEffect, useState } from 'react';
import { InnerHtmlView } from './components/html';

export function ComponentViewHtmlView({
    runtime,
    link,
    updated,
    metadata,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    view: ComponentView;
    metadata: ViewHtmlMetadata;
}) {
    const [value, setValue] = useState<{
        image?: Record<string, string | number[]>;
        text?: Record<string, string>;
    }>();

    useEffect(() => {
        let value:
            | {
                  image?: Record<string, string | number[]>;
                  text?: Record<string, string>;
              }
            | undefined = {};

        if (value !== undefined && metadata.image) {
            const image: Record<string, string | number[]> = {};
            for (const code_value of metadata.image) {
                const v = runtime.input_value<string | number[]>(
                    code_value.value,
                    image_view_supported_types(),
                );
                if (v === undefined) {
                    value = undefined;
                    break;
                }
                image[code_value.key] = v;
            }
            if (value) value.image = image;
        }

        if (value !== undefined && metadata.text) {
            const text: Record<string, string> = {};
            for (const code_value of metadata.text) {
                const v = runtime.input_value<string>(code_value.value, ['text']);
                if (v === undefined) {
                    value = undefined;
                    break;
                }
                text[code_value.key] = v;
            }
            if (value) value.text = text;
        }

        setValue(value);

        runtime.update_component(link, updated); // Directly update
    }, [runtime, link, updated, metadata]);

    if (value === undefined) return <></>;
    return (
        <div className="ez-flex ez-w-full">
            <InnerHtmlView
                value={value}
                template={metadata.template}
                customStyle={metadata.style}
            />
        </div>
    );
}
