import Icon from './icon';
import { cn } from './utils';

// Open a new window
export function Opened({ url, className }: { url: string; className?: string }) {
    return (
        <a className="ez-flex" href={url} target="_blank">
            <Icon
                className={cn('ez-h-[12px] ez-w-[12px] ez-cursor-pointer ez-text-black', className)}
                name="icon-open"
            ></Icon>
        </a>
    );
}
