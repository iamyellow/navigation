import { requireNativeComponent, Platform } from 'react-native';

export default Platform.OS === "android" ? requireNativeComponent<any>('NVCollapsingBar', null) : () => null;
