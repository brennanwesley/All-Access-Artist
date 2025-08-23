import { useState, useCallback } from 'react';
import { Contributor } from '../types';

const createEmptyContributor = (): Contributor => ({
  legal_name: '',
  stage_name: '',
  role: 'writer',
  contribution: '',
  writer_share_percent: 0,
  publisher_share_percent: 0,
  contact: {
    email: '',
    phone: '',
    address: '',
  },
  pro_affiliation: '',
  ipi_number: '',
  publisher: {
    company_name: '',
    pro_affiliation: '',
    ipi_number: '',
    contact: {
      email: '',
      phone: '',
      address: '',
    },
  },
});

export const useContributors = (initialContributors: Contributor[] = []) => {
  const [contributors, setContributors] = useState<Contributor[]>(() => {
    if (initialContributors.length > 0) {
      return initialContributors;
    }
    // Start with 3 empty contributors as per requirements
    return [
      createEmptyContributor(),
      createEmptyContributor(),
      createEmptyContributor(),
    ];
  });

  const updateContributor = useCallback((index: number, field: keyof Contributor, value: any) => {
    setContributors(prev => {
      const updated = [...prev];
      if (field.includes('.')) {
        // Handle nested fields like 'contact.email'
        const [parentField, childField] = field.split('.') as [keyof Contributor, string];
        updated[index] = {
          ...updated[index],
          [parentField]: {
            ...updated[index][parentField] as any,
            [childField]: value,
          },
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      return updated;
    });
  }, []);

  const addContributor = useCallback(() => {
    setContributors(prev => {
      if (prev.length >= 20) return prev; // Max 20 contributors
      return [...prev, createEmptyContributor()];
    });
  }, []);

  const removeContributor = useCallback((index: number) => {
    setContributors(prev => {
      if (prev.length <= 1) return prev; // Keep at least 1 contributor
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const resetContributors = useCallback((newContributors?: Contributor[]) => {
    if (newContributors) {
      setContributors(newContributors);
    } else {
      setContributors([
        createEmptyContributor(),
        createEmptyContributor(),
        createEmptyContributor(),
      ]);
    }
  }, []);

  return {
    contributors,
    updateContributor,
    addContributor,
    removeContributor,
    resetContributors,
    canAddMore: contributors.length < 20,
    canRemove: contributors.length > 1,
  };
};
