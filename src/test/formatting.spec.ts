import { formatDescription, formatType, tokenize } from '../formatting';
import { DocsData } from '../types';

describe('formatting', () => {
  const d: DocsData = {
    api: null,
    interfaces: [
      {
        name: 'SomeInterface',
        slug: 'someinterface',
        docs: null,
        tags: null,
        methods: [],
        properties: [
          {
            name: 'prop',
            docs: null,
            tags: null,
            type: null,
            complexTypes: null,
          },
        ],
      },
    ],
    enums: [
      {
        name: 'SomeEnum',
        slug: 'someenum',
        members: [
          {
            name: 'Value',
            value: 'VALUE',
            docs: null,
            tags: null,
          },
        ],
      },
    ],
    typeAliases: [],
  };

  it('formatDescription w/ backticks', () => {
    const r = formatDescription(d, 'Hey `SomeInterface`!');
    expect(r).toEqual('Hey <a href="#someinterface">`SomeInterface`</a>!');
  });

  it('formatDescription', () => {
    const r = formatDescription(d, `Hey SomeInterface and SomeInterface.prop and SomeEnum and SomeEnum.Value!`);
    expect(r).toEqual(
      `Hey <a href=\"#someinterface\">SomeInterface</a> and <a href=\"#someinterface\">SomeInterface.prop</a> and <a href=\"#someenum\">SomeEnum</a> and <a href=\"#someenum\">SomeEnum.Value</a>!`
    );
  });

  it('formatType interface promise w/ union', () => {
    const r = formatType(d, `Promise<SomeInterface | SomeEnum | Promise<void>>`);
    expect(r.type).toEqual(`Promise<SomeInterface | SomeEnum | Promise<void>>`);
    expect(r.formatted).toEqual(
      `<code>Promise&lt;<a href="#someinterface">SomeInterface</a> | <a href=\"#someenum\">SomeEnum</a> | Promise&lt;void&gt;&gt;</code>`
    );
  });

  it('formatType interface promise', () => {
    const r = formatType(d, `Promise<SomeInterface>`);
    expect(r.type).toEqual(`Promise<SomeInterface>`);
    expect(r.formatted).toEqual(`<code>Promise&lt;<a href="#someinterface">SomeInterface</a>&gt;</code>`);
  });

  it('formatType interface', () => {
    const r = formatType(d, `SomeInterface`);
    expect(r.type).toEqual(`SomeInterface`);
    expect(r.formatted).toEqual(`<code><a href="#someinterface">SomeInterface</a></code>`);
  });

  it('formatType remove undefined', () => {
    const r = formatType(d, `undefined`);
    expect(r.type).toEqual(``);
    expect(r.formatted).toEqual(``);
  });

  it('formatType remove undefined union', () => {
    const r = formatType(d, `string | undefined`);
    expect(r.type).toEqual(`string`);
    expect(r.formatted).toEqual(`<code>string</code>`);

    const r2 = formatType(d, `Promise<string | undefined>`);
    expect(r2.type).toEqual(`Promise<string>`);
    expect(r2.formatted).toEqual(`<code>Promise&lt;string&gt;</code>`);
  });

  it('formatType simple', () => {
    const r = formatType(d, `string`);
    expect(r.type).toEqual(`string`);
    expect(r.formatted).toEqual(`<code>string</code>`);
  });

  it('tokenize', () => {
    expect(tokenize('method(arg: string) => void;')).toEqual([
      'method',
      '(',
      'arg',
      ':',
      ' ',
      'string',
      ')',
      ' ',
      '=',
      '>',
      ' ',
      'void',
      ';',
    ]);
    expect(tokenize('Promise<string  | number>')).toEqual([
      'Promise',
      '<',
      'string',
      ' ',
      ' ',
      '|',
      ' ',
      'number',
      '>',
    ]);
    expect(tokenize('Promise<string>')).toEqual(['Promise', '<', 'string', '>']);
    expect(tokenize('Hello')).toEqual(['Hello']);
    expect(tokenize('')).toEqual([]);
  });
});
