import { isQuizInProgress } from './quizUtils';

export function shouldPromptLeave(index: number, score: number, asvabActive: boolean, isFocused: boolean, hasSubmitted = false) {
  return Boolean(isFocused) && isQuizInProgress(index, score, asvabActive, hasSubmitted);
}

export default { shouldPromptLeave };
