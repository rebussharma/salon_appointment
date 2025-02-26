import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  styled
} from '@mui/material';
import { useEffect, useState } from 'react';
import { ClientInfo } from '../../utils/types';
import { ValidationError } from './BookingSystem';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_REGEX = /^(\+\d{1,3}[- ]?)?\d{10}$|^\d{3}[-.]?\d{3}[-.]?\d{4}$|^\(\d{3}\)\s?\d{3}[-.]?\d{4}$/;

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontSize: '0.9rem',
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.9rem',
  },
  '& .MuiFormHelperText-root': {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: 0,
    marginRight: 0
  }
}));

interface ClientInfoFormProps {
  clientInfo: ClientInfo;
  onClientInfoChange: (info: ClientInfo) => void;
  isExpanded: boolean;
  hasError?: boolean;
  errorStyle?: React.CSSProperties;
  submissionAttempted?: boolean;
}

export default function ClientInfoForm({ 
  clientInfo, 
  onClientInfoChange,
  isExpanded,
  hasError,
  errorStyle
}: ClientInfoFormProps) {
  const [touched, setTouched] = useState({
    name: false,
    emailId: false,
    phone: false
  });

  const getNameError = () => {
    if (!touched.name && !hasError) return '';
    if (!clientInfo.name.trim()) return 'Name is required';
    if (clientInfo.name.length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const getEmailError = () => {
    if (!touched.emailId && !hasError) return '';
    if (!clientInfo.emailId && !clientInfo.phone) return 'Either email or phone is required';
    if (clientInfo.emailId && !EMAIL_REGEX.test(clientInfo.emailId)) return 'Invalid email format';
    return '';
  };

  const getPhoneError = () => {
    if (!touched.phone && !hasError) return '';
    if (!clientInfo.phone && !clientInfo.emailId) return 'Either phone or email is required';
    if (clientInfo.phone && !PHONE_REGEX.test(clientInfo.phone)) return 'Invalid phone format';
    return '';
  };

  useEffect(() => {
    if (isExpanded || hasError) {
      setTouched({
        name: true,
        emailId: true,
        phone: true
      });
    }
  }, [isExpanded, hasError]);


  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <Card id="user-info" sx={errorStyle}>
      {hasError && <ValidationError />}      
      <CardHeader 
        title="Your Information" 
        subheader="Please provide your contact details"
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              required
              label="Name"
              value={clientInfo.name}
              error={!!getNameError()}
              helperText={
                <span>
                  {getNameError()}
                  <span>{clientInfo.name.length}/50</span>
                </span>
              }
              inputProps={{ 
                htmlInput:{
                  maxLength: 50,
                  'aria-label': 'name'
                }
              }}
              onBlur={() => handleBlur('name')}
              onChange={(e) => onClientInfoChange({ ...clientInfo, name: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Email"
              type="email"
              required={!clientInfo.phone}
              value={clientInfo.emailId}
              error={!!getEmailError()}
              helperText={
                <span>
                  {getEmailError()}
                  <span>{clientInfo.emailId?.length}/60</span>
                </span>
              }
              inputProps={{ 
                htmlInput : {
                  maxLength: 60,
                  'aria-label': 'email'
                }
              }}
              onBlur={() => handleBlur('emailId')}
              onChange={(e) => onClientInfoChange({ ...clientInfo, emailId: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Phone"
              required={!clientInfo.emailId}
              value={clientInfo.phone}
              error={!!getPhoneError()}
              type='number'
              helperText={
                <span>
                  {getPhoneError()}
                  <span>{clientInfo.phone?.length}/10</span>
                </span>
              }
              inputProps={{ 
                htmlInput : {
                  minLength: 10,
                  maxLength: 10,
                  'aria-label': 'phone'
                }
              }}
              onBlur={() => handleBlur('phone')}
              onChange={(e) => onClientInfoChange({ ...clientInfo, phone: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              multiline
              rows={4}
              label="Message to Artist (Optional)"
              value={clientInfo.message}
              helperText={
                <span>
                  <span></span>
                  <span>{clientInfo.message.length}/250</span>
                </span>
              }
              inputProps={{ 
                htmlInput : {
                  maxLength: 250,
                  'aria-label': 'message'
                }
              }}
              onChange={(e) => onClientInfoChange({ ...clientInfo, message: e.target.value })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}