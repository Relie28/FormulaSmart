import AsyncStorage from '@react-native-async-storage/async-storage';
import safeDispatch from '../src/utils/safeDispatch';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

describe('safeDispatch', () => {
  afterEach(() => jest.clearAllMocks());

  it('calls navigation.dispatch when action is provided', async () => {
    const nav = { dispatch: jest.fn() } as any;
    const action = { type: 'TEST' };
    await safeDispatch(nav, action);
    expect(nav.dispatch).toHaveBeenCalledWith(action);
  });

  it('does not throw when action is undefined', async () => {
    const nav = { dispatch: jest.fn() } as any;
    await expect(safeDispatch(nav, undefined)).resolves.toBeUndefined();
    expect(nav.dispatch).not.toHaveBeenCalled();
  });

  it('records attempt when action is undefined', async () => {
    const nav = { dispatch: jest.fn() } as any;
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[]');
    await safeDispatch(nav, undefined);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('flashcards_debug');
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('navigates to Home when action undefined and navigate available', async () => {
    const nav = { dispatch: jest.fn(), navigate: jest.fn(), goBack: jest.fn() } as any;
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[]');
    await safeDispatch(nav, undefined);
    expect(nav.goBack).toHaveBeenCalled();
  });

  it('persists an error when dispatch throws', async () => {
    const err = new Error('boom');
    const nav = { dispatch: jest.fn(() => { throw err; }) } as any;
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[]');
    await expect(safeDispatch(nav, { type: 'X' })).resolves.toBeUndefined();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('flashcards_debug');
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('sanitizes non-function callback on action before dispatch', async () => {
    const action: any = { type: 'TEST', callback: 'not-a-function' };
    const nav = { dispatch: jest.fn((a: any) => { a.callback(); }) } as any;
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[]');
    await expect(safeDispatch(nav, action)).resolves.toBeUndefined();
    expect(nav.dispatch).toHaveBeenCalled();
  });
});
