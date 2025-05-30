import { useState } from 'react';
import LocationSearch from './components/LocationSearch';
import ForecastViewer from './components/ForecastViewer';
import { Coordinates } from './types';

const App = () => {
  const [coords, setCoords] = useState<Coordinates | null>(null);

  return (
    <div className="app-container">
      <h1>Activity Forecast</h1>
      <LocationSearch onSelect={setCoords} />
      {coords && <ForecastViewer latitude={coords.latitude} longitude={coords.longitude} name={coords.name} country={coords.country} />}
    </div>
  );
};

export default App;