import React, { useState, useRef } from 'react';
import './JewelryCalculator.css';

const TOLA_TO_GRAM = 11.664;

const PURITY_OPTIONS = [
  { label: '24K (Pure Gold – 100%)', value: 24, pct: 1.0 },
  { label: '22K (91.6%)', value: 22, pct: 22 / 24 },
  { label: '18K (75%)', value: 18, pct: 18 / 24 },
  { label: 'Silver (Pure)', value: 0, pct: 1.0 },
];

const MAKING_TYPE_OPTIONS = [
  { label: 'Per Gram (Rs./g)', value: 'per_gram' },
  { label: 'Percentage of Metal Cost (%)', value: 'percentage' },
  { label: 'Flat Amount (Rs.)', value: 'flat' },
];

const defaultState = {
  metalType: 'gold',
  goldRatePerTola: '',
  silverRatePerTola: '',
  purity: 22,
  netWeight: '',
  grossWeight: '',
  wastagePct: 5,
  makingType: 'percentage',
  makingValue: '',
  stoneCost: '',
  hallmarkCharge: '',
  vatPct: 13,
  discountType: 'none',
  discountValue: '',
  oldGoldWeight: '',
  oldGoldRate: '',
};

const JewelryCalculator = () => {
  const [form, setForm] = useState({ ...defaultState });
  const [result, setResult] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceName, setInvoiceName] = useState('');
  const [currentItemName, setCurrentItemName] = useState('');
  const [errors, setErrors] = useState([]);
  const invoiceRef = useRef();

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  // Ensure no negatives; empty string is allowed
  const posNum = (val, fallback = 0) => Math.max(0, parseFloat(val) || fallback);

  const getBaseRate = () => {
    if (form.metalType === 'gold') {
      const rate24KPerGram = posNum(form.goldRatePerTola) / TOLA_TO_GRAM;
      const purityOption = PURITY_OPTIONS.find(p => p.value === form.purity);
      return rate24KPerGram * (purityOption ? purityOption.pct : 1);
    } else {
      return posNum(form.silverRatePerTola) / TOLA_TO_GRAM;
    }
  };

  const getValidationErrors = () => {
    const errs = [];
    if (form.metalType === 'gold') {
      if (form.goldRatePerTola === '' || parseFloat(form.goldRatePerTola) <= 0)
        errs.push('Gold rate per tola is required');
    } else {
      if (form.silverRatePerTola === '' || parseFloat(form.silverRatePerTola) <= 0)
        errs.push('Silver rate per tola is required');
    }
    if (form.netWeight === '' || parseFloat(form.netWeight) <= 0)
      errs.push('Net weight is required');
    if (form.makingValue === '' || parseFloat(form.makingValue) < 0)
      errs.push('Making charges (Jyala) value is required');
    if (form.vatPct === '' || parseFloat(form.vatPct) < 0)
      errs.push('VAT rate is required (enter 0 to disable)');
    return errs;
  };

  const calculate = () => {
    const errs = getValidationErrors();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    const adjustedRate = getBaseRate();
    const netWeight = posNum(form.netWeight);
    const wastageWeight = netWeight * (posNum(form.wastagePct) / 100);
    const totalWeight = netWeight + wastageWeight;

    const metalCost = adjustedRate * totalWeight;

    const makingVal = posNum(form.makingValue);
    let makingCharge = 0;
    if (form.makingType === 'per_gram') {
      makingCharge = makingVal * totalWeight;
    } else if (form.makingType === 'percentage') {
      makingCharge = (makingVal / 100) * metalCost;
    } else if (form.makingType === 'flat') {
      makingCharge = makingVal;
    }

    const stoneCost = posNum(form.stoneCost);
    const hallmarkCharge = posNum(form.hallmarkCharge);
    const subtotalBeforeVAT = metalCost + makingCharge + stoneCost + hallmarkCharge;
    const vatRate = posNum(form.vatPct) / 100;
    const vat = vatRate * subtotalBeforeVAT;
    let total = subtotalBeforeVAT + vat;

    // Old gold exchange deduction
    const oldGoldDeduction = posNum(form.oldGoldWeight) * (form.oldGoldRate !== '' ? posNum(form.oldGoldRate) : adjustedRate);
    if (posNum(form.oldGoldWeight) > 0) total = Math.max(0, total - oldGoldDeduction);

    // Discount
    let discountAmount = 0;
    if (form.discountType === 'amount') {
      discountAmount = posNum(form.discountValue);
    } else if (form.discountType === 'percentage') {
      discountAmount = total * (posNum(form.discountValue) / 100);
    }
    total = Math.max(0, total - discountAmount);

    const purityOpt = PURITY_OPTIONS.find(p => form.metalType === 'gold' ? p.value === form.purity : p.value === 0);
    const ratePerTola = form.metalType === 'gold' ? posNum(form.goldRatePerTola) : posNum(form.silverRatePerTola);

    setResult({
      ratePerTola,
      adjustedRate,
      purityLabel: form.metalType === 'silver' ? 'Silver (Pure)' : purityOpt?.label,
      netWeight,
      wastageWeight,
      totalWeight,
      metalCost,
      makingCharge,
      stoneCost,
      hallmarkCharge,
      vatPct: posNum(form.vatPct),
      subtotalBeforeVAT,
      vat,
      oldGoldDeduction: posNum(form.oldGoldWeight) > 0 ? oldGoldDeduction : 0,
      discountAmount,
      finalTotal: total,
      metalType: form.metalType,
    });
  };

  const addToInvoice = () => {
    if (!result) return;
    const label = currentItemName.trim() || `Item ${invoiceItems.length + 1}`;
    setInvoiceItems(prev => [...prev, { ...result, label }]);
    setCurrentItemName('');
    setResult(null);
    setForm({
      ...defaultState,
      goldRatePerTola: form.goldRatePerTola,
      silverRatePerTola: form.silverRatePerTola,
      vatPct: form.vatPct,
    });
  };

  const finalizeInvoice = () => {
    if (invoiceItems.length === 0) return;
    const bill = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      customerName: invoiceName.trim() || 'Walk-in Customer',
      items: invoiceItems,
      totalAmount: invoiceItems.reduce((s, i) => s + i.finalTotal, 0),
    };
    const existing = JSON.parse(localStorage.getItem('gyani_bill_history') || '[]');
    localStorage.setItem('gyani_bill_history', JSON.stringify([bill, ...existing]));
    setInvoiceItems([]);
    setInvoiceName('');
    alert(`Invoice saved to Bill History for ${bill.customerName}!`);
  };

  const removeInvoiceItem = (idx) => {
    setInvoiceItems(prev => prev.filter((_, i) => i !== idx));
  };

  const invoiceTotal = invoiceItems.reduce((sum, i) => sum + i.finalTotal, 0);

  const fmt = (n) => `Rs. ${Math.round(n).toLocaleString()}`;

  // Input helper: keeps empty when typing, blocks negatives
  const numInput = (field, placeholder, step = 'any', extraProps = {}) => (
    <input
      type="number"
      min="0"
      step={step}
      placeholder={placeholder}
      value={form[field]}
      onChange={e => {
        const val = e.target.value;
        if (val === '' || parseFloat(val) >= 0) set(field, val);
      }}
      {...extraProps}
    />
  );

  return (
    <div className="jewelry-calc">
      <div className="calc-header">
        <div className="calc-header-icon">₨</div>
        <div>
          <h2>Jewelry Pricing Calculator</h2>
          <p className="calc-subtitle">Nepal Gold &amp; Silver – Real Shop Pricing System</p>
        </div>
      </div>

      <div className="calc-grid">
        {/* LEFT FORM */}
        <div className="calc-form">

          {/* Metal Type */}
          <div className="calc-section">
            <h3 className="section-label">1. Metal Type &amp; Daily Rate</h3>
            <div className="metal-toggle">
              <button className={form.metalType === 'gold' ? 'active gold-btn' : ''} onClick={() => set('metalType', 'gold')}>
                🪙 Gold
              </button>
              <button className={form.metalType === 'silver' ? 'active silver-btn' : ''} onClick={() => set('metalType', 'silver')}>
                ⚪ Silver
              </button>
            </div>

            {form.metalType === 'gold' ? (
              <div className="input-group">
                <label>Gold Rate (per Tola)</label>
                <div className="input-prefix"><span>Rs.</span>
                  {numInput('goldRatePerTola', 'e.g. 150000', 'any')}
                </div>
                {form.goldRatePerTola !== '' && (
                  <p className="hint">≈ Rs. {Math.round(posNum(form.goldRatePerTola) / TOLA_TO_GRAM).toLocaleString()}/gram</p>
                )}
              </div>
            ) : (
              <div className="input-group">
                <label>Silver Rate (per Tola)</label>
                <div className="input-prefix"><span>Rs.</span>
                  {numInput('silverRatePerTola', 'e.g. 1800', 'any')}
                </div>
                {form.silverRatePerTola !== '' && (
                  <p className="hint">≈ Rs. {Math.round(posNum(form.silverRatePerTola) / TOLA_TO_GRAM).toLocaleString()}/gram</p>
                )}
              </div>
            )}
          </div>

          {/* Purity */}
          {form.metalType === 'gold' && (
            <div className="calc-section">
              <h3 className="section-label">2. Purity (Karat)</h3>
              <div className="purity-options">
                {PURITY_OPTIONS.filter(p => p.value !== 0).map(opt => (
                  <button key={opt.value}
                    className={`purity-btn ${form.purity === opt.value ? 'active' : ''}`}
                    onClick={() => set('purity', opt.value)}>
                    {opt.value}K
                    <span>{(opt.pct * 100).toFixed(1)}%</span>
                  </button>
                ))}
              </div>
              {form.goldRatePerTola !== '' && (
                <p className="hint adjusted-rate">
                  Adjusted Rate: Rs. {Math.round(getBaseRate()).toLocaleString()}/gram
                </p>
              )}
            </div>
          )}

          {/* Weight */}
          <div className="calc-section">
            <h3 className="section-label">3. Weight</h3>
            <div className="input-row two-col">
              <div className="input-group">
                <label>Net Weight (grams) *</label>
                <div className="input-prefix">
                  {numInput('netWeight', 'e.g. 10', '0.01')}
                  <span>g</span>
                </div>
              </div>
              <div className="input-group">
                <label>Gross Weight (grams)</label>
                <div className="input-prefix">
                  {numInput('grossWeight', 'with stones', '0.01')}
                  <span>g</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wastage */}
          <div className="calc-section">
            <h3 className="section-label">4. Wastage (Jhutti) — {form.wastagePct}%</h3>
            <input type="range" min="0" max="25" step="0.1" value={form.wastagePct}
              onChange={e => set('wastagePct', parseFloat(e.target.value))} className="slider" />
            <div className="slider-labels"><span>0%</span><span>25%</span></div>
            {form.netWeight !== '' && (
              <p className="hint">Wastage Weight: {(posNum(form.netWeight) * form.wastagePct / 100).toFixed(3)}g</p>
            )}
          </div>

          {/* Making Charges */}
          <div className="calc-section">
            <h3 className="section-label">5. Making Charges (Jyala)</h3>
            <div className="input-row two-col">
              <div className="input-group">
                <label>Type</label>
                <select value={form.makingType} onChange={e => set('makingType', e.target.value)}>
                  {MAKING_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>
                  {form.makingType === 'per_gram' ? 'Rate (Rs./gram)' : form.makingType === 'flat' ? 'Flat Amount (Rs.)' : 'Percentage (%)'}
                </label>
                <div className="input-prefix">
                  {(form.makingType === 'per_gram' || form.makingType === 'flat') ? <span>Rs.</span> : null}
                  {numInput('makingValue', form.makingType === 'percentage' ? 'e.g. 10' : 'e.g. 500', '0.1')}
                  {form.makingType === 'percentage' ? <span>%</span> : null}
                </div>
              </div>
            </div>
          </div>

          {/* VAT */}
          <div className="calc-section">
            <h3 className="section-label">6. VAT / Tax</h3>
            <div className="input-group">
              <label>VAT Rate</label>
              <div className="input-prefix">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="13"
                  value={form.vatPct}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    if (e.target.value === '' || (val >= 0 && val <= 100)) set('vatPct', e.target.value);
                  }}
                />
                <span>%</span>
              </div>
              <p className="hint">Nepal standard VAT is 13%. Set 0 to disable.</p>
            </div>
          </div>

          {/* Stone / Diamond */}
          <div className="calc-section">
            <h3 className="section-label">7. Stone / Diamond / Design Cost</h3>
            <div className="input-group">
              <label>Fixed Cost (Rs.)</label>
              <div className="input-prefix"><span>Rs.</span>
                {numInput('stoneCost', 'e.g. 5000')}
              </div>
            </div>
          </div>

          {/* Hallmark */}
          <div className="calc-section">
            <h3 className="section-label">8. Hallmark / Service Charges</h3>
            <div className="input-group">
              <label>Fixed Charges (Rs.)</label>
              <div className="input-prefix"><span>Rs.</span>
                {numInput('hallmarkCharge', 'e.g. 200')}
              </div>
            </div>
          </div>

          {/* Optional Features */}
          <div className="calc-section">
            <h3 className="section-label">9. Optional</h3>
            <div className="optional-grid">
              <div className="input-group">
                <label>Discount Type</label>
                <select value={form.discountType} onChange={e => set('discountType', e.target.value)}>
                  <option value="none">No Discount</option>
                  <option value="amount">Fixed Amount (Rs.)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              {form.discountType !== 'none' && (
                <div className="input-group">
                  <label>{form.discountType === 'amount' ? 'Amount (Rs.)' : 'Percentage (%)'}</label>
                  <div className="input-prefix">
                    {form.discountType === 'amount' ? <span>Rs.</span> : null}
                    {numInput('discountValue', 'e.g. 500')}
                    {form.discountType === 'percentage' ? <span>%</span> : null}
                  </div>
                </div>
              )}

              <div className="input-group">
                <label>Old Gold Weight (g)</label>
                <div className="input-prefix">
                  {numInput('oldGoldWeight', 'e.g. 5', '0.01')}
                  <span>g</span>
                </div>
              </div>
              <div className="input-group">
                <label>Old Gold Rate (Rs./g) <span className="optional-hint">(blank = current rate)</span></label>
                <div className="input-prefix"><span>Rs.</span>
                  {numInput('oldGoldRate', 'Current rate')}
                </div>
              </div>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="calc-errors">
              <strong>Please fill in the required fields:</strong>
              <ul>
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          <button
            className={`calc-btn ${errors.length > 0 ? 'calc-btn-disabled' : ''}`}
            onClick={calculate}
          >
            Calculate Final Price →
          </button>
        </div>

        {/* RIGHT RESULT */}
        <div className="calc-result-panel">
          {!result ? (
            <div className="calc-placeholder">
              <div className="placeholder-icon">🏷️</div>
              <p>Fill in the details and click <strong>"Calculate Final Price"</strong> to see the breakdown here.</p>
            </div>
          ) : (
            <div className="calc-result" ref={invoiceRef}>
              <div className="result-header">
                <h3>Price Breakdown</h3>
                <span className="metal-badge">{result.metalType === 'gold' ? '🪙 Gold' : '⚪ Silver'}</span>
              </div>

              <div className="result-rows">
                <div className="result-row">
                  <span>Market Rate (per tola)</span>
                  <strong>{fmt(result.ratePerTola)}</strong>
                </div>
                <div className="result-row">
                  <span>Adjusted Rate (per gram)</span>
                  <strong>{fmt(result.adjustedRate)}</strong>
                </div>
                <div className="result-row text-muted">
                  <span>Purity Applied</span>
                  <span>{result.purityLabel}</span>
                </div>
                <div className="result-divider" />

                <div className="result-row">
                  <span>Net Weight</span>
                  <strong>{result.netWeight.toFixed(3)}g</strong>
                </div>
                <div className="result-row text-muted">
                  <span>Wastage Weight</span>
                  <span>+{result.wastageWeight.toFixed(3)}g</span>
                </div>
                <div className="result-row text-muted">
                  <span>Total Billable Weight</span>
                  <span>{result.totalWeight.toFixed(3)}g</span>
                </div>
                <div className="result-divider" />

                <div className="result-row">
                  <span>Metal Cost</span>
                  <strong>{fmt(result.metalCost)}</strong>
                </div>
                <div className="result-row">
                  <span>Making Charges (Jyala)</span>
                  <strong>{fmt(result.makingCharge)}</strong>
                </div>
                {result.stoneCost > 0 && (
                  <div className="result-row">
                    <span>Stone / Diamond Cost</span>
                    <strong>{fmt(result.stoneCost)}</strong>
                  </div>
                )}
                {result.hallmarkCharge > 0 && (
                  <div className="result-row">
                    <span>Hallmark / Service</span>
                    <strong>{fmt(result.hallmarkCharge)}</strong>
                  </div>
                )}
                <div className="result-divider" />

                <div className="result-row subtotal-row">
                  <span>Subtotal</span>
                  <strong>{fmt(result.subtotalBeforeVAT)}</strong>
                </div>
                <div className="result-row tax-row">
                  <span>VAT ({result.vatPct}%)</span>
                  <strong>+{fmt(result.vat)}</strong>
                </div>

                {result.oldGoldDeduction > 0 && (
                  <div className="result-row deduct-row">
                    <span>Old Gold Exchange</span>
                    <strong>−{fmt(result.oldGoldDeduction)}</strong>
                  </div>
                )}
                {result.discountAmount > 0 && (
                  <div className="result-row deduct-row">
                    <span>Discount</span>
                    <strong>−{fmt(result.discountAmount)}</strong>
                  </div>
                )}
              </div>

              <div className="result-final">
                <span>FINAL PRICE</span>
                <strong>{fmt(result.finalTotal)}</strong>
              </div>

              <div className="item-name-row">
                <label>Item Name (for invoice)</label>
                <input
                  type="text"
                  placeholder="e.g. Gold Necklace, Ring, Bracelet..."
                  value={currentItemName}
                  onChange={e => setCurrentItemName(e.target.value)}
                  className="invoice-name-input"
                />
              </div>

              <div className="result-actions">
                <button className="btn-primary" onClick={addToInvoice}>
                  + Add to Invoice
                </button>
                <button className="btn-outline" onClick={() => { setResult(null); setCurrentItemName(''); }}>
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Multi-Item Invoice */}
          {invoiceItems.length > 0 && (
            <div className="invoice-section">
              <div className="invoice-name-row">
                <label>Customer Name</label>
                <input
                  type="text"
                  placeholder="Enter customer name..."
                  value={invoiceName}
                  onChange={e => setInvoiceName(e.target.value)}
                  className="invoice-name-input"
                />
              </div>

              <h3 className="invoice-title">📄 Invoice</h3>
              {invoiceName && <p className="invoice-customer">Bill To: <strong>{invoiceName}</strong></p>}

              {invoiceItems.map((item, idx) => (
                <div key={idx} className="invoice-item">
                  <div className="flex justify-between items-center">
                    <span className="font-serif">{item.label}</span>
                    <div className="flex items-center gap-4">
                      <strong>{fmt(item.finalTotal)}</strong>
                      <button className="delete-btn small" onClick={() => removeInvoiceItem(idx)}>✕</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray">{item.purityLabel} • {item.netWeight}g net</p>
                </div>
              ))}
              <div className="invoice-total">
                <span>Total Bill</span>
                <strong>{fmt(invoiceTotal)}</strong>
              </div>
              <div className="invoice-actions">
                <button className="btn-primary" onClick={finalizeInvoice}>
                  💾 Save to Bill History
                </button>
                <button className="btn-outline" onClick={() => {
                  if (window.confirm('Clear current invoice?')) {
                    setInvoiceItems([]);
                    setInvoiceName('');
                  }
                }}>
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JewelryCalculator;
