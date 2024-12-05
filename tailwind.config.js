/** @type {import('tailwindcss').Config} */
export default {
    content: [
        // react
        './packages/**/*.{js,ts,jsx,tsx}',
    ],
    prefix: 'ez-',
    important: true,
    corePlugins: {
        preflight: false, // Cancel the basic style reset of TailWind
    },
    theme: {
        extend: {},
    },
    darkMode: 'class',
    plugins: [],
};
