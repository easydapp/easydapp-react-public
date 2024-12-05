import { LinkComponent } from '@jellypack/runtime/lib/model/components';

export const app_id = 2576186893464534;
export const app_anchor = ''; // cspell:disable-line
export const name = 'Example 1: param const code view';
export const icon = 'https://file.easydapp.ai/image/5DSXiqXM0183c8e944.png';
export const combined: {
    version: string;
    components: LinkComponent[];
} = {
    version: '0.0.1',
    components: [
        { param: { id: 1, metadata: { name: 'name', default: 'Bob' } } },
        {
            const: {
                id: 2,
                metadata: { value: { object: [{ key: 'name', value: { text: 'Anubis' } }] } },
                output: { object: [{ key: 'name', ty: 'text' }] },
            },
        },
        {
            code: {
                id: 3,
                inlets: [{ id: 1 }, { id: 2 }],
                metadata: {
                    data: [
                        { key: 'hello', value: { const: { text: 'Hello' } } },
                        { key: 'param', value: { refer: { endpoint: { id: 1 } } } },
                        {
                            key: 'constant',
                            value: {
                                refer: {
                                    endpoint: { id: 2 },
                                    refer: { key: 'name' },
                                },
                            },
                        },
                    ],
                    code: {
                        code: {
                            code: {
                                code: 'result = `${data.hello}, ${data.param}. I am ${data.constant}.`;',
                            },
                            js: '',
                        },
                    },
                },
                output: 'text',
            },
        },
        {
            view: {
                id: 4,
                inlets: [{ id: 3 }],
                metadata: { text: { value: { refer: { endpoint: { id: 3 } } } } },
            },
        },
    ],
};
