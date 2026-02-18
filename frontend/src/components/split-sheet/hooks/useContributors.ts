import { useState, useCallback } from 'react';
import { Contributor } from '../types';

type ContributorFieldValue = Contributor[keyof Contributor];

const createEmptyContributor = (): Contributor => ({
  legal_name: '',
  stage_name: undefined,
  role: 'writer',
  contribution: undefined,
  writer_share_percent: 0,
  publisher_share_percent: 0,
  pro_affiliation: undefined,
  ipi_number: undefined,
  publisher: undefined,
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

  const updateContributor = useCallback((index: number, field: keyof Contributor, value: ContributorFieldValue) => {
    setContributors(prev => {
      const updated = [...prev];
      
      // Safety check: ensure the contributor exists at the given index
      if (!updated[index]) {
        return prev;
      }
      
      if (field.includes('.')) {
        // Handle nested fields like 'publisher.company_name'
        const [parentField, childField] = field.split('.') as [keyof Contributor, string];
        const currentParentValue = updated[index][parentField];
        updated[index] = {
          ...updated[index],
          [parentField]: {
            ...(typeof currentParentValue === 'object' && currentParentValue !== null ? currentParentValue : {}),
            [childField]: value,
          },
        } as Contributor;
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value,
        } as Contributor;
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
