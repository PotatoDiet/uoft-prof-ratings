"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateMyProfApi = void 0;
// needed because chrome uses chrome.storage namespace with callbacks instead of the standardized
// browser.storage with promises.
const webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
function isProfessorInfo(obj) {
    return (obj !== undefined &&
        typeof obj.overallQuality === "string" &&
        typeof obj.wouldTakeAgain === "string" &&
        typeof obj.levelOfDifficulty === "string");
}
class RateMyProfApi {
    constructor() {
        this.schoolId = '12184';
        this.baseUrl = 'https://www.ratemyprofessors.com/';
    }
    async getProfId(name) {
        name = name.split(',')[0];
        let searchParams = new URLSearchParams();
        searchParams.set('queryoption', 'HEADER');
        searchParams.set('queryBy', 'teacherName');
        searchParams.set('schoolName', 'University+Of+Toronto');
        searchParams.set('schoolId', this.schoolId);
        searchParams.set('query', name);
        const response = await fetch(this.baseUrl + 'search.jsp?' + searchParams.toString());
        const parser = new DOMParser();
        const doc = parser.parseFromString(await response.text(), 'text/html');
        const profs = doc.querySelectorAll('.listing.PROFESSOR a');
        if (profs.length === 0) {
            return null;
        }
        // 2nd param can be any url, just need something to supress errors.
        const idUrl = new URL(profs[0].getAttribute('href'), 'http://test.com/');
        return idUrl.searchParams.get('tid');
    }
    async getProfInfo(name) {
        var _a, _b, _c;
        try {
            const res = await webextension_polyfill_ts_1.browser.storage.local.get(name);
            const profInfo = res[name];
            if (profInfo != null) {
                return JSON.parse(profInfo);
            }
        }
        catch (e) {
            console.error(e);
            return null;
        }
        const profId = await this.getProfId(name);
        if (profId === null) {
            return null;
        }
        let searchParams = new URLSearchParams();
        searchParams.set('tid', profId);
        const response = await fetch(this.baseUrl + 'ShowRatings.jsp?' + searchParams.toString());
        const parser = new DOMParser();
        const doc = parser.parseFromString(await response.text(), 'text/html');
        const profInfo = {
            overallQuality: (_a = doc.querySelector("[class^=RatingValue__Numerator-]")) === null || _a === void 0 ? void 0 : _a.innerHTML.trim(),
            wouldTakeAgain: (_b = doc.querySelector("[class^=FeedbackItem__FeedbackNumber-]")) === null || _b === void 0 ? void 0 : _b.innerHTML.trim(),
            levelOfDifficulty: (_c = doc.querySelector("[class^=FeedbackItem__FeedbackNumber]")) === null || _c === void 0 ? void 0 : _c.innerHTML.trim()
        };
        if (!isProfessorInfo(profInfo)) {
            return null;
        }
        webextension_polyfill_ts_1.browser.storage.local.set({ [name]: JSON.stringify(profInfo) });
        return profInfo;
    }
}
exports.RateMyProfApi = RateMyProfApi;
