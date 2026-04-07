import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import CustomerWizardModal from '../../components/admin/CustomerWizardModal';
import { useCreateCustomerWizard } from '../../hooks/useCreateCustomerWizard';

export default function CustomerPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const {
    form,
    setForm,
    wizardStep,
    showModal,
    openModal,
    closeModal,
    nextStep,
    prevStep,
    resetForm,
  } = useCreateCustomerWizard();

  const handleSave = (e) => {
    e?.preventDefault?.();
    setSaving(true);
    console.log('Customer form data:', form);

    // TODO: Wire to API endpoints
    // 1. Create customer record
    // 2. Create billing address using addressApi.createAddress()
    // 3. Create shipping address using addressApi.createAddress()

    setTimeout(() => {
      setSaving(false);
      alert('Customer created successfully!');
      closeModal();
    }, 1000);
  };

  return (
    <div className="content">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h4 mb-0">Customers</h1>
        <button
          className="btn btn-primary"
          onClick={openModal}
        >
          + Add Customer
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-3">Customer Management</h5>
          <div className="alert alert-info">
            <p className="mb-0">No customers yet. Click the "+ Add Customer" button to create a new customer.</p>
          </div>
        </div>
      </div>

      {/* Customer Creation Modal */}
      <AnimatePresence>
        {showModal && (
          <CustomerWizardModal
            wizardStep={wizardStep}
            form={form}
            setForm={setForm}
            onNext={nextStep}
            onPrev={prevStep}
            onSubmit={handleSave}
            onClose={closeModal}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
