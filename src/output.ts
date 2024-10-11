import fs from 'fs';
import path from 'path';
import { formatDescription, formatType, formatMethodSignature } from './formatting';
import { promisify } from 'util';
import { MarkdownTable } from './markdown';
import { slugify } from './parse';
import type {
  DocsConfigInterface,
  DocsData,
  DocsEnum,
  DocsInterface,
  DocsInterfaceMethod,
  DocsMethodParam,
  DocsTagInfo,
  DocsTypeAlias,
} from './types';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

export async function outputReadme(readmeFilePath: string, data: DocsData) {
  if (typeof readmeFilePath !== 'string') {
    throw new Error(`Missing readme file path`);
  }
  if (!path.isAbsolute(readmeFilePath)) {
    throw new Error(`Readme file path must be an absolute path`);
  }
  let content: string;
  try {
    content = await readFile(readmeFilePath, 'utf8');
  } catch (e) {
    throw new Error(
      `Unable to read: "${readmeFilePath}".\n\nIf this is the correct path, please create the file first, then run again.`,
    );
  }

  content = replaceMarkdownPlaceholders(content, data);
  await writeFile(readmeFilePath, content);
}

export function replaceMarkdownPlaceholders(content: string, data: DocsData) {
  if (typeof content !== 'string') {
    throw new Error(`Invalid content`);
  }
  if (data == null || data.api == null) {
    throw new Error(`Missing data`);
  }
  data = JSON.parse(JSON.stringify(data));
  content = replaceMarkdownDocsIndex(content, data);
  content = replaceMarkdownDocsConfig(content, data);
  content = replaceMarkdownDocsApi(content, data);
  return content;
}

const INDEX_START = `<docgen-index`;
const INDEX_END = `</docgen-index>`;
const API_START = `<docgen-api`;
const API_END = `</docgen-api>`;
const CONFIG_START = `<docgen-config`;
const CONFIG_END = `</docgen-config>`;
const UPDATE_MSG = `<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->`;

function replaceMarkdownDocsIndex(content: string, data: DocsData) {
  const startOuterIndex = content.indexOf(INDEX_START);
  if (startOuterIndex > -1) {
    const endInnerIndex = content.indexOf(INDEX_END);
    if (endInnerIndex > -1) {
      const inner = content.substring(startOuterIndex + INDEX_START.length);
      const startInnderIndex = startOuterIndex + INDEX_START.length + inner.indexOf('>') + 1;
      const start = content.substring(0, startInnderIndex);
      const end = content.substring(endInnerIndex);
      return `${start}\n\n${markdownIndex(data)}\n\n${end}`;
    }
  }

  return content;
}

function replaceMarkdownDocsConfig(content: string, data: DocsData) {
  const startOuterIndex = content.indexOf(CONFIG_START);
  if (startOuterIndex > -1) {
    const endInnerIndex = content.indexOf(CONFIG_END);
    if (endInnerIndex > -1) {
      const inner = content.substring(startOuterIndex + CONFIG_START.length);
      const startInnerIndex = startOuterIndex + CONFIG_START.length + inner.indexOf('>') + 1;
      const start = content.substring(0, startInnerIndex);
      const end = content.substring(endInnerIndex);
      return `${start}\n${UPDATE_MSG}\n\n${markdownConfig(data)}\n\n${end}`;
    }
  }

  return content;
}

function replaceMarkdownDocsApi(content: string, data: DocsData) {
  const startOuterIndex = content.indexOf(API_START);
  if (startOuterIndex > -1) {
    const endInnerIndex = content.indexOf(API_END);
    if (endInnerIndex > -1) {
      const inner = content.substring(startOuterIndex + API_START.length);
      const startInnerIndex = startOuterIndex + API_START.length + inner.indexOf('>') + 1;
      const start = content.substring(0, startInnerIndex);
      const end = content.substring(endInnerIndex);
      return `${start}\n${UPDATE_MSG}\n\n${markdownApi(data)}\n\n${end}`;
    }
  }

  return content;
}

function markdownIndex(data: DocsData) {
  const o: string[] = [];

  data?.api?.methods.forEach((m) => {
    o.push(`* [\`${formatMethodSignature(m)}\`](#${m.slug})`);
  });

  if (data.interfaces.length > 0) {
    o.push(`* [Interfaces](#${slugify('Interfaces')})`);
  }

  if (data.typeAliases.length > 0) {
    o.push(`* [Type Aliases](#${slugify('Type Aliases')})`);
  }

  if (data.enums.length > 0) {
    o.push(`* [Enums](#${slugify('Enums')})`);
  }

  return o.join('\n').trim();
}

