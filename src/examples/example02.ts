import { LinkComponent } from '@jellypack/runtime/lib/model/components';

export const app_id = 6475514281605605;
export const app_anchor = ''; // cspell:disable-line
export const name = 'Example 2: form code view';
export const icon = 'https://file.easydapp.ai/image/5DSXiqXM0183c8e944.png';
export const combined: {
    version: string;
    components: LinkComponent[];
} = {
    version: '0.0.1',
    components: [
        { view: { id: 1, metadata: { text: { value: { const: { text: 'Enter you name:' } } } } } },
        { form: { id: 2, output: 'text' } },
        {
            view: {
                id: 3,
                inlets: [{ id: 2 }],
                metadata: { text: { value: { const: { text: 'Enter you age:' } } } },
            },
        },
        {
            form: {
                id: 4,
                inlets: [{ id: 2 }],
                metadata: { default: { integer: 100 } },
                output: 'integer',
            },
        },
        {
            view: {
                id: 5,
                inlets: [{ id: 2 }],
                metadata: { text: { value: { const: { text: 'Are you a human?' } } } },
            },
        },
        {
            form: {
                id: 6,
                inlets: [{ id: 2 }],
                output: 'bool',
            },
        },
        {
            code: {
                id: 7,
                inlets: [{ id: 2 }, { id: 4 }, { id: 6 }],
                metadata: {
                    data: [
                        { key: 'name', value: { refer: { endpoint: { id: 2 } } } },
                        { key: 'age', value: { refer: { endpoint: { id: 4 } } } },
                        { key: 'human', value: { refer: { endpoint: { id: 6 } } } },
                    ],
                    code: {
                        code: {
                            code: {
                                code: "result = `Hello, ${data.name}. You're are${data.human ? ' ' : ' not'} a human. You are ${data.age} years old.`;",
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
                id: 8,
                inlets: [{ id: 7 }],
                metadata: { text: { value: { refer: { endpoint: { id: 7 } } } } },
            },
        },
    ],
};
