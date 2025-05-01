import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Container, Row, Col, Alert, Table, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { ApiResponse, ISubcategory, ICategory } from 'budget-system-shared';
import { FiEdit, FiPlus, FiTrash } from 'react-icons/fi';
import { FormatBrazilCurrency } from '../../components/Utils';


const EditCategory: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const emptyNewSubcategory: ISubcategory = {
        name: '',
        subcategoryBudget: 0,
        category: categoryId || '',
        isActive: true,
    };

    const navigate = useNavigate();

    const [category, setCategory] = useState<ICategory | null>(null);
    const [subcategories, setSubcategories] = useState<ISubcategory[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [newSubcategory, setNewSubcategory] = useState<ISubcategory>(emptyNewSubcategory);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Fetch the budget and related categories
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<ICategory>>(`/categories/${categoryId}`);
                if (response.data.success && response.data.data) {
                    setCategory(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch category.');
                }
            } catch (error) {
                console.error('Error fetching category:', error);
                setError('An error occurred while fetching the category.');
            }
        };

        const fetchSubcategories = async () => {
            try {
                const response = await axiosInstance.get<ApiResponse<ISubcategory[]>>(
                    `/subcategories?categoryId=${categoryId}`
                );
                if (response.data.success) {
                    setSubcategories(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching subcategories:', error);
                setError('An error occurred while fetching subcategories.');
            }
        };

        fetchCategory();
        fetchSubcategories();
    }, [categoryId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!category) return;
        const { name, value } = e.target;
        setCategory({ ...category, [name]: name === 'categoryBudget' ? parseFloat(value) : value });
    };

    // const handleChangeCategoryBudget = (value: number) => {
    //     if (!category) return;
    //     setCategory({ ...category, 'categoryBudget': value });
    // };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!category) return;

        if (category.categoryBudget <= 0) {
            setError('Budget must be a positive number.');
            return;
        }

        try {
            const response = await axiosInstance.put<ApiResponse<ICategory>>(`/categories/${categoryId}`, category);
            if (response.data.success) {
                setSuccess('Category updated successfully!');
            } else {
                setError(response.data.message || 'Failed to update category.');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            setError('An error occurred while updating the category.');
        }
    };

    const handleAddSubcategory = async () => {
        try {
            const response = await axiosInstance.post<ApiResponse<ISubcategory>>(`/subcategories/${categoryId}`, newSubcategory);
            if (response.data.success && response.data.data) {
                setSubcategories([...subcategories, response.data.data]);
                setSuccess('Subcategory added successfully!');
            } else {
                setError(response.data.message || 'Failed to add subcategory.');
            }
        } catch (error) {
            console.error('Error adding subcategory:', error);
            setError('An error occurred while adding the subcategory.');
        }
        setIsModalOpen(false);
    };

    const handleUpdateSubcategory = async () => {
        if (!selectedSubcategoryId) return;
        try {
            const response = await axiosInstance.put<ApiResponse<ISubcategory>>(
                `/subcategories/${selectedSubcategoryId}`,
                newSubcategory
            );
            if (response.data.success && response.data.data) {
                const updatedSubcategory = response.data.data;

                setSubcategories(
                    subcategories.map((subcategory) =>
                        subcategory._id === selectedSubcategoryId ? updatedSubcategory : subcategory
                    )
                );
            } else {
                setError(response.data.message || 'Failed to update subcategory.');
            }
        } catch (error) {
            console.error('Error updating subcategory:', error);
            setError('An error occurred while updating the subcategory.');
        }
        setIsModalOpen(false);
    };

    const handleRemoveSubcategory = async (subcategoryId: string) => {
        try {
            const response = await axiosInstance.delete<ApiResponse<null>>(
                `/subcategories/${subcategoryId}`
            );
            if (response.data.success) {
                setSubcategories(subcategories.filter((subcat) => subcat._id !== subcategoryId));
                setSuccess('Subcategory removed successfully!');
            } else {
                setError(response.data.message || 'Failed to remove subcategory.');
            }
        } catch (error) {
            console.error('Error removing subcategory:', error);
            setError('An error occurred while removing the subcategory.');
        }
    };

    const openCreateSubcategoryModal = () => {
        setNewSubcategory(emptyNewSubcategory);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openEditSubcategoryModal = (subcategory: ISubcategory) => {
        setNewSubcategory(subcategory);
        setSelectedSubcategoryId(subcategory._id || null);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleInputChangeSubcategory = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (!category) return;
        setNewSubcategory({ ...newSubcategory, [name]: name === 'subcategoryBudget' ? parseFloat(value) : value });
    };


    // const handleChangeSubcategoryBudget = (value: number) => {
    //     setNewSubcategory({ ...newSubcategory, 'subcategoryBudget': value });
    // };
    
    
    const setIsActive = async (isActive: boolean) => {
        category && setCategory({ ...category, isActive });
    }

    const setSubcategoryIsActive = async (isActive: boolean) => {
        newSubcategory && setNewSubcategory({ ...newSubcategory, isActive });
    }

    const totalBudget = subcategories.reduce((acc, subcat) => acc + subcat.subcategoryBudget, 0);

    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h1 className="text-center">Edit Category</h1>
                </Col>
            </Row>
            <Row>
                <Col md={{ span: 6, offset: 3 }}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    {category && (
                        <Form onSubmit={handleSave}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={category.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Budget</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="categoryBudget"
                                    value={category.categoryBudget}
                                    onChange={handleInputChange}
                                    required
                                    min={0}
                                />
                                {/* <MaskBrazilCurrencyInput
                                    name="categoryBudget"
                                    currency={category.categoryBudget}
                                    onChange={handleChangeCategoryBudget}
                                    required
                                    
                                /> */}
                            </Form.Group>
                            <Form.Group controlId='isActiveSwitch'>
                                <Form.Switch
                                    label="Is Active"
                                    checked={category.isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">
                                Save Changes
                            </Button>
                        </Form>
                    )}
                </Col>
            </Row>
            <Row className="my-4">
                <Col>
                    <h2>Subcategories</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th colSpan={6}>
                                    <div className='text-center'>
                                        <div>Subcategories</div>
                                        <div>
                                            {/* Botão de Editar */}
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={<Tooltip id={`tooltip-create`}>Add</Tooltip>}
                                            >
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => openCreateSubcategoryModal()}
                                                >
                                                    <FiPlus />
                                                </Button>
                                            </OverlayTrigger>
                                        </div>
                                    </div>
                                </th>
                            </tr>
                            <tr>
                                <th>Name</th>
                                <th>Budget</th>
                                <th>Status</th>
                                <th>Updated By</th>
                                <th>Updated At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subcategories.map((subcat) => (
                                <tr key={typeof subcat._id}>
                                    <td>{subcat.name}</td>
                                    <td><FormatBrazilCurrency currencyValue={subcat.subcategoryBudget}/></td>
                                    <td>{subcat.isActive ? 'Active' : 'Inactive'}</td>
                                    <td>{subcat.updatedBy || 'N/A'}</td>
                                    <td>{subcat.updatedAt ? new Date(subcat.updatedAt).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        {/* Botão de Editar */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-edit-${subcat._id}`}>Edit</Tooltip>}
                                        >
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => openEditSubcategoryModal(subcat)}
                                            >
                                                <FiEdit />
                                            </Button>
                                        </OverlayTrigger>

                                        {/* Botão de Excluir */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-delete-${subcat._id}`}>Delete</Tooltip>}
                                        >
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleRemoveSubcategory(subcat._id!)}
                                            >
                                                <FiTrash />
                                            </Button>
                                        </OverlayTrigger>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={1} className="text-end"><strong>Total:</strong></td>
                                <td colSpan={5}><FormatBrazilCurrency currencyValue={totalBudget}/></td>
                            </tr>
                        </tfoot>
                    </Table>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col className="text-center">
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        Back to Budgets
                    </Button>
                </Col>
            </Row>
            {/* Modal for creating/editing subcategory */}
            <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Edit Subcategory' : 'Create Subcategory'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newSubcategory.name}
                                onChange={handleInputChangeSubcategory}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Budget</Form.Label>
                            <Form.Control
                                    type="number"
                                    name="subcategoryBudget"
                                    value={newSubcategory.subcategoryBudget}
                                    onChange={handleInputChangeSubcategory}
                                    required
                                    min={0}
                                />
                            {/* <MaskBrazilCurrencyInput
                                key={newSubcategory._id}
                                name="subcategoryBudget"
                                value={newSubcategory.subcategoryBudget}
                                onChangeValue={handleChangeSubcategoryBudget}
                                required
                            /> */}
                        </Form.Group>
                        <Form.Group controlId='isActiveSwitch'>
                            <Form.Switch
                                label="Is Active"
                                checked={newSubcategory.isActive}
                                onChange={(e) => setSubcategoryIsActive(e.target.checked)}
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
                        onClick={isEditMode ? handleUpdateSubcategory : handleAddSubcategory}
                    >
                        {isEditMode ? 'Update' : 'Create'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default EditCategory;