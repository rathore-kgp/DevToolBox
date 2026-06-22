import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/slices/uiSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const isDark = useSelector(state => state.ui.theme === 'dark');

  const toggleTheme = useCallback(() => {
    const newTheme = isDark ? 'light' : 'dark';
    // Update DOM immediately (syncs with the inline script pattern)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
    dispatch(setTheme(newTheme));
  }, [isDark, dispatch]);

  return { isDark, toggleTheme };
};