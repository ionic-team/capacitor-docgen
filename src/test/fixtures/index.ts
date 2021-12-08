/**
 * Mocked for testing purposes
 */
import type { HapticsPlugin } from './definitions';
import type { HapticsImpactStyle, HapticsNotificationType } from './definitions';

const Haptics: HapticsPlugin = {} as any;

export { Haptics, HapticsImpactStyle, HapticsNotificationType };
