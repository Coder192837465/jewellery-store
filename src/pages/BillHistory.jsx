import React, { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './BillHistory.css';

const STORAGE_KEY = 'gyani_bill_history';

const BillHistory = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setBills(stored);
  }, []);

  const deleteBill = (id) => {
    if (!window.confirm('Delete this bill permanently?')) return;
    const updated = bills.filter(b => b.id !== id);
    setBills(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteAll = () => {
    if (!window.confirm('Delete ALL bill history? This cannot be undone.')) return;
    setBills([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const fmt = (n) => `Rs. ${Math.round(n).toLocaleString()}`;

  return (
    <div className="container section">
      <div className="bh-topbar">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="btn-outline bh-back">← Dashboard</Link>
          <Link to="/admin/calculator" className="btn-outline bh-back">₨ Calculator</Link>
        </div>
        {bills.length > 0 && (
          <button className="delete-btn bh-del-all" onClick={deleteAll}>
            🗑 Delete All History
          </button>
        )}
      </div>

      <div className="bh-header">
        <div className="bh-header-icon">📄</div>
        <div>
          <h1 className="font-serif">Bill History</h1>
          <p className="text-gray">{bills.length} saved invoice{bills.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="bh-empty">
          <p className="text-gray">No bills saved yet.</p>
          <Link to="/admin/calculator" className="btn-primary mt-4">Go to Calculator</Link>
        </div>
      ) : (
        <div className="bh-list">
          {bills.map(bill => (
            <div key={bill.id} className="bh-card">
              <div className="bh-card-header" onClick={() => setExpandedId(expandedId === bill.id ? null : bill.id)}>
                <div className="bh-card-info">
                  <h3 className="font-serif">{bill.customerName}</h3>
                  <p className="text-sm text-gray">{bill.date} · {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="bh-card-right">
                  <strong className="bh-total">{fmt(bill.totalAmount)}</strong>
                  <span className="bh-expand">{expandedId === bill.id ? '▲' : '▼'}</span>
                  <button
                    className="delete-btn"
                    onClick={e => { e.stopPropagation(); deleteBill(bill.id); }}
                    title="Delete this bill"
                  >
                    🗑
                  </button>
                </div>
              </div>

              {expandedId === bill.id && (
                <div className="bh-detail">
                  <table className="bh-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Purity</th>
                        <th>Net Wt.</th>
                        <th>Metal Cost</th>
                        <th>Jyala</th>
                        <th>VAT</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bill.items.map((item, idx) => (
                        <tr key={idx}>
                          <td><strong>{item.label}</strong></td>
                          <td>{item.purityLabel}</td>
                          <td>{item.netWeight}g</td>
                          <td>{fmt(item.metalCost)}</td>
                          <td>{fmt(item.makingCharge)}</td>
                          <td>{fmt(item.vat)}</td>
                          <td><strong>{fmt(item.finalTotal)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="6" className="text-right font-serif">Grand Total</td>
                        <td><strong>{fmt(bill.totalAmount)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillHistory;
