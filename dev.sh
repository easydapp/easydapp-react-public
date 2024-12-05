#!/bin/bash

rm -rf node_modules/.vite
# rm -rf node_modules/.pnpm

pnpm remove @jellypack/types
pnpm i @jellypack/types@file:../jelly-packages/jelly-types

pnpm remove @jellypack/compiler
pnpm i @jellypack/compiler@file:../jelly-packages/jelly-compiler

pnpm remove @jellypack/runtime
pnpm i @jellypack/runtime@file:../jelly-packages/jelly-runtime

pnpm remove @jellypack/wasm-api
pnpm i -D @jellypack/wasm-api@file:../jelly-packages/jelly-wasm-api

rm -rf ./lib/

pnpm run build

# pnpm run deploy

# pnpm run dev
