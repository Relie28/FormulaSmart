import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Rect, Polygon, Line, Ellipse } from 'react-native-svg';
import type { Card } from '../data/cards';
import { explainFormula } from '../utils/formulaExplain';
import { deviceWidth, useDeviceSize } from '../utils/device';

function ShapePreview({ card }: { card: Card }) {

    // determine shape from explicit shape card or from prompt/answer text on definition/word cards
    let shape: string | null = null;
    const candidates = ['right triangle', 'right-triangle', 'square', 'rectangle', 'circle', 'triangle', 'parallelogram', 'trapezoid', 'rhombus', 'pentagon', 'hexagon', 'ellipse', 'oval', 'kite'];
    if (card.type === 'shape') {
        shape = (card.shape || '').toLowerCase();
    } else {
        const hay = ((card.prompt || '') + ' ' + (card.answer || '')).toLowerCase();
        for (const c of candidates) {
            if (hay.includes(c)) { shape = c; break; }
        }
    }
    if (!shape) return null;

    

    const strokeProps = { stroke: '#3a3563', strokeWidth: 3, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' } as any;

    if (shape === 'circle') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="30" {...strokeProps} />
        </Svg>
    );
    if (shape === 'rectangle') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Rect x="20" y="30" width="60" height="40" {...strokeProps} />
        </Svg>
    );
    if (shape === 'square') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Rect x="20" y="20" width="60" height="60" {...strokeProps} />
        </Svg>
    );
    if (shape === 'triangle') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="50,20 80,80 20,80" {...strokeProps} />
        </Svg>
    );
    if (shape === 'right triangle' || shape === 'right-triangle' || shape === 'righttriangle') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="20,80 80,80 20,20" {...strokeProps} />
            {/* right-angle marker */}
            <Line x1="30" y1="80" x2="30" y2="70" stroke="#3a3563" strokeWidth={3} />
            <Line x1="30" y1="70" x2="20" y2="70" stroke="#3a3563" strokeWidth={3} />
        </Svg>
    );
    if (shape === 'parallelogram') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="20,30 80,30 60,80 0,80" {...strokeProps} />
        </Svg>
    );
    if (shape === 'trapezoid') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="30,30 70,30 90,80 10,80" {...strokeProps} />
        </Svg>
    );
    if (shape === 'rhombus' || shape === 'diamond') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="50,15 85,50 50,85 15,50" {...strokeProps} />
        </Svg>
    );
    if (shape === 'pentagon') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="50,10 85,35 70,80 30,80 15,35" {...strokeProps} />
        </Svg>
    );
    if (shape === 'hexagon') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="50,10 80,25 80,65 50,90 20,65 20,25" {...strokeProps} />
        </Svg>
    );
    if (shape === 'ellipse' || shape === 'oval') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Ellipse cx="50" cy="50" rx="35" ry="23" {...strokeProps} />
        </Svg>
    );
    if (shape === 'kite') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="50,15 80,50 50,85 20,50" {...strokeProps} />
        </Svg>
    );
    return null;
}

export default function FlashcardView({
    card,
    revealed,
    onReveal,
    onShowHint
    , hideAnswer
}: {
    card: Card;
    revealed: boolean;
    onReveal: () => void;
    onShowHint?: () => void;
    hideAnswer?: boolean;
}) {
    const maxWidth = Math.min(320, Math.round(deviceWidth * 0.9));
    const { height, width } = useDeviceSize();

    return (
        <View style={[styles.card, { marginTop: height / 3.8 }]}>
            {!revealed ? (
                <View style={styles.front}>
                            <View style={{ position: 'absolute', top: -160 }}>
                                <ShapePreview card={card} />
                            </View>

                    <Text style={[styles.prompt, { maxWidth, marginBottom: 80 }]}>
                        {card.prompt}
                    </Text>

                    {card.type === 'word' && (
                        <TouchableOpacity onPress={onShowHint} style={styles.hintButton}>
                            <Text style={{ color: '#fff' }}>
                                Show hint
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={onReveal} style={styles.revealButton}>
                        <Text style={{ color: '#fff' }}>
                            Show the card
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.back}>
                    <View style={{ position: 'absolute', top: -160 }}>
                        <ShapePreview card={card} />
                    </View>
                    {(() => {
                        const expl = explainFormula(card);
                        if (expl) return <Text style={[styles.explanation, { maxWidth }]}>{expl}</Text>;
                        // if definition, show a short plain-English line if possible
                        if (card.type === 'definition') {
                            const def = card.answer.replace('\n', ' ');
                            return <Text style={[styles.explanation, { maxWidth }]}>{def}</Text>;
                        }
                        return null;
                    })()}
                    {!hideAnswer ? <Text style={[styles.answer, { maxWidth }]}>{card.answer}</Text> : null}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
    front: { alignItems: 'center' },
    back: { alignItems: 'center' },
    prompt: { fontSize: 25, marginBottom: 12, textAlign: 'center', maxWidth: 320 },
    answer: { fontSize: 25, color: '#3a3563', textAlign: 'center' },
    hintButton: { marginTop: 12, backgroundColor: '#3a3563', padding: 8, borderRadius: 6 }
    ,
    revealButton: { marginTop: 12, backgroundColor: '#0a84ff', padding: 8, borderRadius: 6 }
    ,
    explanation: { fontSize: 16, color: '#333', marginBottom: 8, fontStyle: 'italic', textAlign: 'center' }
});
