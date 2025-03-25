import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';

const DataComponent: React.FC = () => {
  const [data, setData] = useState<{ message: string } | null>(null);

  useEffect(() => {
    axiosInstance.get('/api/categories')
      .then(response => {
        setData(response.data as { message: string });
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);

  return (
    <div className="container">
      <h1>Data from API</h1>
      {data ? <p>{data.message}</p> : <p>Loading...</p>}
    </div>
  );
};

export default DataComponent;