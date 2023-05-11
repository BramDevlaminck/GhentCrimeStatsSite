import {fileURLToPath, URL} from 'node:url';

import {defineConfig, loadEnv} from 'vite';
import vue from '@vitejs/plugin-vue';
import topLevelAwait from "vite-plugin-top-level-await";

export default ({mode}) => {
    Object.assign(process.env, loadEnv(mode, process.cwd()))
    return defineConfig( {
            plugins: [vue(), topLevelAwait({
                // The export name of top-level await promise for each chunk module
                promiseExportName: "__tla",
                // The function to generate import names of top-level await promise in each chunk module
                promiseImportName: i => `__tla_${i}`
            })],
            resolve: {
                alias: {
                    '@': fileURLToPath(new URL('./src', import.meta.url))
                }
            },
            base: process.env.VITE_BASE_URL,
        });
}
