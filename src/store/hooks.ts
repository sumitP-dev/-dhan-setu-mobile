import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './store';

/** Use these instead of plain useDispatch/useSelector: they know the app's types. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
