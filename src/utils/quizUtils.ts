export function isQuizInProgress(index: number, score: number, asvabActive: boolean) {
  return index > 0 || score > 0 || Boolean(asvabActive);
}

export default { isQuizInProgress };
