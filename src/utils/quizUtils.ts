export function isQuizInProgress(index: number, score: number, asvabActive: boolean, hasSubmitted = false) {
  // Consider a quiz in-progress only if the ASVAB test is active (time running)
  // OR the user has submitted at least one answer in this quiz session.
  return Boolean(asvabActive) || Boolean(hasSubmitted);
}

export default { isQuizInProgress };
