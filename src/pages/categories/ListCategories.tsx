import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiEye, FiEdit, FiTrash } from 'react-icons/fi'; // Importa os ícones
import { Button, Table, Alert, Container, Row, Col, OverlayTrigger, Tooltip, Form } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, ICategory } from 'budget-system-shared';
import config from '../../config';
import { FormatBrazilCurrency } from '../../components/Utils';

const ListCategories: React.FC = () => {
    const [searchParams] = useSearchParams();
    const forecastId = searchParams.get('forecastId') || '';
    const navigate = useNavigate();

    const [categories, setCategories] = useState<ICategory[]>([]);
    const [isActive, setIsActive] = useState<string>('All');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                let activeFilter = '';
                if (isActive === 'Active') {
                    activeFilter = '&isActive=true';
                } else if (isActive === 'Inactive') {
                    activeFilter = '&isActive=false';
                }

                const response = await axiosInstance.get<ApiResponse<ICategory[]>>(
                    `${config.categoryBaseUrl}?forecastId=${forecastId}${activeFilter}`
                );
                if (response.data.success && response.data.data) {
                    setCategories(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch categories.');
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('An error occurred while fetching the categories.');
            }
        };

        fetchCategories();
    }, [forecastId, isActive]);

    const handleDelete = async (id: string) => {
        setError(null);
        setSuccess(null);

        try {
            const response = await axiosInstance.delete<ApiResponse<null>>(`${config.categoryBaseUrl}/${id}`);
            if (response.data.success) {
                setSuccess('Category deleted successfully!');
                setCategories(categories.filter((category) => category._id !== id));
            } else {
                setError(response.data.message || 'Failed to delete category.');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            setError('An error occurred while deleting the category.');
        }
    };

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Categories</h1>
                </Col>
            </Row>
            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger">{error}</Alert>
                    </Col>
                </Row>
            )}
            {success && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="success">{success}</Alert>
                    </Col>
                </Row>
            )}
            <Row className="mb-4">
                <Col className="text-end">
                    <Button
                        variant="primary"
                        onClick={() => navigate(`${config.categoryBaseUrl}/create?forecastId=${forecastId}`)}
                    >
                        Create New Budget
                    </Button>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col>
                    <Form.Group controlId="isActiveFilter">
                        <Form.Label>Filter by Active Status</Form.Label>
                        <Form.Control
                            as="select"
                            value={isActive}
                            onChange={(e) => setIsActive(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Budget</th>
                                <th>Is Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category._id}>
                                    <td>{category.name}</td>
                                    <td><FormatBrazilCurrency currencyValue={category.categoryBudget} /></td>
                                    <td>{category.isActive ? "Yes" : "No"}</td>
                                    <td>
                                        {/* Botão de Visualizar */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-view-${category._id}`}>View</Tooltip>}
                                        >
                                            <Button
                                                variant="info"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => navigate(`${config.categoryBaseUrl}/${category._id}`)}
                                            >
                                                <FiEye />
                                            </Button>
                                        </OverlayTrigger>

                                        {/* Botão de Editar */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-edit-${category._id}`}>Edit</Tooltip>}
                                        >
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => navigate(`${config.categoryBaseUrl}/${category._id}/edit`)}
                                            >
                                                <FiEdit />
                                            </Button>
                                        </OverlayTrigger>

                                        {/* Botão de Excluir */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-delete-${category._id}`}>Delete</Tooltip>}
                                        >
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(category._id!)}
                                            >
                                                <FiTrash />
                                            </Button>
                                        </OverlayTrigger>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col className="text-center">
                    <Button variant="secondary" onClick={() => navigate(`${config.forecastBaseUrl}`)}>
                        Back to Forecasts
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default ListCategories;