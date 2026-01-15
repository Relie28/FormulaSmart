import { Card } from '../data/cards';

// Build a 45-question ASVAB pool sampling from card subjects that map to
// Arithmetic Reasoning (AR) and Math Knowledge (MK). We ensure a minimum
// number of word-problem questions are included.
export function buildAsvabPool(allCards: Card[], total = 45, minWordProblems = 10) {
    const arSubjects = new Set(['Arithmetic', 'Word Problems']);
    const mkSubjects = new Set(['Pre-Algebra', 'Algebra', 'Geometry', 'Arithmetic']);

    const wordPool = allCards.filter((c) => c.subject === 'Word Problems');
    const arMkPool = allCards.filter((c) => arSubjects.has(c.subject) || mkSubjects.has(c.subject));

    // helper shuffle
    function shuffle<T>(arr: T[]) {
        return arr.slice().sort(() => Math.random() - 0.5);
    }

    const pick: Card[] = [];

    // Guarantee minWordProblems or as many as exist
    const takeWord = Math.min(minWordProblems, wordPool.length);
    pick.push(...shuffle(wordPool).slice(0, takeWord));

    // Fill the remainder with AR/MK pool (excluding already picked)
    const remainingNeeded = total - pick.length;
    const available = shuffle(arMkPool.filter((c) => !pick.find((p) => p.id === c.id)));
    pick.push(...available.slice(0, remainingNeeded));

    // If not enough cards (rare), pad with any cards
    if (pick.length < total) {
        const extras = shuffle(allCards.filter((c) => !pick.find((p) => p.id === c.id)));
        pick.push(...extras.slice(0, total - pick.length));
    }

    return shuffle(pick).slice(0, total);
}

// Build separate ASVAB sections: Arithmetic Reasoning (AR) and Math Knowledge (MK).
// AR will prioritize word problems and arithmetic-themed questions.
export function buildAsvabSections(allCards: Card[], arTotal = 30, mkTotal = 15, minWordProblems = 10) {
    const arSubjects = new Set(['Arithmetic', 'Word Problems']);
    const mkSubjects = new Set(['Pre-Algebra', 'Algebra', 'Geometry', 'Arithmetic']);

    function shuffle<T>(arr: T[]) {
        return arr.slice().sort(() => Math.random() - 0.5);
    }

    const wordPool = allCards.filter((c) => c.subject === 'Word Problems');
    const arMkPool = allCards.filter((c) => arSubjects.has(c.subject) || mkSubjects.has(c.subject));

    const ar: Card[] = [];
    const mk: Card[] = [];

    // Fill AR with word problems first
    const takeWord = Math.min(minWordProblems, wordPool.length, arTotal);
    ar.push(...shuffle(wordPool).slice(0, takeWord));

    // Fill the remainder of AR from AR/MK pool excluding already chosen
    const remainingAr = arTotal - ar.length;
    const availableAr = shuffle(arMkPool.filter((c) => !ar.find((p) => p.id === c.id)));
    ar.push(...availableAr.slice(0, remainingAr));

    // Fill MK from mkSubjects pool excluding cards already in AR
    const mkPool = allCards.filter((c) => mkSubjects.has(c.subject) && !ar.find((p) => p.id === c.id));
    const availableMk = shuffle(mkPool);
    mk.push(...availableMk.slice(0, mkTotal));

    // If MK not enough, pad from remaining cards
    if (mk.length < mkTotal) {
        const extras = shuffle(allCards.filter((c) => !ar.find((p) => p.id === c.id) && !mk.find((p) => p.id === c.id)));
        mk.push(...extras.slice(0, mkTotal - mk.length));
    }

    // If AR not enough (rare), pad as well
    if (ar.length < arTotal) {
        const extras = shuffle(allCards.filter((c) => !ar.find((p) => p.id === c.id) && !mk.find((p) => p.id === c.id)));
        ar.push(...extras.slice(0, arTotal - ar.length));
    }

    return { ar: shuffle(ar).slice(0, arTotal), mk: shuffle(mk).slice(0, mkTotal) };
}

// A simple AFQT estimator: percentage correct mapped to 0-99 scale.
export function computeAfqtEstimate(correct: number, total: number) {
    if (total <= 0) return 0;
    const pct = (correct / total) * 100;
    // cap at 99
    return Math.min(99, Math.max(0, Math.round(pct)));
}

export default { buildAsvabPool, computeAfqtEstimate };
