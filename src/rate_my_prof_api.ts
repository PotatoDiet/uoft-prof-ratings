// needed because chrome uses chrome.storage namespace with callbacks instead of the standardized
// browser.storage with promises.
import { browser } from 'webextension-polyfill-ts'

interface ProfessorInfo {
  readonly overallQuality: string;
  readonly wouldTakeAgain: string;
  readonly levelOfDifficulty: string;
}

function isProfessorInfo(obj: any): obj is ProfessorInfo {
  return (
    obj !== undefined &&
    typeof obj.overallQuality === "string" &&
    typeof obj.wouldTakeAgain === "string" &&
    typeof obj.levelOfDifficulty === "string"
  );
}

class RateMyProfApi {
  private readonly schoolId = '12184';
  private readonly baseUrl = 'https://www.ratemyprofessors.com/';

  private async getProfId(name: string): Promise<string | null> {
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
      return Promise.resolve(null);
    }

    // 2nd param can be any url, just need something to supress errors.
    const idUrl = new URL(profs[0].getAttribute('href')!, 'http://test.com/');
    return Promise.resolve(idUrl.searchParams.get('tid'));
  }

  public async getProfInfo(name: string): Promise<ProfessorInfo | null> {
    try {
      const res = await browser.storage.local.get(name);
      const profInfo = res[name];
      if (profInfo != null) {
        return Promise.resolve(JSON.parse(profInfo as string));
      }
    } catch (e) {
      console.error(e);
      return Promise.resolve(null);
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
    console.log(profId);

    const profInfo = {
      overallQuality: doc.querySelector("[class^=RatingValue__Numerator-]")?.innerHTML.trim(),
      wouldTakeAgain: doc.querySelector("[class^=FeedbackItem__FeedbackNumber-]")?.innerHTML.trim(),
      levelOfDifficulty: doc.querySelector("[class^=FeedbackItem__FeedbackNumber]")?.innerHTML.trim()
    };
    if (!isProfessorInfo(profInfo)) {
      return null;
    }

    browser.storage.local.set({[name]: JSON.stringify(profInfo)});

    return Promise.resolve(profInfo);
  }
}

export { RateMyProfApi, ProfessorInfo };
