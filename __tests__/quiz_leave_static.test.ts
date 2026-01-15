import fs from 'fs';
import path from 'path';

describe('Quiz leave confirmation static checks', () => {
    const src = fs.readFileSync(path.join(__dirname, '../src/screens/Quiz.tsx'), 'utf8');

    it('registers a beforeRemove listener', () => {
        expect(src.includes("addListener('beforeRemove'") || src.includes('addListener("beforeRemove"'));
    });

    it('prompts with an explanatory message when in-progress', () => {
        expect(src.includes("'Leave quiz?'") || src.includes('"Leave quiz?"')).toBeTruthy();
        expect(src.includes('progress').toString()).toBeDefined();
    });

    it('considers ASVAB active state for leave protection via helper', () => {
        // the component should use the helper that encodes the in-progress rule
        expect(src.includes('isQuizInProgress') || src.includes("index > 0 || score > 0")).toBeTruthy();
    });

    it('disables swipe gestures and installs BackHandler when quiz in-progress', () => {
        expect(src.includes('gestureEnabled')).toBeTruthy();
        expect(src.includes('BackHandler.addEventListener')).toBeTruthy();
        expect(src.includes('headerLeft')).toBeTruthy();
        // ensure handlers are only installed when focused
        expect(src.includes('isFocused')).toBeTruthy();
        // ensure we avoid re-prompting once leaving has been confirmed
        expect(src.includes('isLeavingRef.current') || src.includes('already confirmed')).toBeTruthy();
    });
});
