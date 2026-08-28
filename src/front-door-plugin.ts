import { frontDoor } from "@intisy-ai/core-proxy";
import { stubProfile } from "./profile.js";

const plugin = {
  /** Hands the host this app's front door, under the capability id the engine mints for it. */
  activate(context: { provide: (id: string, implementation: unknown) => void }) {
    context.provide("front-door", frontDoor(stubProfile()));
  },
  /** Nothing to tear down: the capability holds no resource of its own. */
  deactivate() {},
};

/**
 * What an in-process host loads: this app's wire format, as the `front-door` capability.
 *
 * @remarks
 * Typed structurally rather than as the api's `Plugin`, because a host duck-types `activate` and
 * `deactivate` and `frontDoor()` already returns the capability shape the api declares. Keeping the
 * api out of this module's runtime imports is also what lets the bundle stay small: a front door is
 * loaded by a host that has the api already.
 *
 * This module is bundled ALONE into `dist/front-door-plugin.js`, because a home deploys the
 * manifest's entry as one file. A relative import here resolves to nothing there, which is what
 * `deployed-entry.test.ts` holds.
 */
export default plugin;
