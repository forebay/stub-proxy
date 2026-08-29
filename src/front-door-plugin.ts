import { frontDoor, FRONT_DOOR } from "@intisy-ai/basekit/proxy";
import type { Plugin, PluginContext } from "@intisy/bayonet";
import { stubProfile } from "./profile.js";

const plugin: Plugin = {
  /** Hands the host this app's front door, under the capability id the engine mints for it. */
  activate(context: PluginContext) {
    context.provide(FRONT_DOOR, frontDoor(stubProfile()));
  },
  /** Nothing to tear down: the capability holds no resource of its own. */
  deactivate() {},
};

/**
 * What an in-process host loads: this app's wire format, as the `front-door` capability.
 *
 * @remarks
 * The api is a type-only import, so it erases at build time and this module's runtime imports stay
 * as small as a front door loaded by a host that already has the api needs them to be.
 *
 * This module is bundled ALONE into `dist/front-door-plugin.js`, because a home deploys the
 * manifest's entry as one file. A relative import here resolves to nothing there, which is what
 * `deployed-entry.test.ts` holds.
 */
export default plugin;
