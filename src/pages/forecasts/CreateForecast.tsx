import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, IForecast } from 'budget-system-shared';
import config from '../../config';

const CreateForecast: React.FC = () => {
    const navigate = useNavigate();

    const [forecast, setForecast] = useState<IForecast>({
        name: "",
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForecast({ ...forecast, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await axiosInstance.post<ApiResponse<IForecast>>(config.forecastBaseUrl, forecast);
            if (response.data.success) {
                setSuccess('Forecast created successfully!');
                setTimeout(() => navigate(`${config.forecastBaseUrl}`), 2000); // Redirect after 2 seconds
            } else {
                setError(response.data.message || 'Failed to create forecast.');
            }
        } catch (error) {
            console.error('Error creating forecast:', error);
            setError('An error occurred while creating the forecast.');
        }
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Create Forecast</h1>
                </Col>
            </Row>
            <Row>
                <Col md={{ span: 6, offset: 3 }}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Month</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={forecast.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Create
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateForecast;