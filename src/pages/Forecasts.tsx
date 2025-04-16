import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { Button, Form, Modal, Table, Container, Row, Col } from 'react-bootstrap';
import { ApiResponse, IForecast } from 'budget-system-shared';
import { useNavigate } from 'react-router-dom';

const Forecasts: React.FC = () => {
    const [forecasts, setForecasts] = useState<IForecast[]>([]);
    const [newForecast, setNewForecast] = useState<IForecast>({ name: ''});
    const [selectedForecastId, setSelectedForecastId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchForecasts();
    }, []);

    const fetchForecasts = async () => {
        try {
            const response = await axiosInstance.get<ApiResponse<IForecast[]>>('/forecasts');
            if (response.data.success && response.data.data) {
                setForecasts(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch forecasts');
            }
        } catch (err) {
            alert(err);
            setError('An error occurred while fetching forecasts');
            console.error('Error fetching forecasts:', err);
        }
    };

    const handleCreateForecast = async () => {
        try {
            const { _id, ...forecastWithoutId } = newForecast;
            const response = await axiosInstance.post<ApiResponse<IForecast>>('/forecasts', forecastWithoutId);
            if (response.data.success && response.data.data) {
                setForecasts([...forecasts, response.data.data]);
                setNewForecast({ name: '' });
                setIsModalOpen(false);
                fetchForecasts();
            } else {
                alert(response.data.message || 'Failed to create forecast');
            }
        } catch (err) {
            console.error('Error creating forecast:', err);
            alert('An error occurred while creating the forecast');
        }
    };

    const handleUpdateForecast = async () => {
        if (!selectedForecastId) return;
        try {
            const response = await axiosInstance.put<ApiResponse<IForecast>>(
                `/forecasts/${selectedForecastId}`,
                newForecast
            );
            if (response.data.success && response.data.data) {
                const updatedForecast = response.data.data;
                setForecasts(
                    forecasts.map((forecast) =>
                        forecast._id === selectedForecastId ? updatedForecast : forecast
                    )
                );
                setIsModalOpen(false);
            } else {
                alert(response.data.message || 'Failed to update forecast');
            }
        } catch (err) {
            console.error('Error updating forecast:', err);
            alert('An error occurred while updating the forecast');
        }
    };

    const handleDeleteForecast = async (id: string) => {
        try {
            const response = await axiosInstance.delete<ApiResponse<null>>(`/forecasts/${id}`);
            if (response.data.success) {
                setForecasts(forecasts.filter((forecast) => forecast._id !== id));
            } else {
                alert(response.data.message || 'Failed to delete forecast');
            }
        } catch (err) {
            console.error('Error deleting forecast:', err);
            alert('An error occurred while deleting the forecast');
        }
    };

    const openCreateModal = () => {
        setNewForecast({ name: '' });
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (forecast: IForecast) => {
        setNewForecast(forecast);
        setSelectedForecastId(forecast._id || null);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewForecast({ ...newForecast, [name]: value });
    };

    const handleViewBudgets = (forecastId: string) => {
        navigate(`/budgets?forecastId=${forecastId}`);
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
                    <Button variant="primary" onClick={openCreateModal}>
                        Create Forecast
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    {error && <p className="text-danger">{error}</p>}
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecasts.map((forecast) => (
                                <tr key={forecast._id}>
                                    <td>{forecast.name}</td>
                                    <td>
                                        <Button
                                            variant="info"
                                            className="me-2"
                                            onClick={() => handleViewBudgets(forecast._id!)}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="me-2"
                                            onClick={() => openEditModal(forecast)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDeleteForecast(forecast._id!)}
                                        >
                                            Delete
                                        </Button>
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
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={isEditMode ? handleUpdateForecast : handleCreateForecast}
                    >
                        {isEditMode ? 'Update' : 'Create'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Forecasts;