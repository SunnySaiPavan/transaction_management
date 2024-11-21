import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      formData: {
        amount: '',
        transaction_type: 'DEPOSIT',
        user: '',
      },
      userIdToFetch: '',
      error: null,
    };
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value,
      },
    });
  };

  handleFetchInputChange = (e) => {
    this.setState({ userIdToFetch: e.target.value });
  };

  createTransaction = (e) => {
    e.preventDefault();
    const { formData } = this.state;

    axios
      .post('http://localhost:5000/api/transactions', formData)
      .then((response) => {
        alert('Transaction Created: ' + JSON.stringify(response.data));
        this.setState({
          formData: {
            amount: '',
            transaction_type: 'DEPOSIT',
            user: '',
          },
        });
      })
      .catch((error) => {
        this.setState({ error: error.message });
        alert('Error: ' + error.message);
      });
  };

  fetchTransactions = () => {
    const { userIdToFetch } = this.state;

    if (!userIdToFetch) {
      alert('Please enter a User ID');
      return;
    }

    axios
      .get(`http://localhost:5000/api/transactions?user_id=${userIdToFetch}`)
      .then((response) => {
        this.setState({ transactions: response.data.transactions, error: null });
      })
      .catch((error) => {
        this.setState({ error: error.message });
        alert('Error: ' + error.message);
      });
  };

  render() {
    const { transactions, formData, userIdToFetch, error } = this.state;

    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Transaction Management</h1>

        <div>
          <h2>Create Transaction</h2>
          <form onSubmit={this.createTransaction}>
            <label>
              Amount: 
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={this.handleInputChange}
                required
              />
            </label>
            <br />
            <label>
              Type: 
              <select
                name="transaction_type"
                value={formData.transaction_type}
                onChange={this.handleInputChange}
              >
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAWAL">Withdrawal</option>
              </select>
            </label>
            <br />
            <label>
              User ID: 
              <input
                type="number"
                name="user"
                value={formData.user}
                onChange={this.handleInputChange}
                required
              />
            </label>
            <br />
            <button type="submit">Create Transaction</button>
          </form>
        </div>

        <div>
          <h2>Fetch Transactions</h2>
          <label>
            User ID: 
            <input
              type="number"
              value={userIdToFetch}
              onChange={this.handleFetchInputChange}
            />
          </label>
          <button onClick={this.fetchTransactions}>Fetch Transactions</button>
        </div>

        <div>
          <h2>Transaction List</h2>
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          {transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            transactions.map((txn) => (
              <div key={txn.transaction_id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                <p><b>Transaction ID:</b> {txn.transaction_id}</p>
                <p><b>Amount:</b> {txn.amount}</p>
                <p><b>Type:</b> {txn.transaction_type}</p>
                <p><b>Status:</b> {txn.status}</p>
                <p><b>Timestamp:</b> {txn.timestamp}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
}

export default App;
