import { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '../themes';

export const GRADIENT_PRESETS = {
  midnight: { label: 'Midnight', from: '#0f172a', to: '#020617' },
  ocean: { label: 'Ocean', from: '#0c4a6e', to: '#164e63' },
  sunset: { label: 'Sunset', from: '#7c2d12', to: '#581c87' },
  aurora: { label: 'Aurora', from: '#064e3b', to: '#1e1b4b' },
  forest: { label: 'Forest', from: '#14532d', to: '#1a2e05' },
  rose: { label: 'Rose', from: '#881337', to: '#4a044e' },
};

const ConfigContext = createContext(null);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tunet_theme');
        return (saved && themes[saved]) ? saved : 'dark';
      } catch (error) {
        console.error('Failed to read theme from localStorage:', error);
        return 'dark';
      }
    }
    return 'dark';
  });

  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('tunet_language') || 'nn';
    } catch (error) {
      console.error('Failed to read language from localStorage:', error);
      return 'nn';
    }
  });

  const [inactivityTimeout, setInactivityTimeout] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tunet_inactivity_timeout');
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!Number.isNaN(parsed)) return parsed;
        }
      } catch (error) {
        console.error('Failed to read inactivity timeout from localStorage:', error);
      }
    }
    return 60;
  });

  const [bgMode, setBgMode] = useState(() => {
    try {
      const saved = localStorage.getItem('tunet_bg_mode');
      return saved && ['theme', 'solid', 'gradient', 'custom'].includes(saved) ? saved : 'theme';
    } catch { return 'theme'; }
  });

  const [bgColor, setBgColor] = useState(() => {
    try { return localStorage.getItem('tunet_bg_color') || '#0f172a'; }
    catch { return '#0f172a'; }
  });

  const [bgGradient, setBgGradient] = useState(() => {
    try {
      const saved = localStorage.getItem('tunet_bg_gradient');
      return saved && GRADIENT_PRESETS[saved] ? saved : 'midnight';
    } catch { return 'midnight'; }
  });

  const [bgImage, setBgImage] = useState(() => {
    try { return localStorage.getItem('tunet_bg_image') || ''; }
    catch { return ''; }
  });


  const [config, setConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return {
          url: localStorage.getItem('ha_url') || '',
          fallbackUrl: localStorage.getItem('ha_fallback_url') || '',
          token: localStorage.getItem('ha_token') || ''
        };
      } catch (error) {
        console.error('Failed to read config from localStorage:', error);
        return { url: '', fallbackUrl: '', token: '' };
      }
    }
    return { url: '', fallbackUrl: '', token: '' };
  });

  // Apply theme to DOM
  useEffect(() => {
    const themeKey = themes[currentTheme] ? currentTheme : 'dark';
    const theme = themes[themeKey].colors;
    for (const key in theme) {
      document.documentElement.style.setProperty(key, theme[key]);
    }
    document.documentElement.dataset.theme = themeKey;
    document.documentElement.style.colorScheme = themeKey === 'light' ? 'light' : 'dark';
    
    let metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = theme['--bg-primary'];
    
    try {
      localStorage.setItem('tunet_theme', themeKey);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  }, [currentTheme]);

  // Apply background based on bgMode
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const themeKey = themes[currentTheme] ? currentTheme : 'dark';
    const theme = themes[themeKey].colors;

    // Clean up custom image background and inline overrides
    body.style.backgroundImage = '';
    body.style.backgroundSize = '';
    body.style.backgroundPosition = '';
    body.style.backgroundAttachment = '';
    
    // Clear inline variables that might mask theme variables
    root.style.removeProperty('--bg-primary');
    root.style.removeProperty('--bg-gradient-from');
    root.style.removeProperty('--bg-gradient-to');
    
    root.classList.remove('custom-bg-active');

    if (bgMode === 'solid') {
      root.style.setProperty('--bg-gradient-from', bgColor);
      root.style.setProperty('--bg-gradient-to', bgColor);
      root.style.setProperty('--bg-primary', bgColor);
      root.style.backgroundColor = bgColor;
      body.style.backgroundColor = bgColor;
    } else if (bgMode === 'gradient') {
      const preset = GRADIENT_PRESETS[bgGradient] || GRADIENT_PRESETS.midnight;
      root.style.setProperty('--bg-gradient-from', preset.from);
      root.style.setProperty('--bg-gradient-to', preset.to);
      root.style.setProperty('--bg-primary', preset.to);
      root.style.backgroundColor = preset.to;
      body.style.backgroundColor = preset.to;
    } else if (bgMode === 'custom' && bgImage) {
      root.style.backgroundColor = theme['--bg-primary'];
      body.style.backgroundColor = 'transparent';
      body.style.backgroundImage = `url("${bgImage}")`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundAttachment = 'fixed';
      root.classList.add('custom-bg-active');
      root.style.setProperty('--bg-primary', theme['--bg-primary']);
    } else {
      // 'theme' mode — let theme colors apply normally
      root.style.backgroundColor = theme['--bg-primary'];
      body.style.backgroundColor = theme['--bg-primary'];
    }
  }, [bgMode, bgColor, bgGradient, bgImage, currentTheme]);

  // Persist background settings
  useEffect(() => {
    try { localStorage.setItem('tunet_bg_mode', bgMode); } catch {}
  }, [bgMode]);
  useEffect(() => {
    try { localStorage.setItem('tunet_bg_color', bgColor); } catch {}
  }, [bgColor]);
  useEffect(() => {
    try { localStorage.setItem('tunet_bg_gradient', bgGradient); } catch {}
  }, [bgGradient]);
  useEffect(() => {
    try { localStorage.setItem('tunet_bg_image', bgImage); } catch {}
  }, [bgImage]);

  // Save language to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tunet_language', language);
    } catch (error) {
      console.error('Failed to save language to localStorage:', error);
    }
  }, [language]);


  const toggleTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setCurrentTheme(themeKeys[nextIndex]);
  };

  const value = {
    currentTheme,
    setCurrentTheme,
    toggleTheme,
    language,
    setLanguage,
    inactivityTimeout,
    setInactivityTimeout,
    bgMode,
    setBgMode,
    bgColor,
    setBgColor,
    bgGradient,
    setBgGradient,
    bgImage,
    setBgImage,
    config,
    setConfig,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
