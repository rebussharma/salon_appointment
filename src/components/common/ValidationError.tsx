// src/components/common/ValidationError/ValidationError.tsx
import { Warning as WarningIcon } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import React from 'react';

interface ValidationErrorProps {
  message?: string;
  position?: 'topRight' | 'topLeft' | 'custom';
  top?: number | string;
  right?: number | string;
  left?: number | string;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({
  message = 'This field is required',
  position = 'topRight',
  top,
  right,
  left
}) => {
  // Default positioning based on position prop
  const getPositioning = () => {
    if (top !== undefined || right !== undefined || left !== undefined) {
      return { top, right, left };
    }

    switch (position) {
      case 'topRight':
        return { top: -8, right: -8 };
      case 'topLeft':
        return { top: -8, left: -8 };
      default:
        return { top: -8, right: -8 };
    }
  };

  return (
    <Tooltip title={message} arrow placement="top">
      <Box
        sx={{
          position: 'absolute',
          ...getPositioning(),
          color: '#d32f2f',
          backgroundColor: 'white',
          borderRadius: '50%',
          padding: '4px',
          zIndex: 1,
          display: 'flex',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }}
        role="alert"
        aria-label={message}
      >
        <WarningIcon color="error" fontSize="small" />
      </Box>
    </Tooltip>
  );
};