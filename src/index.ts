import { RateMyProfApi, ProfessorInfo } from './rate_my_prof_api';

async function main() {
  const searchButton = document.getElementById('searchButton')!;
  searchButton.addEventListener('click', () => {
    let client = new RateMyProfApi();
    setTimeout(() => {
      let courses = getCourses();
      courses.forEach(async el => {
        const name = getProfName(el);
        if (name !== '—') {
          const profInfo = await client.getProfInfo(name);
          if (profInfo != null) {
            el.appendChild(createHeaderField());
            el.appendChild(createInfoField(profInfo));
          }
        }
      });
    }, 1000);
  });
}

function getCourses(): NodeListOf<HTMLElement> {
  let rawCourses: NodeListOf<HTMLElement> = document.querySelectorAll('#courses .perMeeting tbody');
  return rawCourses;
}

function createInfoField(profInfo: ProfessorInfo): HTMLElement {
  let tr = document.createElement('tr');
  tr.className = 'sectionData';

  let td1 = document.createElement('td');
  td1.className = 'colEnrol';
  td1.innerText = profInfo.overallQuality;

  let td2 = document.createElement('td');
  td2.className = 'colEnrol';
  td2.innerText = profInfo.wouldTakeAgain;

  let td3 = document.createElement('td');
  td3.className = 'colEnrol';
  td3.innerText = profInfo.levelOfDifficulty;

  let td4 = document.createElement('td');
  td4.className = 'colEnrol';
  td4.innerText = profInfo.hotness;

  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  tr.appendChild(td4);

  return tr;
}

function createHeaderField(): HTMLElement {
  let tr = document.createElement('tr');
  tr.className = 'sectionHead';

  let td1 = document.createElement('td');
  td1.className = 'sectionData';
  td1.innerText = 'Overall Quality';

  let td2 = document.createElement('td');
  td2.className = 'sectionData';
  td2.innerText = 'Would Take Again';

  let td3 = document.createElement('td');
  td3.className = 'sectionData';
  td3.innerText = 'Level of Difficulty';

  let td4 = document.createElement('td');
  td4.className = 'sectionData';
  td4.innerText = 'Hotness';

  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  tr.appendChild(td4);

  return tr;
}

function getProfName(el: Element): string {
  const instructor = el.querySelector('.colInst') as HTMLElement;
  return instructor.innerText.trim();
}

main();
