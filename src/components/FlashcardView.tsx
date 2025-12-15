import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Rect, Polygon, Line, Ellipse } from 'react-native-svg';
import type { Card } from '../data/cards';
import { detectShapeFromCard } from '../utils/shapeDetect';
import { explainFormula } from '../utils/formulaExplain';
import { extractShapeNumbers, getShapeLabels as _getShapeLabels } from '../utils/shapeLabels';
import { deviceWidth, useDeviceSize } from '../utils/device';

function ShapePreview({ card }: { card: Card }) {

    // determine shape from explicit shape card or from prompt/answer text on definition/word cards
    // use detectShapeFromCard helper to reliably detect shapes (avoids matching generic overview cards)
    const shape = detectShapeFromCard(card);
    if (!shape) return null;

    const hay = ((card.prompt || '') + ' ' + (card.answer || '')).toLowerCase();
    const showRadius = /radius|circumference|diameter/.test(hay);
    const showDiameter = /diameter|diagonal/.test(hay);
    const showCirc = /circumference|perimeter/.test(hay);
    const showVolume = /volume|v =|cylinder/.test(hay);



    const strokeProps = { stroke: '#3a3563', strokeWidth: 3, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' } as any;

    // helper to render a positioned label over the SVG using native <Text>
    const Label = ({ x, y, text, vbW = 100, vbH = 100, fontSize = 10 }: { x: number; y: number; text: string; vbW?: number; vbH?: number; fontSize?: number }) => {
        // convert viewBox coords to percent so we can use percentage positioning
        const left = `${(x / vbW) * 100}%`;
        const top = `${(y / vbH) * 100}%`;
        const style: any = { position: 'absolute', left, top, fontSize, color: '#3a3563' };
        return (
            <Text style={style}>{text}</Text>
        );
    };

    // circle with optional radius/diameter/circumference annotation
    if (shape === 'circle') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="30" {...strokeProps} />
                {showRadius && (
                    <Line x1="50" y1="50" x2="80" y2="50" stroke="#3a3563" strokeWidth={2} />
                )}
                {showDiameter && (
                    <Line x1="20" y1="50" x2="80" y2="50" stroke="#3a3563" strokeWidth={1} strokeDasharray="2,2" />
                )}
            </Svg>
            {showRadius && <Label x={66} y={46} text="r" vbW={100} vbH={100} fontSize={8} />}
            {showDiameter && <Label x={48} y={44} text="d" vbW={100} vbH={100} fontSize={8} />}
            {showCirc && <Label x={50} y={95} text="C = 2πr" vbW={100} vbH={100} fontSize={9} />}
                {card.type === 'word' && (() => {
                    const nums = extractShapeNumbers(card as any);
                    return (
                        <>
                            {nums.r ? <Label x={80} y={46} text={nums.r} vbW={100} vbH={100} fontSize={8} /> : null}
                            {nums.d ? <Label x={48} y={34} text={nums.d} vbW={100} vbH={100} fontSize={8} /> : null}
                        </>
                    );
                })()}
        </View>
    );
    // rectangular solid (volume) depiction when volume context appears
    if ((shape === 'rectangle' || shape === 'rectangular solid') && showVolume) return (
        <View style={{ width: 180, height: 140, position: 'relative' }}>
            <Svg width={180} height={140} viewBox="0 0 180 140">
                {/* top face */}
                <Polygon points="50,20 140,20 160,40 70,40" {...strokeProps} />
                {/* front face */}
                <Polygon points="50,20 70,40 70,100 50,80" {...strokeProps} />
                <Polygon points="70,40 160,40 160,100 70,100" {...strokeProps} />
            </Svg>
            {/* labels (letters only) */}
            <Label x={30} y={60} text="l" vbW={180} vbH={140} fontSize={10} />
            <Label x={120} y={12} text="w" vbW={180} vbH={140} fontSize={10} />
            <Label x={165} y={70} text="h" vbW={180} vbH={140} fontSize={10} />
        </View>
    );

    // rectangle (2D) show area and optionally perimeter
    if (shape === 'triangle') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
                <Polygon points="50,20 80,80 20,80" {...strokeProps} />
            </Svg>
            {/* letters for triangle: base (b) and height (h) */}
            <Label x={50} y={86} text="b" vbW={100} vbH={100} fontSize={9} />
            <Label x={30} y={40} text="h" vbW={100} vbH={100} fontSize={9} />
        </View>
    );
    
    if (shape === 'cube') return (
        // render a cube representation for cubic contexts
        <View style={{ width: 180, height: 140, position: 'relative' }}>
            <Svg width={180} height={140} viewBox="0 0 180 140">
                <Polygon points="60,20 120,20 140,40 80,40" {...strokeProps} />
                <Polygon points="60,20 80,40 80,100 60,80" {...strokeProps} />
                <Polygon points="80,40 140,40 140,100 80,100" {...strokeProps} />
            </Svg>
            <Label x={40} y={60} text="s" vbW={180} vbH={140} fontSize={10} />
            <Label x={90} y={12} text="s" vbW={180} vbH={140} fontSize={10} />
            <Label x={145} y={70} text="s" vbW={180} vbH={140} fontSize={10} />
            {card.type === 'word' && (() => {
                const nums = extractShapeNumbers(card as any);
                return nums.s ? <Label x={90} y={8} text={nums.s} vbW={180} vbH={140} fontSize={9} /> : null;
            })()}
        </View>
    );

    // rectangle (2D) show area and optionally perimeter (also labeled length/width)
    if (shape === 'rectangle') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
                <Rect x="20" y="30" width="60" height="40" {...strokeProps} />
            </Svg>
            <Label x={50} y={28} text="l" vbW={100} vbH={100} fontSize={8} />
            <Label x={84} y={50} text="w" vbW={100} vbH={100} fontSize={8} />
            {/* letters only: length and width */}
            <Label x={50} y={86} text="l" vbW={100} vbH={100} fontSize={9} />
            <Label x={84} y={60} text="w" vbW={100} vbH={100} fontSize={8} />
            {card.type === 'word' && (() => {
                const nums = extractShapeNumbers(card as any);
                return (
                    <>
                        {nums.l ? <Label x={50} y={76} text={nums.l} vbW={100} vbH={100} fontSize={9} /> : null}
                        {nums.w ? <Label x={94} y={50} text={nums.w} vbW={100} vbH={100} fontSize={9} /> : null}
                    </>
                );
            })()}
        </View>
    );
    if (shape === 'square') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
                <Rect x="20" y="20" width="60" height="60" {...strokeProps} />
            </Svg>
            {/* only show side letter for square */}
            <Label x={50} y={18} text="s" vbW={100} vbH={100} fontSize={8} />
            {card.type === 'word' && (() => {
                const nums = extractShapeNumbers(card as any);
                return nums.s ? <Label x={50} y={8} text={nums.s} vbW={100} vbH={100} fontSize={9} /> : null;
            })()}
        </View>
    );

    if (shape === 'right triangle' || shape === 'right-triangle' || shape === 'righttriangle') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
                <Polygon points="20,80 80,80 20,20" {...strokeProps} />
                {/* right-angle marker */}
                <Line x1="30" y1="80" x2="30" y2="70" stroke="#3a3563" strokeWidth={3} />
                <Line x1="30" y1="70" x2="20" y2="70" stroke="#3a3563" strokeWidth={3} />
            </Svg>
            {/* right triangle letters: a, b (legs) and c (hypotenuse) */}
            <Label x={45} y={86} text="a" vbW={100} vbH={100} fontSize={8} />
            <Label x={30} y={50} text="b" vbW={100} vbH={100} fontSize={8} />
            <Label x={70} y={45} text="c" vbW={100} vbH={100} fontSize={8} />
            {card.type === 'word' && (() => {
                const nums = extractShapeNumbers(card as any);
                return (
                    <>
                        {nums.a ? <Label x={45} y={96} text={nums.a} vbW={100} vbH={100} fontSize={8} /> : null}
                        {nums.b ? <Label x={20} y={50} text={nums.b} vbW={100} vbH={100} fontSize={8} /> : null}
                        {nums.c ? <Label x={80} y={45} text={nums.c} vbW={100} vbH={100} fontSize={8} /> : null}
                    </>
                );
            })()}
        </View>
    );
    if (shape === 'parallelogram') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
                <Polygon points="20,30 80,30 60,80 0,80" {...strokeProps} />
            </Svg>
            {/* letters for parallelogram: base and height */}
            <Label x={50} y={86} text="b" vbW={100} vbH={100} fontSize={9} />
            <Label x={30} y={50} text="h" vbW={100} vbH={100} fontSize={8} />
        </View>
    );
    if (shape === 'trapezoid') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
                <Polygon points="30,30 70,30 90,80 10,80" {...strokeProps} />
            </Svg>
            {/* letters for trapezoid: b1, b2, h */}
            <Label x={36} y={28} text="b₁" vbW={100} vbH={100} fontSize={8} />
            <Label x={64} y={28} text="b₂" vbW={100} vbH={100} fontSize={8} />
            <Label x={50} y={70} text="h" vbW={100} vbH={100} fontSize={8} />
        </View>
    );
    if (shape === 'rhombus' || shape === 'diamond') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
                <Polygon points="50,15 85,50 50,85 15,50" {...strokeProps} />
            </Svg>
            {/* letters for rhombus: diagonals d1, d2 */}
            <Label x={50} y={30} text="d₁" vbW={100} vbH={100} fontSize={8} />
            <Label x={30} y={50} text="d₂" vbW={100} vbH={100} fontSize={8} />
        </View>
    );
    if (shape === 'pentagon') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
                <Polygon points="50,10 85,35 70,80 30,80 15,35" {...strokeProps} />
            </Svg>
            {/* show side letter for regular pentagon */}
            <Label x={50} y={30} text="s" vbW={100} vbH={100} fontSize={8} />
        </View>
    );
    if (shape === 'hexagon') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
                <Polygon points="50,10 80,25 80,65 50,90 20,65 20,25" {...strokeProps} />
            </Svg>
            {/* show side letter for regular hexagon */}
            <Label x={50} y={30} text="s" vbW={100} vbH={100} fontSize={8} />
        </View>
    );
    if (shape === 'ellipse' || shape === 'oval') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
                <Ellipse cx="50" cy="50" rx="35" ry="23" {...strokeProps} />
            </Svg>
            {/* show ellipse axes letters */}
            <Label x={50} y={18} text="a" vbW={100} vbH={100} fontSize={8} />
            <Label x={35} y={50} text="b" vbW={100} vbH={100} fontSize={8} />
        </View>
    );
    if (shape === 'cylinder') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 120">
                <Ellipse cx="60" cy="25" rx="28" ry="10" {...strokeProps} />
                <Rect x="32" y="25" width="56" height="60" {...strokeProps} />
                <Ellipse cx="60" cy="85" rx="28" ry="10" strokeDasharray="2,2" stroke="#3a3563" fill="none" />
            </Svg>
            {/* labels: radius and height only */}
            <Label x={86} y={40} text="h" vbW={100} vbH={120} fontSize={8} />
            <Label x={40} y={22} text="r" vbW={100} vbH={120} fontSize={8} />
            {card.type === 'word' && (() => {
                const nums = extractShapeNumbers(card as any);
                return (
                    <>
                        {nums.h ? <Label x={96} y={40} text={nums.h} vbW={100} vbH={120} fontSize={8} /> : null}
                        {nums.r ? <Label x={30} y={22} text={nums.r} vbW={100} vbH={120} fontSize={8} /> : null}
                    </>
                );
            })()}
        </View>
    );
    if (shape === 'kite') return (
        <View style={{ width: 160, height: 160, position: 'relative' }}>
            <Svg width={160} height={160} viewBox="0 0 100 100">
                <Polygon points="50,15 80,50 50,85 20,50" {...strokeProps} />
            </Svg>
            {/* letters for kite diagonals */}
            <Label x={50} y={30} text="d₁" vbW={100} vbH={100} fontSize={8} />
            <Label x={30} y={50} text="d₂" vbW={100} vbH={100} fontSize={8} />
        </View>
    );
    return null;
}

// export ShapePreview for unit tests
export { ShapePreview };

// re-export for compatibility
export const getShapeLabels = _getShapeLabels;

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
