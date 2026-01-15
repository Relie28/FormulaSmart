import React from 'react';
import renderer from 'react-test-renderer';
import Quiz from '../src/screens/Quiz';
import { TouchableOpacity, Text } from 'react-native';

describe('Quiz submit flow (interaction)', () => {
  it('requires submit button press to reveal feedback after selecting a choice', async () => {
    let tree: any;
    await renderer.act(async () => {
      tree = renderer.create(React.createElement(Quiz, { route: { params: { subjects: 'All' } }, navigation: { addListener: () => () => {} } } as any));
    });

    // find choice buttons
    const choices = tree.root.findAllByType(TouchableOpacity).filter((n: any) => n.props.testID == null && n.props.style);
    expect(choices.length).toBeGreaterThan(0);

    // press a choice (should only select, not reveal feedback)
    await renderer.act(async () => choices[0].props.onPress());
    let texts = tree.root.findAllByType(Text).map((t: any) => t.children && t.children.join(''));
    expect(texts.some((t: any) => /Correct|Explanation/i.test(t))).toBeFalsy();

    // find submit button and press
    const submit = tree.root.find((n: any) => n.props && n.props.testID === 'submit-answer');
    expect(submit).toBeDefined();
    await renderer.act(async () => submit.props.onPress());

    texts = tree.root.findAllByType(Text).map((t: any) => t.children && t.children.join(''));
    expect(texts.some((t: any) => /Correct|Explanation/i.test(t))).toBeTruthy();
  });
});
