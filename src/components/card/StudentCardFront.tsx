import React from 'react';
import { Student } from '../../types/student';
import { CardTemplate } from '../../types/template';
import { CanvasCardImage } from './CanvasCardImage';

interface StudentCardFrontProps {
  student?: Partial<Student>;
  template: CardTemplate;
  scale?: number;
  className?: string;
  showCuttingBorder?: boolean;
}

/**
 * Front side preview. Drawn by the same canvas renderer used for the PDF export,
 * so what you see on screen is exactly what gets printed.
 */
export const StudentCardFront: React.FC<StudentCardFrontProps> = (props) => (
  <CanvasCardImage side="front" {...props} />
);
