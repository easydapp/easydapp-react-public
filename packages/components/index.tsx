import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { match_link_component } from '@jellypack/runtime/lib/model/components';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { ComponentCallView } from './call';
import { ComponentCodeView } from './code';
import { ComponentConditionView } from './condition';
import { ComponentConstView } from './constant';
import { ComponentFormView } from './form';
import { ComponentIdentityView } from './identity';
import { ComponentInteractionView } from './interaction';
import { ComponentOutputView } from './output';
import { ComponentParamView } from './param';
import { ComponentViewView } from './view';

export function LinkComponentView({
    runtime,
    link,
    updated,
    calling,
}: {
    runtime: CombinedRuntime;
    link: ComponentId;
    updated: number;
    calling: number;
}) {
    const component = runtime.component(link);

    return match_link_component(component, {
        param: (param) => (
            <ComponentParamView runtime={runtime} link={link} updated={updated} param={param} />
        ),
        constant: (constant) => (
            <ComponentConstView
                runtime={runtime}
                link={link}
                updated={updated}
                constant={constant}
            />
        ),
        form: (form) => (
            <ComponentFormView runtime={runtime} link={link} updated={updated} form={form} />
        ),
        code: (code) => (
            <ComponentCodeView runtime={runtime} link={link} updated={updated} code={code} />
        ),
        identity: (identity) => (
            <ComponentIdentityView
                runtime={runtime}
                link={link}
                updated={updated}
                identity={identity}
                calling={calling}
            />
        ),
        call: (call) => (
            <ComponentCallView
                runtime={runtime}
                link={link}
                updated={updated}
                call={call}
                calling={calling}
            />
        ),
        interaction: (interaction) => (
            <ComponentInteractionView
                runtime={runtime}
                link={link}
                updated={updated}
                interaction={interaction}
            />
        ),
        view: (view) => (
            <ComponentViewView runtime={runtime} link={link} updated={updated} view={view} />
        ),
        condition: (condition) => (
            <ComponentConditionView
                runtime={runtime}
                link={link}
                updated={updated}
                condition={condition}
            />
        ),
        output: (output) => (
            <ComponentOutputView runtime={runtime} link={link} updated={updated} output={output} />
        ),
        combined: () => (
            <div className="ez-font-['JetBrainsMono'] ez-text-sm ez-font-normal ez-leading-[18px] ez-text-[#666666]">
                unimplemented component: condition
            </div>
        ),
    });
}
