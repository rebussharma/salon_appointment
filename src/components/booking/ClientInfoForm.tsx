// src/components/booking/ClientInfoForm/ClientInfoForm.tsx
import {
  Clear as ClearIcon,
  Comment as CommentIcon,
  Email as EmailIcon,
  Help as HelpIcon,
  Person as PersonIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useState } from 'react';

import { ClientInfo } from '../../utils/types';
import { ValidationError } from '../common/ValidationError';

interface ClientInfoFormProps {
  clientInfo: ClientInfo;
  onClientInfoChange: (info: Partial<ClientInfo>) => void;
  validationErrors?: {
    name?: string;
    emailId?: string;
    phone?: string;
    message?: string;
  };
  // Add these for backward compatibility
  isExpanded?: boolean;
  hasError?: boolean;
  errorStyle?: React.CSSProperties;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  clientInfo,
  onClientInfoChange,
  validationErrors = {}
}) => {
  // Track field focus state for better UX
  const [focused, setFocused] = useState<Record<string, boolean>>({
    name: false,
    emailId: false,
    phone: false,
    message: false
  });

  // Track character counts
  const maxLengths = {
    name: 50,
    emailId: 60,
    phone: 15,
    message: 250
  };

  // Handle focus state
  const handleFocus = (field: string) => {
    setFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setFocused(prev => ({ ...prev, [field]: false }));
  };

  // Handle input changes
  const handleChange = (field: keyof ClientInfo, value: string) => {
    onClientInfoChange({ [field]: value });
  };

  // Handle clearing a field
  const handleClear = (field: keyof ClientInfo) => {
    onClientInfoChange({ [field]: '' });
    
    // Refocus the field after clearing
    const input = document.getElementById(`client-${field}`);
    if (input) {
      input.focus();
    }
  };

  // Check if a field has validation errors
  const hasError = (field: keyof typeof validationErrors): boolean => {
    return Boolean(validationErrors[field]);
  };

  // Get helper text for a field
  const getHelperText = (field: keyof typeof validationErrors, value: string, maxLength: number) => {
    if (validationErrors[field]) {
      return validationErrors[field];
    }
    
    if (focused[field]) {
      return `${value.length}/${maxLength}`;
    }
    
    return '';
  };

  return (
    <Card id="client-info">
      <CardHeader 
        title="Your Information" 
        subheader="Please provide your contact details"
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              id="client-name"
              fullWidth
              required
              label="Name"
              value={clientInfo.name}
              error={hasError('name')}
              helperText={getHelperText('name', clientInfo.name, maxLengths.name)}
              inputProps={{ 
                maxLength: maxLengths.name,
                'aria-label': 'name'
              }}
              onFocus={() => handleFocus('name')}
              onBlur={() => handleBlur('name')}
              onChange={(e) => handleChange('name', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: clientInfo.name && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear name"
                      onClick={() => handleClear('name')}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {hasError('name') && (
              <ValidationError message={validationErrors.name || "Name is required"} />
            )}
          </Grid>

          <Grid item xs={12}>
            <TextField
              id="client-emailId"
              fullWidth
              label="Email"
              type="email"
              required={!clientInfo.phone}
              value={clientInfo.emailId}
              error={hasError('emailId')}
              helperText={getHelperText('emailId', clientInfo.emailId, maxLengths.emailId)}
              inputProps={{ 
                maxLength: maxLengths.emailId,
                'aria-label': 'email'
              }}
              onFocus={() => handleFocus('emailId')}
              onBlur={() => handleBlur('emailId')}
              onChange={(e) => handleChange('emailId', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: clientInfo.emailId && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear email"
                      onClick={() => handleClear('emailId')}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {hasError('emailId') && (
              <ValidationError message={validationErrors.emailId || "Invalid email format"} />
            )}
          </Grid>

          <Grid item xs={12}>
            <TextField
              id="client-phone"
              fullWidth
              label="Phone"
              required={!clientInfo.emailId}
              value={clientInfo.phone}
              error={hasError('phone')}
              helperText={getHelperText('phone', clientInfo.phone, maxLengths.phone)}
              inputProps={{ 
                maxLength: maxLengths.phone,
                'aria-label': 'phone'
              }}
              onFocus={() => handleFocus('phone')}
              onBlur={() => handleBlur('phone')}
              onChange={(e) => handleChange('phone', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: clientInfo.phone && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear phone"
                      onClick={() => handleClear('phone')}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {hasError('phone') && (
              <ValidationError message={validationErrors.phone || "Invalid phone format"} />
            )}
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Message to Artist (Optional)
              </Typography>
              <Tooltip title="Include any special requests or information for your artist">
                <HelpIcon fontSize="small" color="action" />
              </Tooltip>
            </Box>
            <TextField
              id="client-message"
              fullWidth
              multiline
              rows={4}
              value={clientInfo.message}
              error={hasError('message')}
              helperText={getHelperText('message', clientInfo.message, maxLengths.message)}
              inputProps={{ 
                maxLength: maxLengths.message,
                'aria-label': 'message'
              }}
              onFocus={() => handleFocus('message')}
              onBlur={() => handleBlur('message')}
              onChange={(e) => handleChange('message', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <CommentIcon color="action" />
                  </InputAdornment>
                )
              }}
              placeholder="Any special requests or information for your appointment..."
              sx={{ 
                '& .MuiInputBase-root': { 
                  alignItems: 'flex-start',
                  paddingLeft: 1 
                }
              }}
            />
            {hasError('message') && (
              <ValidationError message={validationErrors.message || "Message is too long"} />
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Privacy Note:</strong> Your contact information will only be used for appointment confirmations and updates.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClientInfoForm;