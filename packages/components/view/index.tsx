import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ComponentView, match_view_metadata } from '@jellypack/runtime/lib/model/components/view';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { ComponentViewArrayView } from './array';
import { ComponentViewBoolView } from './bool';
import { ComponentViewHtmlView } from './html';
import { ComponentViewImageView } from './image';
import { ComponentViewObjectView } from './object';
import { ComponentViewTableView } from './table';
import { ComponentViewTextView } from './text';

export function ComponentViewView({
    runtime,
    link,
    updated,
    view,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    view: ComponentView;
}) {
    // const component = runtime.component(link);
    // console.debug(`🚀 ~ component:`, component);

    if (!runtime.should_show(link)) return <></>; // Condition satisfaction is displayed
    return match_view_metadata(view.metadata, {
        text: (text) => (
            <ComponentViewTextView
                runtime={runtime}
                link={link}
                updated={updated}
                view={view}
                metadata={text}
            />
        ),
        bool: (bool) => (
            <ComponentViewBoolView
                runtime={runtime}
                link={link}
                updated={updated}
                view={view}
                metadata={bool}
            />
        ),
        image: (image) => (
            <ComponentViewImageView
                runtime={runtime}
                link={link}
                updated={updated}
                view={view}
                metadata={image}
            />
        ),
        table: (table) => (
            <ComponentViewTableView
                runtime={runtime}
                link={link}
                updated={updated}
                view={view}
                metadata={table}
            />
        ),
        html: (html) => (
            <ComponentViewHtmlView
                runtime={runtime}
                link={link}
                updated={updated}
                view={view}
                metadata={html}
            />
        ),
        array: (array) => (
            <ComponentViewArrayView
                runtime={runtime}
                link={link}
                updated={updated}
                view={view}
                metadata={array}
            />
        ),
        object: (object) => (
            <ComponentViewObjectView
                runtime={runtime}
                link={link}
                updated={updated}
                view={view}
                metadata={object}
            />
        ),
    });
}
