import { RateMyProfApi, ProfessorInfo } from './rate_my_prof_api';
import { TimetableUtm } from './timetable_utm';
import { TimetableStg } from './timetable_stg';

async function main() {
  switch (window.location.href) {
    case 'https://student.utm.utoronto.ca/timetable/':
      new TimetableUtm();
    case 'https://timetable.iit.artsci.utoronto.ca/':
      new TimetableStg();
  }
}

main();
