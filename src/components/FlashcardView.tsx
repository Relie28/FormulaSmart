import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Rect, Polygon } from 'react-native-svg';
import type { Card } from '../data/cards';

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
  return null;
}

export default function FlashcardView({ card, onShowHint }: { card: Card; onShowHint?: () => void }) {
  const [showBack, setShowBack] = useState(false);

  return (
    <TouchableOpacity onPress={() => setShowBack((s) => !s)} style={styles.card}>
      {!showBack ? (
        <View style={styles.front}>
          <Text style={styles.prompt}>{card.prompt}</Text>
          <ShapePreview card={card} />
          {card.type === 'word' && (
            <TouchableOpacity onPress={onShowHint} style={styles.hintButton}>
              <Text style={{ color: '#fff' }}>Show hint</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.back}>
          <Text style={styles.answer}>{card.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  front: { alignItems: 'center' },
  back: { alignItems: 'center' },
  prompt: { fontSize: 18, marginBottom: 12, textAlign: 'center', maxWidth: 320 },
  answer: { fontSize: 18, color: '#3a3563', textAlign: 'center' },
  hintButton: { marginTop: 12, backgroundColor: '#3a3563', padding: 8, borderRadius: 6 }
});
