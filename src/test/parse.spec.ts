import { parse } from '../parse';
import path from 'path';

describe('parse', () => {
  const apiFinder = parse({
    tsconfigPath: path.join(__dirname, 'fixtures', 'tsconfig.json'),
  });

  const { api, interfaces, enums } = apiFinder('HapticsPlugin');

  it('api', () => {
    expect(api.name).toBe(`HapticsPlugin`);
    expect(api.slug).toBe(`hapticsplugin`);
    expect(api.docs).toBe(`Top level docs.`);
    expect(interfaces).toHaveLength(4);
    expect(enums).toHaveLength(2);

    const iNames = interfaces.map(i => i.name);
    expect(iNames).not.toContain(`HapticsPlugin`); // main api
    expect(iNames).not.toContain(`HapticsImpactStyle`); // enum
    expect(iNames).not.toContain(`HapticsNotificationType`); // enum
    expect(iNames).toContain(`HapticsImpact`);
    expect(iNames).toContain(`HapticsImpactOptions`);
    expect(iNames).toContain(`HapticsNotificationOptions`);
    expect(iNames).toContain(`VibrateOptions`);

    const eNames = enums.map(i => i.name);
    expect(eNames).not.toContain(`HapticsPlugin`); // main api
    expect(eNames).toContain(`HapticsImpactStyle`); // enum
    expect(eNames).toContain(`HapticsNotificationType`); // enum
    expect(eNames).not.toContain(`HapticsImpact`);
    expect(eNames).not.toContain(`HapticsImpactOptions`);
    expect(eNames).not.toContain(`HapticsNotificationOptions`);
    expect(eNames).not.toContain(`VibrateOptions`);
  });

  it('api enums', () => {
    expect(enums).toHaveLength(2);
    expect(enums[0].name).toBe(`HapticsImpactStyle`);
    expect(enums[0].slug).toBe(`hapticsimpactstyle`);
    expect(enums[0].members).toHaveLength(3);
    expect(enums[0].members[0].name).toBe(`Heavy`);
    expect(enums[0].members[0].value).toBe(`'HEAVY'`);
    expect(enums[0].members[0].docs).toBe(
      `A collision between small, light user interface elements`,
    );
    expect(enums[0].members[0].tags).toHaveLength(1);
    expect(enums[0].members[0].tags[0].name).toBe(`since`);
    expect(enums[0].members[0].tags[0].text).toBe(`1.0.0`);
  });

  it('api methods', () => {
    expect(api.methods).toHaveLength(4);

    const m0 = api.methods[0];
    expect(m0.name).toBe(`impact`);
    expect(m0.docs).toBe(`Trigger a haptics "impact" feedback`);
    expect(m0.slug).toBe(`impact`);
    expect(m0.signature).toBe(
      `(options: HapticsImpactOptions, x?: number | undefined) => Promise<HapticsImpact>`,
    );
    expect(m0.returns).toBe(`Promise<HapticsImpact>`);
    expect(m0.parameters).toHaveLength(2);
    expect(m0.parameters[0].name).toBe(`options`);
    expect(m0.parameters[0].docs).toBe(`The\nimpact   options`);
    expect(m0.parameters[0].type).toBe(`HapticsImpactOptions`);
    expect(m0.parameters[1].name).toBe(`x`);
    expect(m0.parameters[1].docs).toBe(``);
    expect(m0.parameters[1].type).toBe(`number | undefined`);
    expect(m0.tags).toHaveLength(2);
    expect(m0.tags).toHaveLength(2);
    expect(m0.tags[0].name).toBe(`param`);
    expect(m0.tags[0].text).toBe(`options The\nimpact   options`);
    expect(m0.tags[1].name).toBe(`since`);
    expect(m0.tags[1].text).toBe(`1.0.0`);
    expect(m0.complexTypes).toHaveLength(2);
    expect(m0.complexTypes[0]).toBe(`HapticsImpact`);
    expect(m0.complexTypes[1]).toBe(`HapticsImpactOptions`);
  });

  it('interface properties', () => {
    const i = interfaces.find(i => i.name === 'HapticsImpactOptions');
    expect(i.slug).toBe(`hapticsimpactoptions`);
    expect(i.methods).toHaveLength(0);
    expect(i.properties).toHaveLength(2);

    const p0 = i.properties[0];
    expect(p0.name).toBe(`style`);
    expect(p0.tags).toHaveLength(2);
    expect(p0.tags[0].text).toBe(`HapticsImpactStyle.Heavy`);
    expect(p0.tags[0].name).toBe(`default`);
    expect(p0.complexTypes).toHaveLength(1);
    expect(p0.complexTypes[0]).toBe(`HapticsImpactStyle`);
    expect(p0.type).toBe(`HapticsImpactStyle`);
  });
});
