#!/bin/bash

cd deps/@astrox/sdk-core
pnpm i
pnpm run build3
cd -

cd deps/@astrox/sdk-web
pnpm remove @astrox/sdk-core
pnpm i @astrox/sdk-core@file:../sdk-core
pnpm run build3
cd -

cd deps/@astrox/sdk-webview
pnpm remove @astrox/sdk-core
pnpm i @astrox/sdk-core@file:../sdk-core
pnpm run build3
cd -

pnpm remove @astrox/sdk-web
pnpm i @astrox/sdk-web@file:./deps/@astrox/sdk-web

pnpm remove @astrox/sdk-webview
pnpm i @astrox/sdk-webview@file:./deps/@astrox/sdk-webview

rm -rf node_modules/.vite

# @astrox/sdk-web/build/connections/basConnection.js
# The 'process' in line 21 needs to be annotated

# Bitfinity will report an error, Don’t know why
