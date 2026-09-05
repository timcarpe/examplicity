import { permanentRedirect } from 'next/navigation';
import { subjects } from './labs.ts';

export default function Home() {
  permanentRedirect(subjects[0].views[subjects[0].exams[0]]!.href);
}
