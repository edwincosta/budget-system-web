import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { Button, Form, Modal, Table, Container, Row, Col } from 'react-bootstrap';
import { Forecast } from '../models/Forecast';
import { Budget } from '../models/Budget';

const Budgets: React.FC = () => {
    const emptyNewBudget: Budget = {
        type: 'Betel',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: 0,
        forecast: ''
    };

    const [forecasts, setForecasts] = useState<Forecast[]>([]);
    const [selectedForecastId, setSelectedForecastId] = useState<string | null>(null);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [newBudget, setNewBudget] = useState<Budget>(emptyNewBudget);
    const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        console.log(0);
        fetchForecasts();
    }, []);

    useEffect(() => {
        if (selectedForecastId) {
            fetchBudgets(selectedForecastId);
        }
    }, [selectedForecastId]);

    const fetchForecasts = async () => {
        try {
            const response = await axiosInstance.get<Forecast[]>('/forecasts');
            setForecasts(response.data);
        } catch (error) {
            console.error('Error fetching forecasts:', error);
        }
    };

    const fetchBudgets = async (forecastId: string) => {
        try {
            const response = await axiosInstance.get<Budget[]>(`/budgets?forecast=${forecastId}`);
            setBudgets(response.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        }
    };

    const handleCreateBudget = async () => {
        try {
            const response = await axiosInstance.post<Budget>('/budgets', { ...newBudget, forecast: selectedForecastId });
            setBudgets([...budgets, response.data]);
            setNewBudget(emptyNewBudget);
            setIsModalOpen(false);
            if (selectedForecastId) {
                fetchBudgets(selectedForecastId);
            }
        } catch (error) {
            if ((error as any).response.data) {
                alert((error as any).response.data);
            } else {
                alert('Unknown error when creating budget.');
            }
            console.error('Error creating budget:', error);
        }
    };

    const handleUpdateBudget = async () => {
        if (!selectedBudgetId) return;
        try {
            const response = await axiosInstance.put<Budget>(`/budgets/${selectedBudgetId}`, newBudget);
            setBudgets(budgets.map(budget => (budget._id === selectedBudgetId ? response.data : budget)));
            setIsModalOpen(false);
            if (selectedForecastId) {
                fetchBudgets(selectedForecastId);
            }
        } catch (error) {
            if ((error as any).response.data) {
                alert((error as any).response.data);
            } else {
                alert('Unknown error when updating budget.');
            }
            console.error('Error updating budget:', error);
        }
    };

    const handleDeleteBudget = async (id: string) => {
        try {
            await axiosInstance.delete(`/budgets/${id}`);
            setBudgets(budgets.filter(budget => budget._id !== id));
            if (selectedForecastId) {
                fetchBudgets(selectedForecastId);
            }
        } catch (error) {
            if ((error as any).response.data) {
                alert((error as any).response.data);
            } else {
                alert('Unknown error when deleting budget.');
            }
            console.error('Error deleting budget:', error);
        }
    };

    const handleDuplicateBudget = async (id: string) => {
        try {
            const response = await axiosInstance.post<Budget>(`/budgets/${id}/duplicate`);
            setBudgets([...budgets, response.data]);
            if (selectedForecastId) {
                fetchBudgets(selectedForecastId);
            }
        } catch (error) {
            if ((error as any).response.data) {
                alert((error as any).response.data);
            } else {
                alert('Unknown error when duplicating budget.');
            }
            console.error('Error duplicating budget:', error);
        }
    };

    const openCreateModal = () => {
        setNewBudget(emptyNewBudget);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (budget: Budget) => {
        setNewBudget(budget);
        setSelectedBudgetId(budget._id || null);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewBudget({ ...newBudget, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedForecastId = e.target.value;
        setBudgets([]);
        setSelectedForecastId(selectedForecastId);
    };

    const handleViewCategories = (budgetId: string) => {
        navigate(`/categories/${budgetId}`);
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Budgets</h1>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col>
                    <Form.Select
                        aria-label="Select Forecast"
                        onChange={handleSelectChange}
                        value={selectedForecastId || ''}
                    >
                        <option value="">Select Forecast</option>
                        {forecasts.map(forecast => (
                            <option key={forecast._id} value={forecast._id}>
                                {forecast.name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={openCreateModal} disabled={!selectedForecastId}>
                        Create Budget
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Month</th>
                                <th>Year</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map(budget => (
                                <tr key={budget._id}>
                                    <td>{budget.type}</td>
                                    <td>{budget.month}</td>
                                    <td>{budget.year}</td>
                                    <td>{budget.amount}</td>
                                    <td>
                                        <Button variant="secondary" className="me-2" onClick={() => openEditModal(budget)}>Edit</Button>
                                        <Button variant="danger" className="me-2" onClick={() => handleDeleteBudget(budget._id!)}>Delete</Button>
                                        <Button variant="info" className="me-2" onClick={() => handleDuplicateBudget(budget._id!)}>Duplicate</Button>
                                        <Button variant="primary" onClick={() => handleViewCategories(budget._id!)}>Categories</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>

            <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Edit Budget' : 'Create Budget'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                name="type"
                                value={newBudget.type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="Betel">Betel</option>
                                <option value="Pessoal">Pessoal</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Month</Form.Label>
                            <Form.Control
                                type="number"
                                name="month"
                                value={newBudget.month}
                                onChange={handleInputChange}
                                required
                                min="1"
                                max="12"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Year</Form.Label>
                            <Form.Control
                                type="number"
                                name="year"
                                value={newBudget.year}
                                onChange={handleInputChange}
                                required
                                min={new Date().getFullYear()}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                name="amount"
                                value={newBudget.amount}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={isEditMode ? handleUpdateBudget : handleCreateBudget}>
                        {isEditMode ? 'Update' : 'Create'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Budgets;