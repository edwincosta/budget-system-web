import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<{ message: string } | null>(null);

  useEffect(() => {
    axiosInstance.get('/categories')
      .then(response => {
        setData(response.data as { message: string });
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);

  return (
    <div>
      <Container className="mt-5 pt-4">
        <h1>Dashboard</h1>
        {data ? <p>{data.message}</p> : <p>Loading...</p>}
      </Container>
    </div>
  );
};

export default Dashboard;