import { defineRemoteFederation } from "@cloud-ui/shared/config";

export default defineRemoteFederation({
  name: "reka-ui-remote",
  mount: "./src/mount.ts",
});
