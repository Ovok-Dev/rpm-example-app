import { polyfillWebCrypto } from "expo-standard-web-crypto";
import { registerRootComponent } from "expo";

polyfillWebCrypto();

// Initialize native crypto before loading the client and its PKCE helpers.
const App = require("./App").default;
registerRootComponent(App);