function markdownApi(data: DocsData) {
  const o: string[] = [];

  if (typeof data.api?.docs === 'string' && data.api.docs.length > 0) {
    o.push(data.api.docs);
    o.push(``);
  }

  data!.api!.methods.forEach((m) => {
    o.push(methodsTable(data, m));
  });

  if (data.interfaces.length > 0) {
    o.push(`### Interfaces`);
    o.push(``);
    data.interfaces.forEach((i) => {
      o.push(interfaceTable(data, i));
    });
    o.push(``);
  }

  if (data.typeAliases.length > 0) {
    o.push(`### Type Aliases`);
    o.push(``);
    data.typeAliases.forEach((i) => {
      o.push(typeAliasTable(data, i));
    });
    o.push(``);
  }

  if (data.enums.length > 0) {
    o.push(`### Enums`);
    o.push(``);
    data.enums.forEach((i) => {
      o.push(enumTable(data, i));
    });
    o.push(``);
  }

  return o.join('\n').trim();
}

function methodsTable(data: DocsData, m: DocsInterfaceMethod) {
  const o: string[] = [];

  o.push(`### ${formatMethodSignature(m)}`);
  o.push(``);
  o.push('```typescript');
  o.push(`${m.name}${m.signature}`);
  o.push('```');
  o.push(``);

  if (m.docs) {
    o.push(formatDescription(data, m.docs));
    o.push(``);
  }

  if (m.parameters.length > 0) {
    o.push(...createMethodParamTable(data, m.parameters));
    o.push(``);
  }

  const ret = formatType(data, m.returns);
  if (ret.type !== 'void' && ret.type !== 'Promise<void>') {
    o.push(`**Returns:** ${ret.formatted}`);
    o.push(``);
  }

  const since = getTagText(m.tags, 'since');
  if (since) {
    o.push(`**Since:** ${since}`);
    o.push(``);
  }

  o.push(`--------------------`);
  o.push(``);
  o.push(``);

  return o.join('\n');
}

function markdownConfig(data: DocsData) {
  const o: string[] = [];
  if (data.pluginConfigs) {
    data!.pluginConfigs!.forEach((c) => {
      o.push(configInterfaceTable(data, c));
      o.push(buildExamples(c));
    });
  }

  return o.join('\n');
}

function buildExamples(c: DocsConfigInterface) {
  const o: string[] = [];
  o.push(`### Examples`);
  o.push(``);
  o.push(`In \`capacitor.config.json\`:`);
  o.push(``);
  o.push(`\`\`\`json`);
  o.push(`{`);
  o.push(`  "plugins": {`);
  o.push(`    "${c.name}": {`);
  c.properties.forEach((p, i) => {
    o.push(
      `      "${p.name}": ${p.tags.find((t) => t.name === 'example')?.text}${i === c.properties.length - 1 ? '' : ','}`,
    );
  });
  o.push(`    }`);
  o.push(`  }`);
  o.push(`}`);
  o.push(`\`\`\``);
  o.push(``);

  o.push(`In \`capacitor.config.ts\`:`);
  o.push(``);
  o.push(`\`\`\`ts`);
  o.push(`/// <reference types="${process.env.npm_package_name}" />`);
  o.push(``);
  o.push(`import { CapacitorConfig } from '@capacitor/cli';`);
  o.push(``);
  o.push(`const config: CapacitorConfig = {`);
  o.push(`  plugins: {`);
  o.push(`    ${c.name}: {`);
  c.properties.forEach((p) => {
    o.push(`      ${p.name}: ${p.tags.find((t) => t.name === 'example')?.text},`);
  });
  o.push(`    },`);
  o.push(`  },`);
  o.push(`};`);
  o.push(``);
  o.push(`export default config;`);
  o.push(`\`\`\``);

  return o.join('\n');
}

function createMethodParamTable(data: DocsData, parameters: DocsMethodParam[]) {
  const t = new MarkdownTable();

  t.addHeader([`Param`, `Type`, `Description`]);

  parameters.forEach((p) => {
    const nm = `**\`${p.name}\`**`;
    const ty = formatType(data, p.type);
    const docs = formatDescription(data, p.docs);
    t.addRow([nm, ty.formatted, docs]);
  });

  t.removeEmptyColumns();
  return t.toMarkdown();
}

