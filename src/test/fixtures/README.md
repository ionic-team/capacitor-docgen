
# Haptics

The Haptics API provides physical feedback to the user through touch or vibration.

<!--DOCGEN_INDEX_START-->
* [impact()](#impact)
* [notification()](#notification)
* [vibrate()](#vibrate)
* [selectionStart()](#selectionstart)
* [Interfaces](#interfaces)
* [Enums](#enums)
<!--DOCGEN_INDEX_END-->

## Android Notes

To use vibration, you must add this permission to your `AndroidManifest.xml` file:

```xml
<uses-permission android:name="android.permission.VIBRATE" />
```

## Example

```typescript
import {
  Plugins,
  HapticsImpactStyle
} from '@capacitor/core';

const { Haptics } = Plugins;

export class HapticsExample {
  hapticsImpact(style = HapticsImpactStyle.Heavy) {
    Haptics.impact({
      style: style
    });
  }

  hapticsImpactMedium(style) {
    this.hapticsImpact(HapticsImpactStyle.Medium);
  }

  hapticsImpactLight(style) {
    this.hapticsImpact(HapticsImpactStyle.Light);
  }

  hapticsVibrate() {
    Haptics.vibrate();
  }

  hapticsSelectionStart() {
    Haptics.selectionStart();
  }

  hapticsSelectionChanged() {
    Haptics.selectionChanged();
  }

  hapticsSelectionEnd() {
    Haptics.selectionEnd();
  }
}
```

<!--DOCGEN_API_START-->
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->
## API

### impact

```typescript
impact(options: HapticsImpactOptions, x?: number | undefined) => Promise<HapticsImpact>
```

Trigger a haptics "impact" feedback

| Param       | Type                                          | Description        |
| ----------- | --------------------------------------------- | ------------------ |
| **options** | [HapticsImpactOptions](#hapticsimpactoptions) | The impact options |
| **x**       | number                                        |                    |

**Returns:** Promise&lt;[HapticsImpact](#hapticsimpact)&gt;

**Since:** 1.0.0

--------------------


### notification

```typescript
notification(options?: HapticsNotificationOptions | undefined) => Promise<string | number>
```

Trigger a haptics "notification" feedback

| Param       | Type                                                      |
| ----------- | --------------------------------------------------------- |
| **options** | [HapticsNotificationOptions](#hapticsnotificationoptions) |

**Returns:** Promise&lt;string | number&gt;

**Since:** 1.0.0

--------------------


### vibrate

```typescript
vibrate(options?: VibrateOptions | undefined) => Promise<number>
```

Vibrate the device

| Param       | Type                              |
| ----------- | --------------------------------- |
| **options** | [VibrateOptions](#vibrateoptions) |

**Returns:** Promise&lt;number&gt;

**Since:** 1.0.0

--------------------


### selectionStart

```typescript
selectionStart(value: number | string) => Promise<void>
```

Trigger a selection started haptic hint

| Param     | Type             |
| --------- | ---------------- |
| **value** | string \| number |

**Returns:** Promise&lt;void&gt;

**Since:** 1.0.0

--------------------


### Interfaces


#### HapticsImpact

| Prop      | Type   |
| --------- | ------ |
| **value** | number |


#### HapticsImpactOptions

| Prop      | Type                                      | Description                                                                                                                                                                              | Default                  | Since |
| --------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----- |
| **style** | [HapticsImpactStyle](#hapticsimpactstyle) | Impact Feedback Style The mass of the objects in the collision simulated by a [UIImpactFeedbackGenerator](https://developer.apple.com/documentation/uikit/uiimpactfeedbackstyle) object. | HapticsImpactStyle.Heavy | 1.0.0 |
| **value** | boolean                                   |                                                                                                                                                                                          |                          |       |


#### HapticsNotificationOptions

| Prop     | Type                                                | Description                                                                                                                                                                                       | Default                         | Since |
| -------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----- |
| **type** | [HapticsNotificationType](#hapticsnotificationtype) | Notification Feedback Type The type of notification feedback generated by a [UINotificationFeedbackGenerator](https://developer.apple.com/documentation/uikit/uinotificationfeedbacktype) object. | HapticsNotificationType.SUCCESS | 1.0.0 |


#### VibrateOptions

| Prop         | Type   | Description                                                      | Default | Since |
| ------------ | ------ | ---------------------------------------------------------------- | ------- | ----- |
| **duration** | number | Duration of the vibration in milliseconds. Not supported in iOS. | 300     | 1.0.0 |


### Enums


#### HapticsImpactStyle

| Members    | Value    | Description                                                  | Since |
| ---------- | -------- | ------------------------------------------------------------ | ----- |
| **Heavy**  | 'HEAVY'  | A collision between small, light user interface elements     | 1.0.0 |
| **Medium** | 'MEDIUM' | A collision between moderately sized user interface elements | 1.0.0 |
| **Light**  | 'LIGHT'  | A collision between small, light user interface elements     | 1.0.0 |


#### HapticsNotificationType

| Members     | Value     | Description                                                                    | Since |
| ----------- | --------- | ------------------------------------------------------------------------------ | ----- |
| **SUCCESS** | 'SUCCESS' | A notification feedback type indicating that a task has completed successfully | 1.0.0 |
| **WARNING** | 'WARNING' | A notification feedback type indicating that a task has produced a warning     | 1.0.0 |
| **ERROR**   | 'ERROR'   | A notification feedback type indicating that a task has failed                 | 1.0.0 |


<!--DOCGEN_API_END-->
