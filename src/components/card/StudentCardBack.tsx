import React from 'react';
import { CardTemplate } from '../../types/template';
import { CanvasCardImage } from './CanvasCardImage';

interface StudentCardBackProps {
  template: CardTemplate;
  scale?: number;
  className?: string;
  showCuttingBorder?: boolean;
}

/**
 * Back side preview. Drawn by the same canvas renderer used for the PDF export,
 * so what you see on screen is exactly what gets printed.
 */
export const StudentCardBack: React.FC<StudentCardBackProps> = (props) => (
  <CanvasCardImage side="back" {...props} />
);
