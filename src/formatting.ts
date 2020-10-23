import type { DocsData } from './types';

export function formatDescription(data: DocsData, c: string | undefined) {
  if (typeof c !== 'string') {
    return '';
  }
  return formatTokens(data, tokenize(c));  
}

export function formatType(data: DocsData, c: string | undefined) {
  c = cleanWhitespace(String(c));

  const tokens = tokenize(c);
  if (tokens[0] === 'undefined') {
    tokens.shift();
  } else {
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i] === 'undefined' && tokens[i - 1] === ' ' && tokens[i - 2] === '|' && tokens[i - 3] === ' ') {
        tokens.splice(i - 3, 4);
        i = i - 4;
      }
    }
  }

  const rtn = {
    type: tokens.join(''),
    formatted: formatTokens(data, tokens),
  };

  if (rtn.formatted.length > 0) {
    rtn.formatted = `<code>${rtn.formatted}</code>`;
  }

  return rtn;
}

function formatTokens(data: DocsData, tokens: string[]) {
  let f = '';

  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];

    if (t === '<') {
      f += '&lt;';
      continue;
    }
    
    if (t === '>') {
      f += '&gt;';
      continue;
    }

    if (tokens[i + 1] === '.') {
      const dotLink = linkToken(data, t + '.' + tokens[i + 2]);
      if (dotLink) {
        f += dotLink;
        i += 2;
        continue;
      }
    }

    const link = linkToken(data, t);
    if (link) {
      f += link;
      continue;
    }

    f += t;
  }

  return f;
}

function linkToken(data: DocsData, token: string) {
  const t = token.replace(/`/g, '');
  const i = data.interfaces.find(i => {
    return (
      i.name === t ||
      i.methods.some(m => (i.name + '.' + m.name) === t) ||
      i.properties.some(p => (i.name + '.' + p.name) === t)
    );
  });
  if (i) {
    return `<a href="#${i.slug}">${token}</a>`;
  }

  const e = data.enums.find(e => e.name === t || e.members.some(m => (e.name + '.' + m.name) === t));
  if (e) {
    return `<a href="#${e.slug}">${token}</a>`;
  }

  return null;
}

function cleanWhitespace(str: string) {
  str = str.replace(/\n/g, ' ').trim();
  while (str.includes('  ')) {
    str = str.replace(/  /g, ' ');
  }
  return str;
}

export function tokenize(str: string) {
  const t: string[] = [];
  let w = '';
  for (const c of str) {
    if (BREAKS.includes(c)) {
      if (w !== '') {
        t.push(w);
        w = '';
      }
      t.push(c);
    } else {
      w += c;
    }
  }
  if (w !== '') {
    t.push(w);
  }
  return t;
}

const BREAKS = [` `, `.`, `,`, `|`, `<`, `>`, `:`, `;`, `?`, `&`, `!`, `*`, `(`, `)`, `=`, `@`, `"`, `'`, `-`, `{`, `}`];
