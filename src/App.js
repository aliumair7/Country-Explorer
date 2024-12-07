

import { useEffect, useState } from 'react';
import './App.css';

const CardComponent = ({ country }) => {
  const { name, population, flags, isLoaded } = country || {};
  
  return (
    <div className='card'>
      {!isLoaded ? (
        <div className='skeleton-loader'>
          <div className='skeleton-img'></div>
          <div className='skeleton-text'></div>
          <div className='skeleton-text'></div>
        </div>
      ) : (
        <>
          <img alt={`${name?.common} flag`} src={flags?.png} />
          <h3>{name?.common}</h3>
          <p>{population?.toLocaleString()}</p>
        </>
      )}
    </div>
  );
};

function App() {
  const [countries, setCountries] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadedCount, setLoadedCount] = useState(0);

  const fetchCountries = async (searchTerm) => {
    try {
      setLoading(true);
      setError('');
      const endpoint = searchTerm 
        ? `name/${searchTerm}` 
        : 'all';
      const response = await fetch(
        `https://restcountries.com/v3.1/${endpoint}?fields=name,flags,population`
      );
      
      if (!response.ok) {
        throw new Error('No countries found');
      }
      
      const data = await response.json();
      setCountries(data.map(country => ({ ...country, isLoaded: false })));
      setLoadedCount(0);
    } catch (error) {
      setError(error.message);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCountries(searchText);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchText]);

  useEffect(() => {
    if (countries.length && loadedCount < countries.length) {
      const timer = setTimeout(() => {
        setCountries(prev => 
          prev.map((country, index) => 
            index === loadedCount ? { ...country, isLoaded: true } : country
          )
        );
        setLoadedCount(prev => prev + 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countries.length, loadedCount]);

  return (
    <div className="App">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search countries..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <p className="error-message">{error}</p>}
      
      <div className="countries-grid">
        {countries.map((country, index) => (
          <CardComponent 
            key={country.name.common} 
            country={country}
          />
        ))}
        {!loading && !error && countries.length === 0 && (
          <p className="no-results">No countries found</p>
        )}
      </div>
    </div>
  );
}

export default App;
