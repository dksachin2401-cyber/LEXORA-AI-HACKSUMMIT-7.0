import React from 'react';

interface AiReviewBadgeProps {
  onAccept?: () => void;
  onEdit?: () => void;
  onReject?: () => void;
  statusText?: string;
}

export const AiReviewBadge: React.FC<AiReviewBadgeProps> = () => {
  // Banner bar disabled per user request
  return null;
};

export default AiReviewBadge;
