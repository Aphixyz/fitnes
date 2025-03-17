// components/profile/TrainerProfileManager.jsx
'use client'

import { useState } from 'react';
import TrainerProfileView from './TrainerProfileView';
import TrainerProfileEdit from './TrainerProfileEdit';

export default function TrainerProfileManager({ trainer }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTrainer, setUpdatedTrainer] = useState(trainer);
  
  function handleEditSuccess(updatedData) {
    setUpdatedTrainer(prevData => ({ ...prevData, ...updatedData }));
    setIsEditing(false);
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {isEditing ? (
        <TrainerProfileEdit 
          trainer={updatedTrainer} 
          onCancel={() => setIsEditing(false)}
          onSuccess={handleEditSuccess}
        />
      ) : (
        <TrainerProfileView 
          trainer={updatedTrainer} 
          onEdit={() => setIsEditing(true)} 
        />
      )}
    </div>
  );
}