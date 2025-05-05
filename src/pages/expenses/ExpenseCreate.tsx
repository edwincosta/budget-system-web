import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IExpense } from "budget-system-shared";
import expenseService from "../../services/expenseService";

const ExpenseCreate: React.FC = () => {
  const { budgetId } = useParams<{ budgetId: string }>();

  const [expense, setExpense] = useState<IExpense>({
    monthlyBudget: "",
    category: "",
    subcategory: "",
    type: "Betel",
    amount: 0,
    description: "",
    date: new Date(),
  });

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setExpense({
      ...expense,
      [name]: name === "amount" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await expenseService.createExpense(expense);

      if (response.success) {
        navigate(`/expenses/budgetId=${budgetId}`);
      } else {
        alert("Failed to create expense.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create expense.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Category:</label>
        {/* <input
          type="text"
          name="category"
          value={expense.category}
          onChange={handleChange}
          required
        /> */}
      </div>
      <div>
        <label>Subcategory:</label>
        {/* <input
          type="text"
          name="subcategory"
          value={expense.subcategory}
          onChange={handleChange}
          required
        /> */}
      </div>
      <div>
        <label>Amount:</label>
        <input
          type="number"
          name="amount"
          value={expense.amount}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <input
          type="text"
          name="description"
          value={expense.description}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={expense.date.toISOString().split("T")[0]}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Create Expense</button>
    </form>
  );
};

export default ExpenseCreate;