function interfaceTable(data: DocsData, i: DocsInterface) {
  const o: string[] = [];
  o.push(``);
  o.push(`#### ${i.name}`);
  o.push(``);

  if (i.docs) {
    o.push(`${formatDescription(data, i.docs)}`);
    o.push(``);
  }

  if (i.properties.length > 0) {
    const t = new MarkdownTable();

    t.addHeader([`Prop`, `Type`, `Description`, `Default`, `Since`]);

    i.properties.forEach((m) => {
      const defaultValue = getTagText(m.tags, 'default');

      t.addRow([
        `**\`${m.name}\`**`,
        formatType(data, m.type).formatted,
        formatDescription(data, m.docs),
        defaultValue ? `<code>${defaultValue}</code>` : '',
        getTagText(m.tags, 'since'),
      ]);
    });

    t.removeEmptyColumns();
    o.push(...t.toMarkdown());
    o.push(``);
  }

  if (i.methods.length > 0) {
    const t = new MarkdownTable();

    t.addHeader([`Method`, `Signature`, `Description`]);

    i.methods.forEach((m) => {
      t.addRow([`**${m.name}**`, formatDescription(data, m.signature), formatDescription(data, m.docs)]);
    });

    t.removeEmptyColumns();
    o.push(...t.toMarkdown());
    o.push(``);
  }

  return o.join(`\n`);
}

function configInterfaceTable(data: DocsData, i: DocsConfigInterface) {
  const o: string[] = [];

  if (i.docs) {
    o.push(`${formatDescription(data, i.docs)}`);
    o.push(``);
  }

  if (i.properties.length > 0) {
    const t = new MarkdownTable();

    t.addHeader([`Prop`, `Type`, `Description`, `Default`, `Since`]);

    i.properties.forEach((m) => {
      const defaultValue = getTagText(m.tags, 'default');

      t.addRow([
        `**\`${m.name}\`**`,
        formatType(data, m.type).formatted,
        formatDescription(data, m.docs),
        defaultValue ? `<code>${defaultValue}</code>` : '',
        getTagText(m.tags, 'since'),
      ]);
    });

    t.removeEmptyColumns();
    o.push(...t.toMarkdown());
    o.push(``);
  }

  return o.join(`\n`);
}

function typeAliasTable(data: DocsData, t: DocsTypeAlias) {
  const o: string[] = [];
  o.push(``);
  o.push(`#### ${t.name}`);
  o.push(``);

  if (t.docs) {
    o.push(formatDescription(data, t.docs));
    o.push(``);
  }

  const type = t.types
    .map((ty) => formatType(data, ty.text).formatted)
    .join(' | ')
    .replace(/\<\/code\> \| \<code\>/g, ` | `);

  o.push(`${type}`);
  o.push(``);

  return o.join(`\n`);
}

function enumTable(data: DocsData, i: DocsEnum) {
  const o: string[] = [];
  o.push(``);
  o.push(`#### ${i.name}`);
  o.push(``);

  if (i.members.length > 0) {
    const t = new MarkdownTable();

    t.addHeader([`Members`, `Value`, `Description`, `Since`]);

    i.members.forEach((m) => {
      t.addRow([
        `**\`${m.name}\`**`,
        formatType(data, m.value).formatted,
        formatDescription(data, m.docs),
        getTagText(m.tags, 'since'),
      ]);
    });

    t.removeEmptyColumns();
    o.push(...t.toMarkdown());
    o.push(``);
  }

  return o.join(`\n`);
}

function getTagText(tags: DocsTagInfo[], tagName: string) {
  if (tags) {
    const tag = tags.find((t) => t.name === tagName && typeof t.text === 'string');
    if (tag) {
      return tag.text!;
    }
  }
  return '';
}

export async function outputJson(jsonFilePath: string, data: DocsData) {
  if (typeof jsonFilePath !== 'string') {
    throw new Error(`Missing json file path`);
  }
  if (!path.isAbsolute(jsonFilePath)) {
    throw new Error(`JSON file path must be an absolute path`);
  }
  if (data == null) {
    throw new Error(`Missing data`);
  }
  const content = JSON.stringify(data, null, 2);
  await mkdir(path.dirname(jsonFilePath), { recursive: true });
  await writeFile(jsonFilePath, content);
}
