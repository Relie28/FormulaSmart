const React = require('react');
const renderer = require('react-test-renderer');
(async () => {
    const Quiz = require('../src/screens/Quiz').default;
    const navigation = { navigate: () => { }, addListener: () => () => { }, dispatch: () => { } };
    let tree;
    await renderer.act(async () => {
        tree = renderer.create(React.createElement(Quiz, { route: { params: { subjects: 'ASVAB' } }, navigation }));
    });
    const rn = require('react-native');
    const btns = tree.root.findAllByType(rn.Button);
    console.log('Buttons:', btns.map(b => b.props.title));
    const startBtn = btns.find(b => b.props.title === 'Start ASVAB Practice Test');
    console.log('startBtn found?', !!startBtn);
    await renderer.act(async () => {
        startBtn.props.onPress();
    });
    const touchables = tree.root.findAllByType(rn.TouchableOpacity);
    console.log('Touchable count after start:', touchables.length);
    const texts = touchables.map(t => t.findByType(rn.Text).children.join(''));
    console.log('choices:', texts);
    // advance timers
    await renderer.act(async () => new Promise((res) => setTimeout(res, 3000)));
    const touchables2 = tree.root.findAllByType(rn.TouchableOpacity);
    const texts2 = touchables2.map(t => t.findByType(rn.Text).children.join(''));
    console.log('choices after tick:', texts2);
})();