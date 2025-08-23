import { useMemo } from 'react';
import { Contributor, PercentageValidation } from '../types';

export const usePercentageValidation = (contributors: Contributor[]): PercentageValidation => {
  return useMemo(() => {
    const writerTotal = contributors.reduce((sum, contributor) => {
      return sum + (contributor.writer_share_percent || 0);
    }, 0);

    const publisherTotal = contributors.reduce((sum, contributor) => {
      return sum + (contributor.publisher_share_percent || 0);
    }, 0);

    // Round to 2 decimal places to handle floating point precision
    const roundedWriterTotal = Math.round(writerTotal * 100) / 100;
    const roundedPublisherTotal = Math.round(publisherTotal * 100) / 100;

    const writerValid = roundedWriterTotal === 100;
    const publisherValid = roundedPublisherTotal === 100;

    return {
      writerValid,
      publisherValid,
      writerTotal: roundedWriterTotal,
      publisherTotal: roundedPublisherTotal,
      isValid: writerValid && publisherValid,
    };
  }, [contributors]);
};
