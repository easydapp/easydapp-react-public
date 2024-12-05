import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import {
    ComponentInteraction,
    match_interaction_inner_metadata,
} from '@jellypack/runtime/lib/model/components/interaction';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { ComponentInteractionChooseView } from './choose';
import { ComponentInteractionChooseFormView } from './choose-form';
import { ComponentInteractionChooseFullView } from './choose-full';
import { ComponentInteractionChooseTipView } from './choose-tip';

export function ComponentInteractionView({
    runtime,
    link,
    updated,
    interaction,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    interaction: ComponentInteraction;
}) {
    const className = !runtime.should_show(link) ? 'hidden' : '';

    // if (!runtime.should_show(link)) return <></>; // Condition satisfaction is displayed
    return match_interaction_inner_metadata(interaction.metadata.metadata, {
        choose: (choose) => (
            <ComponentInteractionChooseView
                className={className}
                runtime={runtime}
                link={link}
                updated={updated}
                interaction={interaction}
                metadata={choose}
            />
        ),
        choose_form: (choose_form) => (
            <ComponentInteractionChooseFormView
                className={className}
                runtime={runtime}
                link={link}
                updated={updated}
                interaction={interaction}
                metadata={choose_form}
            />
        ),
        choose_tip: (choose_tip) => (
            <ComponentInteractionChooseTipView
                className={className}
                runtime={runtime}
                link={link}
                updated={updated}
                interaction={interaction}
                metadata={choose_tip}
            />
        ),
        choose_full: (choose_full) => (
            <ComponentInteractionChooseFullView
                className={className}
                runtime={runtime}
                link={link}
                updated={updated}
                interaction={interaction}
                metadata={choose_full}
            />
        ),
    });
}
