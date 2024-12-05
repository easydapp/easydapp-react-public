import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { LinkType, match_link_type } from '@jellypack/types/lib/types';
import { InnerComponentFormArrayView } from './array';
import { InnerComponentFormBoolView } from './bool';
import { InnerComponentFormIntegerView } from './integer';
import { InnerComponentFormNumberView } from './number';
import { InnerComponentFormObjectView } from './object';
import { InnerComponentFormTextView } from './text';

export function InnerComponentFormView({
    runtime,
    link,
    onValue,
    output,
    defaultValue,
    customStyle,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    onValue: (value: any | undefined) => void;
    output: LinkType;
    defaultValue?: any;
    customStyle?: string;
}) {
    return match_link_type(output, {
        text: () => (
            <InnerComponentFormTextView
                runtime={runtime}
                link={link}
                onValue={onValue}
                defaultValue={defaultValue}
                customStyle={customStyle}
            />
        ),
        bool: () => (
            <InnerComponentFormBoolView
                runtime={runtime}
                link={link}
                onValue={onValue}
                defaultValue={defaultValue}
                customStyle={customStyle}
            />
        ),
        integer: () => (
            <InnerComponentFormIntegerView
                runtime={runtime}
                link={link}
                onValue={onValue}
                defaultValue={defaultValue}
                customStyle={customStyle}
            />
        ),
        number: () => (
            <InnerComponentFormNumberView
                runtime={runtime}
                link={link}
                onValue={onValue}
                defaultValue={defaultValue}
                customStyle={customStyle}
            />
        ),
        array: (array) => (
            <InnerComponentFormArrayView
                runtime={runtime}
                link={link}
                onValue={onValue}
                subtype={array}
                defaultValue={defaultValue}
                customStyle={customStyle}
            />
        ),
        object: (object) => (
            <InnerComponentFormObjectView
                runtime={runtime}
                link={link}
                onValue={onValue}
                subitems={object}
                defaultValue={defaultValue}
                customStyle={customStyle}
            />
        ),
    });
}
