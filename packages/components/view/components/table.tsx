import { parse_custom_style } from '@jellypack/runtime/lib/model/common/custom';
import { InnerViewTableMetadataStyle } from '@jellypack/runtime/lib/model/components/view/inner/table';
import { useEffect, useRef } from 'react';
import { parseStyleWithImportant } from '../../../common/utils';

export function InnerTableView({
    value,
    customStyle,
}: {
    value: {
        headers: string[];
        rows: string[][];
    };
    customStyle?: string;
}) {
    // * custom style
    const custom = parse_custom_style<InnerViewTableMetadataStyle>(customStyle);
    const tableElementRef = useRef<HTMLTableElement | null>(null);

    useEffect(() => {
        if (custom?.style && tableElementRef.current) {
            const styleWithImportant = parseStyleWithImportant(custom.style);

            Object.entries(styleWithImportant).forEach(([key, value]) => {
                if (tableElementRef.current) {
                    tableElementRef.current.style.setProperty(key, value, 'important');
                }
            });
        }
    }, [custom?.style]);

    return (
        <table
            ref={tableElementRef}
            className="ez-table-view ez-table-scroll ez-table-hover ez-w-full ez-overflow-x-auto ez-whitespace-nowrap"
        >
            <thead>
                <tr className="ez-h-10 ez-w-full ez-bg-[#f8f8f8]">
                    {value.headers.map((header, index) => (
                        <th
                            className="ez-border-[0px] ez-border-b-[1px] ez-border-solid ez-border-[#e8e8e8] ez-pl-[10px] ez-text-left ez-font-['JetBrainsMono'] ez-font-medium"
                            key={index}
                        >
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {value.rows.map((row, rowIndex) => (
                    <tr
                        className="ez-h-10 ez-w-full ez-border-[0px] ez-border-b-[1px] ez-border-solid ez-border-[#e8e8e8] last:ez-border-b-0 even:ez-bg-[#f8f8f8]"
                        key={rowIndex}
                    >
                        {row.map((cell, cellIndex) => (
                            <td
                                className="ez-pl-[10px] ez-text-left ez-font-['JetBrainsMono']"
                                key={cellIndex}
                            >
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
