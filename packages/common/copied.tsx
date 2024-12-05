import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Icon from './icon';
import MessageComponent from './message';
import { cn } from './utils';

// Copy something
export function Copied({ value, className }: { value: string; className?: string }) {
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    };

    return (
        <>
            {copied && <MessageComponent message="Copied Success" />}

            <CopyToClipboard text={value} onCopy={onCopy}>
                <div className="ez-relative ez-flex">
                    <Icon
                        name="icon-copy"
                        className={cn(
                            'ez-h-[12px] ez-w-[12px] ez-cursor-pointer ez-text-black',
                            className,
                        )}
                    ></Icon>
                </div>
            </CopyToClipboard>
        </>
    );
}
