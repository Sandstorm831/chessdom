import {useDispatch, useSelector, useStore} from 'react-redux';
import { AppDispatch, AppStore, RootState } from './store';
import useIsTouchDevice from '../hooks/use-is-touch-device';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
export { useIsTouchDevice };