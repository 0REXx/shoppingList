import { useState, useEffect } from 'react';

const useMockData = process.env.REACT_APP_USE_MOCK_DATA === 'true';

const useFetch = (fetchFunction, url = '') => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = useMockData
          ? [] // Можно подключить mockShoppingLists, если требуется
          : await fetchFunction(url);
        setData(response);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchFunction, url]);

  return { data, isLoading, error };
};

export default useFetch;

