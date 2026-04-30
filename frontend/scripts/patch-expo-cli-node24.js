const fs = require('fs');
const path = require('path');

const externalsPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'server',
  'metro',
  'externals.js'
);

if (!fs.existsSync(externalsPath)) {
  console.log('[patch-expo-cli-node24] @expo/cli externals.js nao encontrado, pulando patch.');
  process.exit(0);
}

const source = fs.readFileSync(externalsPath, 'utf8');
const marker = '.map((x)=>x.replace(/^node:/, "")';

if (source.includes(marker)) {
  console.log('[patch-expo-cli-node24] Patch ja aplicado.');
  process.exit(0);
}

const target = `const NODE_STDLIB_MODULES = [
    "fs/promises",
    ...(_module.builtinModules || // @ts-expect-error
    (process.binding ? Object.keys(process.binding("natives")) : []) || []).filter((x)=>!/^_|^(internal|v8|node-inspect)\\/|\\//.test(x) && ![
            "sys"
        ].includes(x)
    ), 
].sort();`;

const replacement = `const NODE_STDLIB_MODULES = Array.from(new Set([
    "fs/promises",
    ...(_module.builtinModules || // @ts-expect-error
    (process.binding ? Object.keys(process.binding("natives")) : []) || []).map((x)=>x.replace(/^node:/, "")
    ).filter((x)=>!/^_|^(internal|v8|node-inspect)\\/|\\//.test(x) && ![
            "sys"
        ].includes(x)
    ), 
])).sort();`;

if (!source.includes(target)) {
  console.log('[patch-expo-cli-node24] Assinatura esperada nao encontrada, pulando patch.');
  process.exit(0);
}

fs.writeFileSync(externalsPath, source.replace(target, replacement), 'utf8');
console.log('[patch-expo-cli-node24] Patch aplicado com sucesso.');

