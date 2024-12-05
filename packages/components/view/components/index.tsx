import {
    InnerViewMetadata,
    match_inner_view_metadata,
} from '@jellypack/runtime/lib/model/components/view/inner';
import { InnerArrayView } from './array';
import { InnerBoolView } from './bool';
import { InnerHtmlView } from './html';
import { InnerImageView } from './image';
import { InnerObjectView } from './object';
import { InnerTableView } from './table';
import { InnerTextView } from './text';




export function InnerComponentView({ inner, value }: { inner: InnerViewMetadata; value: any }) {
    return match_inner_view_metadata(inner, {
        text: (text) => <InnerTextView value={value} customStyle={text.style} />,
        bool: (bool) => <InnerBoolView value={value} customStyle={bool.style} />,
        image: (image) => <InnerImageView value={value} customStyle={image.style} />,
        table: (table) => <InnerTableView value={value} customStyle={table.style} />,
        html: (html) => (
            <InnerHtmlView value={value} template={html.template} customStyle={html.style} />
        ),
        array: (array) => (
            <InnerArrayView value={value} inner={array.inner} customStyle={array.style} />
        ),
        object: (object) => (
            <InnerObjectView value={value} inner={object.inner} customStyle={object.style} />
        ),
    });
}
