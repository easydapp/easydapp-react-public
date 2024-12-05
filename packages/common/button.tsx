import React, { CSSProperties, MouseEventHandler, useState } from 'react';
import Icon from './icon';
import { cn } from './utils';

interface ButtonProps {
    loading?: boolean;
    disabled?: boolean;
    className?: string | false;
    onClick?: MouseEventHandler<HTMLDivElement>;
    style?: CSSProperties;
    buttonText: string;
}

const Button: React.FC<ButtonProps> = ({
    loading = false,
    disabled = false,
    className,
    onClick,
    style,
    buttonText,
}) => {
    const [isHover, setIsHover] = useState<boolean>(false);

    return (
        <div
            className={cn(
                "ez-flex ez-h-11 ez-w-full ez-flex-shrink-0 ez-cursor-pointer ez-items-center ez-justify-center ez-overflow-hidden ez-text-center ez-font-['JetBrainsMono'] ez-text-[14px] ez-font-normal ez-opacity-100 ez-duration-150",
                className,
                loading && 'ez-cursor-wait',
                isHover && 'ez-opacity-80',
                disabled && 'ez-cursor-not-allowed ez-opacity-80',
            )}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onClick={!disabled && !loading ? onClick : undefined} // Prevent click if disabled or loading
            style={
                style || {
                    color: '#ffffff',
                    backgroundColor: '#000000',
                    borderRadius: '0.5rem',
                    fontWeight: '400',
                }
            }
        >
            {loading && (
                <Icon
                    name="icon-loading"
                    className="ez-mr-2 ez-h-[16px] ez-w-[16px] ez-animate-spin ez-text-white"
                />
            )}
            {buttonText}
        </div>
    );
};

export default Button;
