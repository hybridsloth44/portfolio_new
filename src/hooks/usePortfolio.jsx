import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { loadPortfolio } from '../services/portfolio';

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [state, setState] = useState({ catalog: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setState({ catalog: null, loading: true, error: null });
    loadPortfolio(controller.signal).then((catalog) => {
      setState({ catalog, loading: false, error: null });
    }).catch((error) => {
      if (error.name !== 'AbortError') setState({ catalog: null, loading: false, error: error.message });
    });
    return () => controller.abort();
  }, [attempt]);
  return <PortfolioContext.Provider value={{ ...state, retry }}>{children}</PortfolioContext.Provider>;
}

export const usePortfolio = () => useContext(PortfolioContext);
