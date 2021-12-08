import { parse } from '../parse';
import path from 'path';

describe('parse', () => {
  const apiFinder = parse({
    tsconfigPath: path.join(__dirname, 'fixtures', 'tsconfig.json'),
  });

  const { api, interfaces, enums, typeAliases, pluginConfigs } =
    apiFinder('HapticsPlugin');

  it('api', () => {
    expect(api.name).toBe(`HapticsPlugin`);
    expect(api.slug).toBe(`hapticsplugin`);
    expect(api.docs).toContain(`Docs from JSDoc comments!`);
    expect(interfaces).toHaveLength(5);
    expect(typeAliases).toHaveLength(2);
    expect(enums).toHaveLength(2);

    const iNames = interfaces.map(i => i.name);
    expect(iNames).not.toContain(`HapticsPlugin`); // main api
    expect(iNames).not.toContain(`HapticsImpactStyle`); // enum
    expect(iNames).not.toContain(`HapticsNotificationType`); // enum
    expect(iNames).not.toContain(`VibrateListener`); // type alias
    expect(iNames).toContain(`HapticsImpact`);
    expect(iNames).toContain(`HapticsImpactOptions`);
    expect(iNames).toContain(`HapticsNotificationOptions`);
    expect(iNames).toContain(`VibrateOptions`);
    expect(iNames).toContain(`VibrateListenerEvent`);

    const tNames = typeAliases.map(t => t.name);
    expect(tNames).toContain(`VibrateListener`);
    expect(tNames).not.toContain(`VibrateListenerEvent`);
    expect(tNames).not.toContain(`VibrateOptions`);

    const eNames = enums.map(i => i.name);
    expect(eNames).not.toContain(`HapticsPlugin`); // main api
    expect(eNames).toContain(`HapticsImpactStyle`); // enum
    expect(eNames).toContain(`HapticsNotificationType`); // enum
    expect(eNames).not.toContain(`HapticsImpact`);
    expect(eNames).not.toContain(`HapticsImpactOptions`);
    expect(eNames).not.toContain(`HapticsNotificationOptions`);
    expect(eNames).not.toContain(`VibrateOptions`);
    expect(eNames).not.toContain(`VibrateListenerEvent`);
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
    expect(api.methods).toHaveLength(5);

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

    const m3 = api.methods[3];
    expect(m3.name).toBe(`addListener`);
    expect(m3.slug).toBe(`addlistenervibrate`);
    expect(m3.docs).toBe(`Add a listener. Callback has VibrateOptions.`);
    expect(m3.signature).toBe(
      `(eventName: 'vibrate', listenerFunc: VibrateListener) => Promise<void>`,
    );
    expect(m3.complexTypes).toContain(`VibrateListener`);
    expect(m3.parameters).toHaveLength(2);
    expect(m3.parameters[1].name).toBe('listenerFunc');
    expect(m3.parameters[1].type).toBe('VibrateListener');
    expect(m3.returns).toBe(`Promise<void>`);

    const m4 = api.methods[4];
    expect(m4.name).toBe(`removeAllListeners`);
    expect(m4.docs).toBe(
      `Remove all the listeners that are attached to this plugin`,
    );
    expect(m4.signature).toBe(`() => void`);
    expect(m4.returns).toBe(`void`);
  });

  it('interface properties', () => {
    const i = interfaces.find(i => i.name === 'HapticsImpactOptions');
    expect(i.slug).toBe(`hapticsimpactoptions`);
    expect(i.methods).toHaveLength(0);
    expect(i.properties).toHaveLength(3);

    const p0 = i.properties[0];
    expect(p0.name).toBe(`style`);
    expect(p0.tags).toHaveLength(2);
    expect(p0.tags[0].text).toBe(`HapticsImpactStyle.Heavy`);
    expect(p0.tags[0].name).toBe(`default`);
    expect(p0.complexTypes).toHaveLength(1);
    expect(p0.complexTypes[0]).toBe(`HapticsImpactStyle`);
    expect(p0.type).toBe(`HapticsImpactStyle`);

    const i1 = interfaces.find(i => i.name === 'VibrateListenerEvent');
    expect(i1.name).toBe('VibrateListenerEvent');
    expect(i1.properties).toHaveLength(3);
    expect(i1.properties[2].type).toBe('RepeatSchedule');
  });

  it('type typeAliases', () => {
    const t0 = typeAliases.find(i => i.name === 'VibrateListener');
    expect(t0.slug).toBe(`vibratelistener`);
    expect(t0.docs).toBe(`The vibrate listener callback function.`);
    expect(t0.types).toHaveLength(1);

    const t1 = typeAliases.find(i => i.name === 'RepeatSchedule');
    expect(t1.slug).toBe(`repeatschedule`);
    expect(t1.types).toHaveLength(4);
  });

  it('Plugins Config', () => {
    expect(pluginConfigs).toHaveLength(1);
    const p = pluginConfigs.find(i => i.name === `Haptics`);

    expect(p.slug).toBe(`haptics`);
    expect(p.docs).toBe(`Haptics can be configured with this options:`);
    expect(p.properties).toHaveLength(2);

    const p0 = p.properties[0];
    expect(p0.name).toBe(`style`);
    expect(p0.docs).toBe(`Configure the style.`);
    expect(p0.type).toBe(`'none' | 'native' | undefined`);
    expect(p0.complexTypes).toHaveLength(0);
    expect(p0.tags).toHaveLength(3);
    expect(p0.tags[0].name).toBe(`since`);
    expect(p0.tags[0].text).toBe(`1.0.0`);
    expect(p0.tags[1].name).toBe(`default`);
    expect(p0.tags[1].text).toBe(`native`);
    expect(p0.tags[2].name).toBe(`example`);
    expect(p0.tags[2].text).toBe(`"native"`);

    const p1 = p.properties[1];
    expect(p1.name).toBe(`duration`);
    expect(p1.docs).toBe(`Configure the duration.`);
    expect(p1.type).toBe(`number | undefined`);
    expect(p1.complexTypes).toHaveLength(0);
    expect(p1.tags).toHaveLength(2);
    expect(p1.tags[0].name).toBe(`since`);
    expect(p1.tags[0].text).toBe(`1.2.3`);
    expect(p1.tags[1].name).toBe(`example`);
    expect(p1.tags[1].text).toBe(`123`);
  });
});
