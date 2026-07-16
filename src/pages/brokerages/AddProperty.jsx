import React from 'react';
import PropertyForm from './PropertyForm';

const AddProperty = ({ db, setDb, logAction, user, setView }) => {
  const handleCreate = (data, andCreateAnother) => {
    const record = {
      id:            Date.now(),
      ...data,
      purchasePrice: Number(data.purchasePrice) || 0,
      createdBy:     user?.name || user?.firstName || 'User',
      createdAt:     new Date().toISOString(),
    };
    setDb((prev) => ({ ...prev, properties: [record, ...(prev.properties || [])] }));
    logAction(`Added property "${record.location}"`, 'property', record.location);
    if (!andCreateAnother) setView('properties_manage');
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--zinc-900)' }}>Create Property</h1>
        <p style={{ color: 'var(--text-lt)', fontSize: 15, marginTop: 4 }}>
          Add a new land or flat as an internal purchase record.
        </p>
      </div>
      <PropertyForm onSubmit={handleCreate} submitLabel="Create" />
    </div>
  );
};

export default AddProperty;