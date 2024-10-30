import React, { useState } from 'react';
import { useCSVReader } from 'react-papaparse';

const RandomWinnerSelector = () => {
  const [csvData, setCsvData] = useState([]);
  const [winners, setWinners] = useState({});
  const [error, setError] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSpin, setCurrentSpin] = useState({});
  const { CSVReader } = useCSVReader();

  const handleCSVUpload = (results) => {
    const data = results.data.slice(1);
    setCsvData(data);
    setError('');
  };

  const downloadLocationWinners = (location, locationWinners) => {
    // Create CSV content
    const headers = ['Name', 'Number', 'Department', 'Location'];
    const csvContent = [
      headers.join(','),
      ...locationWinners.map(winner => 
        [
          winner[3], // Name
          winner[2], // Number
          winner[5], // Department
          winner[4]  // Location
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${location}_winners.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectWinners = () => {
    if (csvData.length === 0) {
      setError('Please upload a CSV file first.');
      return;
    }

    setIsSpinning(true);
    const locationGroups = {};
    csvData.forEach((row) => {
      const location = row[4];
      if (!locationGroups[location]) {
        locationGroups[location] = [];
      }
      locationGroups[location].push(row);
    });

    const spinDuration = 10000;
    const spinInterval = 500;

    const spinTimer = setInterval(() => {
      const randomSpin = {};
      Object.keys(locationGroups).forEach(location => {
        const randomIndex = Math.floor(Math.random() * locationGroups[location].length);
        randomSpin[location] = locationGroups[location][randomIndex];
      });
      setCurrentSpin(randomSpin);
    }, spinInterval);

    setTimeout(() => {
      clearInterval(spinTimer);
      setIsSpinning(false);

      const selectedWinners = {};
      const usedNumbers = new Set();

      Object.keys(locationGroups).forEach((location) => {
        const group = locationGroups[location];
        const shuffled = group.sort(() => 0.5 - Math.random());
        selectedWinners[location] = [];

        for (const entry of shuffled) {
          const userNumber = entry[2];
          if (!usedNumbers.has(userNumber) && selectedWinners[location].length < 20) {
            selectedWinners[location].push(entry);
            usedNumbers.add(userNumber);
          }
          if (selectedWinners[location].length === 20) break;
        }
      });

      setWinners(selectedWinners);
    }, spinDuration);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8 text-gray-800">Random Winner Selector</h1>
        
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Upload CSV</h2>
          <CSVReader
            onUploadAccepted={handleCSVUpload}
            config={{
              skipEmptyLines: true,
            }}
          >
            {({ getRootProps, acceptedFile }) => (
              <>
                <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer bg-gray-50 text-gray-600 hover:bg-gray-100 transition duration-300">
                  {acceptedFile ? acceptedFile.name : 'Drop CSV file here or click to upload.'}
                </div>
              </>
            )}
          </CSVReader>
        </div>

        <button
          onClick={selectWinners}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Select Winners
        </button>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {isSpinning && (
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Selecting Winners...</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(currentSpin).map(([location, winner]) => (
                <div key={location} className="bg-blue-100 p-4 rounded shadow">
                  <h3 className="text-lg font-semibold mb-2 text-blue-800">{location}</h3>
                  <p className="text-blue-600">{winner[3]} - {winner[2]}</p>
                  <p className="text-blue-500 mt-2 italic">{winner[5]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSpinning && Object.keys(winners).length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Winners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(winners).map(([location, locationWinners]) => (
                <div key={location} className="bg-green-100 p-4 rounded shadow">
                  <h3 className="text-xl font-semibold mb-2 text-green-800">
                    {location}
                    <button
                      onClick={() => downloadLocationWinners(location, locationWinners)}
                      className="ml-4 bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded transition duration-300"
                    >
                      Download CSV
                    </button>
                  </h3>
                  <ul className="space-y-2">
                    {locationWinners.map((winner, index) => (
                      <li key={index} className="border-b border-green-200 pb-2">
                        <p className="text-green-700"><strong>{winner[3]}</strong> - {winner[2]}</p>
                        <p className="text-green-600 mt-1 italic">{winner[5]}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomWinnerSelector;