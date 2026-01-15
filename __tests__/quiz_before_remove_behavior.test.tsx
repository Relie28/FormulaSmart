import React from 'react';
import renderer from 'react-test-renderer';
import Quiz from '../src/screens/Quiz';
import { Alert, TouchableOpacity, Button } from 'react-native';

describe('Quiz beforeRemove behavior', () => {
  let listeners: Record<string, Function> = {};
  const navigation: any = {
    addListener: jest.fn((name: string, cb: Function) => { listeners[name] = cb; return () => { delete listeners[name]; }; }),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    listeners = {};
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });
  afterEach(() => {
    (Alert.alert as jest.Mock).mockRestore();
  });

  it('does not prompt leave when quiz not started (index=0, score=0, asvab not active)', async () => {
    let tree: any;
    await renderer.act(async () => {
      tree = renderer.create(React.createElement(Quiz, { route: { params: { subjects: 'All' } }, navigation } as any));
    });

    expect(typeof listeners.beforeRemove).toBe('function');
    const e: any = { preventDefault: jest.fn(), data: { action: { type: 'GO_BACK' } } };
    await renderer.act(async () => { listeners.beforeRemove(e); });

    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('prompts leave when quiz in-progress (after submit) and prevents default', async () => {
    let tree: any;
    await renderer.act(async () => {
      tree = renderer.create(React.createElement(Quiz, { route: { params: { subjects: 'All' } }, navigation } as any));
    });

    // select a choice
    const touchables = tree.root.findAllByType(TouchableOpacity).filter((n: any) => n.props && n.props.style && !n.props.testID);
    expect(touchables.length).toBeGreaterThan(0);
    await renderer.act(async () => touchables[0].props.onPress());

    // press submit
    const submit = tree.root.find((n: any) => n.props && n.props.testID === 'submit-answer');
    expect(submit).toBeDefined();
    await renderer.act(async () => submit.props.onPress());

    // now beforeRemove should prevent and prompt
    const e: any = { preventDefault: jest.fn(), data: { action: { type: 'GO_BACK' } } };
    await renderer.act(async () => { listeners.beforeRemove(e); });

    expect(e.preventDefault).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
  });
});
