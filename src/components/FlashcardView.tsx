import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Rect, Polygon, Line } from 'react-native-svg';
import type { Card } from '../data/cards';
import { explainFormula } from '../utils/formulaExplain';
import { deviceWidth, useDeviceSize } from '../utils/device';

function ShapePreview({ card }: { card: Card }) {

    if (card.type !== 'shape') return null;

    const shape = card.shape.toLowerCase();

    if (shape === 'circle') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="30" fill="#3a3563" />
        </Svg>
    );

    if (shape === 'rectangle' || shape === 'square') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Rect x="20" y="30" width="60" height="40" fill="#3a3563" />
        </Svg>
    );

    if (shape === 'triangle') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="50,20 80,80 20,80" fill="#3a3563" />
        </Svg>
    );

    if (shape === 'parallelogram') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="20,30 80,30 60,80 0,80" fill="#3a3563" />
        </Svg>
    );

    if (shape === 'trapezoid') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="30,30 70,30 90,80 10,80" fill="#3a3563" />
        </Svg>
    );

    if (shape === 'rhombus') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="50,15 85,50 50,85 15,50" fill="#3a3563" />
        </Svg>
    );
    
    if (shape === 'right triangle') return (
        <Svg width={160} height={160} viewBox="0 0 100 100">
            <Polygon points="20,80 80,80 20,20" fill="#3a3563" />
            {/* right-angle marker */}
            <Line x1="20" y1="80" x2="30" y2="80" stroke="#fff" strokeWidth="3" />
            <Line x1="20" y1="80" x2="20" y2="70" stroke="#fff" strokeWidth="3" />
        </Svg>
    );
    return null;
}

export default function FlashcardView({
    card,
    revealed,
    onReveal,
    onShowHint
}: {
    card: Card;
    revealed: boolean;
    onReveal: () => void;
    onShowHint?: () => void;
}) {
    const maxWidth = Math.min(320, Math.round(deviceWidth * 0.9));
    const { height, width } = useDeviceSize();

    return (
        <View style={[styles.card, { marginTop: height/5.3 }]}>
            {!revealed ? (
                <View style={styles.front}>
                    <Text style={[styles.prompt, { maxWidth, marginBottom: 80 }]}>
                        {card.prompt}
                    </Text>
                    
                    <ShapePreview card={card} />

                    {card.type === 'word' && (
                        <TouchableOpacity onPress={onShowHint} style={styles.hintButton}>
                            <Text style={{ color: '#fff' }}>
                                Show hint
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={onReveal} style={styles.revealButton}>
                        <Text style={{ color: '#fff' }}>
                            Reveal answer
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.back}>
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
                    <Text style={[styles.answer, { maxWidth }]}>{card.answer}</Text>
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
