import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import { patientsService } from '../services/patients';
import { queueService } from '../services/queue';

const PatientCheckInPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'details' | 'checkin'>('phone');
  const [phone, setPhone] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [checkInData, setCheckInData] = useState({
    priority: 'NORMAL',
    reason: '',
    notes: '',
  });

  const searchPatientMutation = useMutation({
    mutationFn: (phone: string) => patientsService.getByPhone(phone),
    onSuccess: (data) => {
      setPatient(data);
      setStep('checkin');
    },
    onError: () => {
      setStep('details');
      setFormData({ ...formData, phone });
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: (data: any) => patientsService.create(data),
    onSuccess: (data) => {
      setPatient(data);
      setStep('checkin');
      toast.success('Patient registered successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to register patient');
    },
  });

  const checkInMutation = useMutation({
    mutationFn: (data: any) => queueService.checkIn(data),
    onSuccess: (data) => {
      toast.success('Checked in successfully!');
      navigate(`/patient/${data.patientId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check in');
    },
  });

  const handlePhoneSubmit = () => {
    if (phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    searchPatientMutation.mutate(phone);
  };

  const handleRegisterSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    createPatientMutation.mutate(formData);
  };

  const handleCheckIn = () => {
    if (!checkInData.reason) {
      toast.error('Please provide a reason for visit');
      return;
    }
    checkInMutation.mutate({
      patientId: patient.id,
      ...checkInData,
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Patient Check-In
      </Typography>

      {step === 'phone' && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Enter Your Phone Number
            </Typography>
            <TextField
              fullWidth
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              margin="normal"
              autoFocus
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handlePhoneSubmit}
              disabled={searchPatientMutation.isPending}
              sx={{ mt: 3 }}
            >
              {searchPatientMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Continue'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'details' && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              New Patient Registration
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              We couldn't find your record. Please register as a new patient.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled
                />
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleRegisterSubmit}
              disabled={createPatientMutation.isPending}
              sx={{ mt: 3 }}
            >
              {createPatientMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Register & Continue'
              )}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => setStep('phone')}
              sx={{ mt: 1 }}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'checkin' && patient && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Welcome, {patient.firstName} {patient.lastName}!
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Please provide visit details to complete check-in.
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={checkInData.priority}
                label="Priority"
                onChange={(e) => setCheckInData({ ...checkInData, priority: e.target.value })}
              >
                <MenuItem value="EMERGENCY">🚨 Emergency</MenuItem>
                <MenuItem value="URGENT">⚠️ Urgent</MenuItem>
                <MenuItem value="APPOINTMENT">📅 Appointment</MenuItem>
                <MenuItem value="NORMAL">👤 Normal Walk-in</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              required
              label="Reason for Visit"
              value={checkInData.reason}
              onChange={(e) => setCheckInData({ ...checkInData, reason: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Additional Notes"
              value={checkInData.notes}
              onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleCheckIn}
              disabled={checkInMutation.isPending}
              sx={{ mt: 3 }}
            >
              {checkInMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Complete Check-In'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PatientCheckInPage;

