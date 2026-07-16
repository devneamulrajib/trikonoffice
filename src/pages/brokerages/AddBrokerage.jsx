import React from 'react';
import BrokerageForm from './BrokerageForm';

const AddBrokerage = ({ db, setDb, logAction, user, setView }) => {
  const handleCreate = (data, andCreateAnother) => {
    const record = {
      id:        Date.now(),
      ...data,
      askingPrice: Number(data.askingPrice) || 0,
      createdBy: user?.name || user?.firstName || 'User',
      createdAt: new Date().toISOString(),
    };
    setDb((prev) => ({ ...prev, brokerages: [record, ...(prev.brokerages || [])] }));
    logAction(`Added brokerage listing "${record.location}"`, 'brokerage', record.location);
    if (!andCreateAnother) setView('brokerages_manage');
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--zinc-900)' }}>Create Brokerage</h1>
        <p style={{ color: 'var(--text-lt)', fontSize: 15, marginTop: 4 }}>
          Add a new property listing to the brokerage board.
        </p>
      </div>
      <BrokerageForm onSubmit={handleCreate} submitLabel="Create" />
    </div>
  );
};

export default AddBrokerage;