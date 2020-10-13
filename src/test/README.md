# My Capacitor Plugin 🔌

The readme file can be formatted however you'd like. Just insert 
the HTML placeholder comments where the index of the API
methods, and the API docs should go.

Below is an index of all the methods available.

<!--DOCGEN_INDEX_START-->
<div class="docgen docgen-index">

* [`impact(...)`](#impact)
* [`notification(...)`](#notification)
* [`vibrate(...)`](#vibrate)
* [`selectionStart(...)`](#selectionstart)
* [Interfaces](#interfaces)
* [Enums](#enums)

</div>
<!--DOCGEN_INDEX_END-->

## Custom Readme Content

Manage your readme content however you'd like, and on every docgen 
rebuild it will leave your original content as is, but update the 
HTML placeholder comments with the updated generated docs.

<!--DOCGEN_API_START-->
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->
<div class="docgen docgen-api">

## Docs from JSDoc comments!

This content is from the JSDOC comments on top of
the `HapticsPlugin` interface. All the API data below
is generated from comments from its methods, interfaces
and enums.

Take a look at the test [HapticsPlugin interface source file](https://github.com/ionic-team/capacitor-docgen/blob/master/src/test/fixtures/definitions.ts).

## API

### impact(...)

```typescript
impact(options: HapticsImpactOptions, x?: number | undefined) => Promise<HapticsImpact>
```

Trigger a haptics "impact" feedback

| Param         | Type                                                                  | Description        |
| ------------- | --------------------------------------------------------------------- | ------------------ |
| **`options`** | <code><a href="#hapticsimpactoptions">HapticsImpactOptions</a></code> | The impact options |
| **`x`**       | <code>number</code>                                                   |                    |

**Returns:** <code>Promise&lt;<a href="#hapticsimpact">HapticsImpact</a>&gt;</code>

**Since:** 1.0.0

--------------------


### notification(...)

```typescript
notification(options?: HapticsNotificationOptions | undefined) => Promise<string | number>
```

Trigger a haptics "notification" feedback

| Param         | Type                                                                              |
| ------------- | --------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#hapticsnotificationoptions">HapticsNotificationOptions</a></code> |

**Returns:** <code>Promise&lt;string | number&gt;</code>

**Since:** 1.0.0

--------------------


### vibrate(...)

```typescript
vibrate(options?: VibrateOptions | undefined) => Promise<number>
```

Vibrate the device

| Param         | Type                                                      |
| ------------- | --------------------------------------------------------- |
| **`options`** | <code><a href="#vibrateoptions">VibrateOptions</a></code> |

**Returns:** <code>Promise&lt;number&gt;</code>

**Since:** 1.0.0

--------------------


### selectionStart(...)

```typescript
selectionStart(value: number | string) => Promise<void>
```

Trigger a selection started haptic hint

| Param       | Type                          |
| ----------- | ----------------------------- |
| **`value`** | <code>string \| number</code> |

**Returns:** <code>Promise&lt;void&gt;</code>

**Since:** 1.0.0

--------------------


### Interfaces


#### HapticsImpact

| Prop        | Type                |
| ----------- | ------------------- |
| **`value`** | <code>number</code> |


#### HapticsImpactOptions

| Prop            | Type                                                                  | Description                                                                                                                                                                                | Default                               | Since |
| --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ----- |
| **`style`**     | <code><a href="#hapticsimpactstyle">HapticsImpactStyle</a></code>     | Impact Feedback Style The mass of the objects in the collision simulated by a [`UIImpactFeedbackGenerator`](https://developer.apple.com/documentation/uikit/uiimpactfeedbackstyle) object. | <code>HapticsImpactStyle.Heavy</code> | 1.0.0 |
| **`value`**     | <code>boolean</code>                                                  |                                                                                                                                                                                            |                                       |       |
| **`recursive`** | <code><a href="#hapticsimpactoptions">HapticsImpactOptions</a></code> |                                                                                                                                                                                            |                                       |       |


#### HapticsNotificationOptions

| Prop       | Type                                                                        | Description                                                                                                                                                                                         | Default                                      | Since |
| ---------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----- |
| **`type`** | <code><a href="#hapticsnotificationtype">HapticsNotificationType</a></code> | Notification Feedback Type The type of notification feedback generated by a [`UINotificationFeedbackGenerator`](https://developer.apple.com/documentation/uikit/uinotificationfeedbacktype) object. | <code>HapticsNotificationType.SUCCESS</code> | 1.0.0 |


#### VibrateOptions

| Prop           | Type                | Description                                                      | Default          | Since |
| -------------- | ------------------- | ---------------------------------------------------------------- | ---------------- | ----- |
| **`duration`** | <code>number</code> | Duration of the vibration in milliseconds. Not supported in iOS. | <code>300</code> | 1.0.0 |


### Enums


#### HapticsImpactStyle

| Members      | Value                 | Description                                                  | Since |
| ------------ | --------------------- | ------------------------------------------------------------ | ----- |
| **`Heavy`**  | <code>'HEAVY'</code>  | A collision between small, light user interface elements     | 1.0.0 |
| **`Medium`** | <code>'MEDIUM'</code> | A collision between moderately sized user interface elements | 1.0.0 |
| **`Light`**  | <code>'LIGHT'</code>  | A collision between small, light user interface elements     | 1.0.0 |


#### HapticsNotificationType

| Members       | Value                  | Description                                                                    | Since |
| ------------- | ---------------------- | ------------------------------------------------------------------------------ | ----- |
| **`SUCCESS`** | <code>'SUCCESS'</code> | A notification feedback type indicating that a task has completed successfully | 1.0.0 |
| **`WARNING`** | <code>'WARNING'</code> | A notification feedback type indicating that a task has produced a warning     | 1.0.0 |
| **`ERROR`**   | <code>'ERROR'</code>   | A notification feedback type indicating that a task has failed                 | 1.0.0 |

</div>
<!--DOCGEN_API_END-->

## Commit Your Readme 🚀

The benefit of this readme file is that is also acts as the landing 
page for the Github repo and NPM package, and the anchors within the 
docs can also be linked to and shared.