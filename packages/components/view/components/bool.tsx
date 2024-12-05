import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import { InnerViewBoolMetadataStyle } from '@jellypack/runtime/lib/model/components/view/inner/bool';
import { useRef } from 'react';
import Icon from '../../../common/icon';
import { cn } from '../../../common/utils';

export function InnerBoolView({ value, customStyle }: { value: boolean; customStyle?: string }) {
    // * custom style
    const custom = parse_custom_style<InnerViewBoolMetadataStyle>(customStyle);
    console.log('🚀 ~ InnerBoolView ~ custom:', custom);
    const boolElementRef = useRef<HTMLDivElement | null>(null);

    return (
        <div className="ez-flex ez-w-full ez-flex-col ez-items-center ez-justify-center">
            <div className={cn('ez-h-[44px] ez-w-[44px]')} ref={boolElementRef}>
                <Icon
                    name={value ? 'icon-ui-true' : 'icon-ui-wrong'}
                    className="ez-h-full ez-w-full ez-text-[14px] ez-text-black"
                ></Icon>
            </div>

            <div className="ez-pt-[10px] ez-font-['JetBrainsMono'] ez-text-sm ez-font-medium ez-text-black">
                {value ? 'You are right' : 'You are wrong'}
            </div>
        </div>
    );
}
