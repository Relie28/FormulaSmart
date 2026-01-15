type SimpleQ = { id: string; prompt: string; answer: string };

export class AdaptiveSection {
  tiers: SimpleQ[][];
  tierIndex: number; // 0-based
  askedCounts: number[];
  correctCounts: number[];
  consecutiveCorrect: number;
  failStreakForTier: number[];
  hintMode: boolean;

  constructor(tiers: SimpleQ[][], startTier = 2) {
    this.tiers = tiers.map((t) => shuffle(t.slice()));
    this.tierIndex = Math.max(0, Math.min(startTier, tiers.length - 1));
    this.askedCounts = new Array(tiers.length).fill(0);
    this.correctCounts = new Array(tiers.length).fill(0);
    this.consecutiveCorrect = 0;
    this.failStreakForTier = new Array(tiers.length).fill(0);
    this.hintMode = false;
  }

  nextQuestion(): { q: SimpleQ | null; tier: number } {
    // if all tiers empty, return null
    if (this.allEmpty()) return { q: null, tier: -1 };

    // Fast-track if two consecutive corrects and higher tier has questions
    if (this.consecutiveCorrect >= 2) {
      const hi = this.findNextNonEmptyTier(this.tierIndex + 1, 1);
      if (hi !== -1) {
        const q = this.tiers[hi].pop() as SimpleQ;
        this.askedCounts[hi]++;
        // reset consecutive correct so fast-track doesn't chain uncontrollably
        this.consecutiveCorrect = 0;
        return { q, tier: hi };
      }
    }

    // otherwise take from current tier if available, else find nearest non-empty tier
    if (this.tiers[this.tierIndex].length > 0) {
      const q = this.tiers[this.tierIndex].pop() as SimpleQ;
      this.askedCounts[this.tierIndex]++;
      return { q, tier: this.tierIndex };
    }
    const next = this.findNextNonEmptyTier(this.tierIndex, -1);
    if (next !== -1) {
      const q = this.tiers[next].pop() as SimpleQ;
      this.askedCounts[next]++;
      return { q, tier: next };
    }
    return { q: null, tier: -1 };
  }

  submitAnswer(tier: number, correct: boolean) {
    if (tier < 0 || tier >= this.tiers.length) return;
    if (correct) {
      this.correctCounts[tier]++;
      this.consecutiveCorrect++;
    } else {
      this.consecutiveCorrect = 0;
      // enable hint mode early if many attempts and few corrects
      const asked = this.askedCounts[tier];
      const correctSoFar = this.correctCounts[tier];
      if (asked >= 3 && correctSoFar <= 1) this.hintMode = true;
    }

    // If tier completed (askedCounts reaches original size), evaluate promotion/demotion
    const originalSize = this.originalTierSize(tier);
    if (this.askedCounts[tier] >= originalSize) {
      // evaluate
      const correct = this.correctCounts[tier];
      if (correct >= 4) {
        this.tierIndex = Math.min(this.tiers.length - 1, this.tierIndex + 1);
        this.failStreakForTier[this.tierIndex] = 0;
      } else if (correct === 3) {
        // stay
      } else {
        // demote
        this.failStreakForTier[this.tierIndex]++;
        if (this.failStreakForTier[this.tierIndex] >= 2) {
          // enable hint mode for remediation
          this.hintMode = true;
        }
        this.tierIndex = Math.max(0, this.tierIndex - 1);
      }
    }
  }

  allEmpty() {
    return this.tiers.every((t) => t.length === 0);
  }

  findNextNonEmptyTier(from: number, dir: number) {
    // dir 1 = forward, -1 = backward or search both
    if (dir === 1) {
      for (let i = from; i < this.tiers.length; i++) if (this.tiers[i].length > 0) return i;
      return -1;
    }
    // search forward then backward
    for (let i = from; i < this.tiers.length; i++) if (this.tiers[i].length > 0) return i;
    for (let i = from - 1; i >= 0; i--) if (this.tiers[i].length > 0) return i;
    return -1;
  }

  originalTierSize(tier: number) {
    // We assume each tier originally had up to 5 questions; if fewer, use asked+remaining
    return this.askedCounts[tier] + this.tiers[tier].length || 5;
  }
}

function shuffle<T>(arr: T[]) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default AdaptiveSection;
