"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
const rate_my_prof_api_1 = require("./rate_my_prof_api");
let client = new rate_my_prof_api_1.RateMyProfApi();
webextension_polyfill_ts_1.browser.runtime.onMessage.addListener((message) => {
    return Promise.resolve(client.getProfInfo(message.getProfInfo));
});
