import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { Button, Form, Modal, Table, Container, Row, Col } from 'react-bootstrap';
import { Forecast } from '../models/Forecast';

const Forecasts: React.FC = () => {
    const [forecasts, setForecasts] = useState<Forecast[]>([]);
    const [newForecast, setNewForecast] = useState<Forecast>({ name: '', budgets: [], users: [] });
    const [selectedForecastId, setSelectedForecastId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        fetchForecasts();
    }, []);

    const fetchForecasts = async () => {
        try {
            const response = await axiosInstance.get<Forecast[]>('/forecasts');
            setForecasts(response.data);
        } catch (error) {
            console.error('Error fetching forecasts:', error);
        }
    };

    const handleCreateForecast = async () => {
        try {
            const { _id, ...forecastWithoutId } = newForecast;
            const response = await axiosInstance.post<Forecast>('/forecasts', forecastWithoutId);
            setForecasts([...forecasts, response.data]);
            setNewForecast({ name: '', budgets: [], users: [] });
            setIsModalOpen(false);
            fetchForecasts();
        } catch (error) {
            if ((error as any).response.data) {
                alert((error as any).response.data);
            } else {
                alert('Unknow error when crating Forecast.');
            }
        }
    };

    const handleUpdateForecast = async () => {
        if (!selectedForecastId) return;
        try {
            const response = await axiosInstance.put<Forecast>(`/forecasts/${selectedForecastId}`, newForecast);
            setForecasts(forecasts.map(forecast => (forecast._id === selectedForecastId ? response.data : forecast)));
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating forecast:', error);
        }
    };

    const handleDeleteForecast = async (id: string) => {
        try {
            await axiosInstance.delete(`/forecasts/${id}`);
            setForecasts(forecasts.filter(forecast => forecast._id !== id));
        } catch (error) {
            console.error('Error deleting forecast:', error);
        }
    };

    const openCreateModal = () => {
        setNewForecast({ name: '', budgets: [], users: [] });
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (forecast: Forecast) => {
        setNewForecast(forecast);
        setSelectedForecastId(forecast._id || null);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewForecast({ ...newForecast, [name]: value });
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h2 className="text-center">Forecasts</h2>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col className="text-end">
                    <Button variant="primary" onClick={openCreateModal}>Create Forecast</Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecasts.map(forecast => (
                                <tr key={forecast._id}>
                                    <td>{forecast.name}</td>
                                    <td>
                                        <Button variant="secondary" className="me-2" onClick={() => openEditModal(forecast)}>Edit</Button>
                                        <Button variant="danger" onClick={() => handleDeleteForecast(forecast._id!)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>

            <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Edit Forecast' : 'Create Forecast'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newForecast.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={isEditMode ? handleUpdateForecast : handleCreateForecast}>
                        {isEditMode ? 'Update' : 'Create'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Forecasts;