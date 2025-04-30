import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Container, Row, Col, Alert } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, ICategory, ISubcategory } from 'budget-system-shared';

const ViewCategory: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();

    const [category, setCategory] = useState<ICategory | null>(null);
    const [subcategories, setSubcategories] = useState<ISubcategory[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<ICategory>>(`/categories/${categoryId}`);
                if (response.data.success && response.data.data) {
                    setCategory(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch budget details.');
                }
            } catch (error) {
                console.error('Error fetching budget details:', error);
                setError('An error occurred while fetching the budget details.');
            }
        };

        const fetchSubcategories = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<ISubcategory[]>>(
                    `/subcategories?categoryId=${categoryId}`
                );
                if (response.data.success) {
                    setSubcategories(response.data.data || []);
                } else {
                    setError(response.data.message || 'Failed to fetch subcategories.');
                }
            } catch (error) {
                console.error('Error fetching subcategories:', error);
                setError('An error occurred while fetching the subcategories.');
            }
        };

        fetchCategory();
        fetchSubcategories();
    }, [categoryId]);

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">View Category</h1>
                </Col>
            </Row>
            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger">{error}</Alert>
                    </Col>
                </Row>
            )}
            {category && (
                <>
                    <Row className="mb-4">
                        <Col md={{ span: 6, offset: 3 }}>
                            <Table bordered>
                                <tbody>
                                    <tr>
                                        <th>Name</th>
                                        <td>{category.name}</td>
                                    </tr>
                                    <tr>
                                        <th>Budget</th>
                                        <td>{category.categoryBudget}</td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>${category.isActive ? 'Active' : 'Inactive'}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <h2>Subategories</h2>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Budget</th>
                                        <th>Status</th>
                                        <th>Updated By</th>
                                        <th>Updated At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subcategories.map((subcategory) => (
                                        <tr key={subcategory._id}>
                                            <td>{subcategory.name}</td>
                                            <td>{subcategory.subcategoryBudget}</td>
                                            <td>{subcategory.isActive ? 'Active' : 'Inactive'}</td>
                                            <td>{subcategory.updatedBy || 'N/A'}</td>
                                            <td>{subcategory.updatedAt ? new Date(subcategory.updatedAt).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </>
            )}
            <Row className="mt-4">
                <Col className="text-center">
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        Back to Categories
                    </Button>
                </Col>
            </Row>
            
        </Container>
    );
};

export default ViewCategory;