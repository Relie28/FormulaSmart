import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export function getDeviceSize() {
  const { width, height } = Dimensions.get('window');
  return { width, height };
}

export const deviceWidth = Dimensions.get('window').width;
export const deviceHeight = Dimensions.get('window').height;

export function useDeviceSize() {
  const [size, setSize] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => setSize(window);
    // Support both newer RN (addEventListener returns subscription) and older RN (removeEventListener)
    const d: any = Dimensions as any;
    const sub = d.addEventListener ? d.addEventListener('change', onChange) : null;
    return () => {
      if (sub && typeof sub.remove === 'function') sub.remove();
      else if (d.removeEventListener) d.removeEventListener('change', onChange);
    };
  }, []);

  return size;
}
