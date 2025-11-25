import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CalendarToday,
  Person,
  CheckCircle,
  Schedule,
  LocalHospital,
} from '@mui/icons-material';
import { format, addDays, startOfDay, setHours, setMinutes } from 'date-fns';
import apiService from '../services/api';

interface TimeSlot {
  time: string;
  available: boolean;
  provider: string;
  providerId: string;
}

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  speciality?: string;
}

const appointmentTypes = [
  { value: 'checkup', label: 'Regular Checkup', duration: 30 },
  { value: 'cleaning', label: 'Dental Cleaning', duration: 45 },
  { value: 'filling', label: 'Filling', duration: 60 },
  { value: 'root_canal', label: 'Root Canal', duration: 90 },
  { value: 'extraction', label: 'Tooth Extraction', duration: 45 },
  { value: 'consultation', label: 'Consultation', duration: 30 },
  { value: 'emergency', label: 'Emergency', duration: 60 },
  { value: 'other', label: 'Other', duration: 30 },
];

const steps = ['Personal Info', 'Select Date & Time', 'Confirmation'];

export default function AppointmentBookingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);

  // Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Appointment Details
  const [appointmentType, setAppointmentType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Available slots and providers
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    loadProviders();
    generateAvailableDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const generateAvailableDates = () => {
    const dates: string[] = [];
    for (let i = 0; i < 14; i++) {
      const date = addDays(new Date(), i);
      const dayOfWeek = date.getDay();
      // Skip Sundays (0)
      if (dayOfWeek !== 0) {
        dates.push(format(date, 'yyyy-MM-dd'));
      }
    }
    setAvailableDates(dates);
  };

  const loadProviders = async () => {
    try {
      const response = await apiService.get('/providers');
      setProviders(response.data);
    } catch (err) {
      console.error('Failed to load providers:', err);
    }
  };

  const loadTimeSlots = async (date: string) => {
    try {
      setLoading(true);
      // Get existing appointments for the date
      const response = await apiService.get('/appointments', { params: { date } });
      const existingAppointments = response.data;

      // Generate time slots (9 AM to 5 PM, every 30 minutes)
      const slots: TimeSlot[] = [];
      const baseDate = new Date(date);

      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = setMinutes(setHours(baseDate, hour), minute);
          const timeString = format(slotTime, 'HH:mm');
          const isoString = format(slotTime, "yyyy-MM-dd'T'HH:mm:ss");

          // Check if slot is taken
          const isTaken = existingAppointments.some((apt: any) => {
            const aptTime = format(new Date(apt.scheduledTime), 'HH:mm');
            return aptTime === timeString && apt.status !== 'CANCELLED';
          });

          // Assign to provider (round-robin or first available)
          const provider = providers[slots.length % providers.length] || {
            id: 'default',
            firstName: 'Available',
            lastName: 'Dentist',
            speciality: 'General',
          };

          slots.push({
            time: isoString,
            available: !isTaken,
            provider: `Dr. ${provider.firstName} ${provider.lastName}`,
            providerId: provider.id,
          });
        }
      }

      setTimeSlots(slots);
    } catch (err) {
      console.error('Failed to load time slots:', err);
      setError('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate personal info
      if (!firstName || !lastName || !phone) {
        setError('Please fill in all required fields');
        return;
      }
      if (phone && !phone.match(/^\+?[1-9]\d{1,14}$/)) {
        setError('Please enter a valid phone number (e.g., +1234567890)');
        return;
      }
      if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setError('Please enter a valid email address');
        return;
      }
      setError('');
    }

    if (activeStep === 1) {
      // Validate appointment details
      if (!appointmentType || !selectedDate || !selectedTime) {
        setError('Please select appointment type, date, and time');
        return;
      }
      if (!reason) {
        setError('Please provide a reason for your appointment');
        return;
      }
      setError('');
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Create or find patient
      let patientId: string;

      try {
        // Try to create new patient
        const patientData: any = {
          firstName,
          lastName,
          phone,
          address: '',
        };

        // Only add email if provided
        if (email) {
          patientData.email = email;
        }

        // Only add dateOfBirth if provided and convert to ISO format
        if (dateOfBirth) {
          patientData.dateOfBirth = new Date(dateOfBirth + 'T00:00:00.000Z').toISOString();
        }

        const patientResponse = await apiService.post('/patients', patientData);
        patientId = patientResponse.data.id;
      } catch (err: any) {
        // If patient already exists, try to find them
        if (err.response?.status === 409 || err.response?.data?.message?.includes('already exists')) {
          const searchResponse = await apiService.get('/patients', {
            params: { phone },
          });
          if (searchResponse.data && searchResponse.data.length > 0) {
            patientId = searchResponse.data[0].id;
          } else {
            throw new Error('Failed to create or find patient');
          }
        } else {
          throw err;
        }
      }

      // Step 2: Find selected slot details
      const slot = timeSlots.find((s) => s.time === selectedTime);
      if (!slot) {
        throw new Error('Selected time slot not found');
      }

      // Step 3: Create appointment
      const appointmentDuration =
        appointmentTypes.find((t) => t.value === appointmentType)?.duration || 30;

      const appointmentResponse = await apiService.post('/appointments', {
        patientId,
        providerId: slot.providerId,
        scheduledTime: selectedTime,
        duration: appointmentDuration,
        reason: `${appointmentTypes.find((t) => t.value === appointmentType)?.label || appointmentType
          } - ${reason}`,
        notes: notes || undefined,
        status: 'SCHEDULED',
      });

      // Step 4: Try to send SMS confirmation (will only work if number is verified)
      try {
        await apiService.post('/sms/test', {
          to: phone,
          message: `Appointment Confirmed! Your ${appointmentTypes.find((t) => t.value === appointmentType)?.label
            } appointment is scheduled for ${format(new Date(selectedTime), 'MMM dd, yyyy')} at ${format(
              new Date(selectedTime),
              'h:mm a',
            )}. See you then!`,
        });
      } catch (smsErr) {
        console.log('SMS notification failed (might need verified number):', smsErr);
        // Don't fail the whole booking if SMS fails
      }

      setConfirmationData({
        appointmentId: appointmentResponse.data.id,
        patientName: `${firstName} ${lastName}`,
        appointmentType: appointmentTypes.find((t) => t.value === appointmentType)?.label,
        date: format(new Date(selectedTime), 'EEEE, MMMM dd, yyyy'),
        time: format(new Date(selectedTime), 'h:mm a'),
        provider: slot.provider,
        phone,
        email,
      });

      setSuccess(true);
      setActiveStep(2);
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setActiveStep(0);
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setDateOfBirth('');
    setAppointmentType('');
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
    setNotes('');
    setSuccess(false);
    setConfirmationData(null);
    setError('');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LocalHospital sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom>
            Book Your Appointment
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Schedule your dental appointment online - quick and easy!
          </Typography>
        </Box>

        {!success ? (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Step 1: Personal Information */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Person sx={{ mr: 1 }} />
                  Personal Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Phone Number"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      helperText="Include country code (e.g., +254746551520)"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email (Optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date of Birth (Optional)"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 2: Select Date & Time */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CalendarToday sx={{ mr: 1 }} />
                  Select Date & Time
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Appointment Type</InputLabel>
                      <Select
                        value={appointmentType}
                        label="Appointment Type"
                        onChange={(e) => setAppointmentType(e.target.value)}
                      >
                        {appointmentTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label} ({type.duration} min)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Select Date</InputLabel>
                      <Select
                        value={selectedDate}
                        label="Select Date"
                        onChange={(e) => setSelectedDate(e.target.value)}
                      >
                        {availableDates.map((date) => (
                          <MenuItem key={date} value={date}>
                            {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {selectedDate && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Available Time Slots:
                      </Typography>
                      {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                          {timeSlots.map((slot) => (
                            <Chip
                              key={slot.time}
                              label={format(new Date(slot.time), 'h:mm a')}
                              onClick={() => {
                                if (slot.available) {
                                  setSelectedTime(slot.time);
                                  setSelectedProvider(slot.providerId);
                                }
                              }}
                              color={selectedTime === slot.time ? 'primary' : 'default'}
                              disabled={!slot.available}
                              sx={{
                                cursor: slot.available ? 'pointer' : 'not-allowed',
                                opacity: slot.available ? 1 : 0.4,
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Reason for Appointment"
                      multiline
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Brief description of your dental concern..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Notes (Optional)"
                      multiline
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requirements or information..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 3: Review & Confirm */}
            {activeStep === 2 && !success && (
              <Box>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckCircle sx={{ mr: 1 }} />
                  Review Your Appointment
                </Typography>

                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Patient Name
                        </Typography>
                        <Typography variant="body1">
                          {firstName} {lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Phone Number
                        </Typography>
                        <Typography variant="body1">{phone}</Typography>
                      </Grid>
                      {email && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body1">{email}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Appointment Type
                        </Typography>
                        <Typography variant="body1">
                          {appointmentTypes.find((t) => t.value === appointmentType)?.label}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body1">
                          {format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Time
                        </Typography>
                        <Typography variant="body1">{format(new Date(selectedTime), 'h:mm a')}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Dentist
                        </Typography>
                        <Typography variant="body1">
                          {timeSlots.find((s) => s.time === selectedTime)?.provider || 'To be assigned'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Reason
                        </Typography>
                        <Typography variant="body1">{reason}</Typography>
                      </Grid>
                      {notes && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Notes
                          </Typography>
                          <Typography variant="body1">{notes}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    📱 You'll receive an SMS confirmation if your number is verified with our system.
                  </Typography>
                </Alert>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                >
                  {loading ? 'Booking...' : 'Confirm Appointment'}
                </Button>
              </Box>
            )}

            {/* Navigation Buttons */}
            {activeStep < 2 && (
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button disabled={activeStep === 0} onClick={handleBack} sx={{ flex: 1 }}>
                  Back
                </Button>
                <Button variant="contained" onClick={handleNext} sx={{ flex: 1 }}>
                  Next
                </Button>
              </Box>
            )}

            {activeStep === 2 && !success && (
              <Button fullWidth onClick={handleBack} sx={{ mt: 2 }}>
                Back to Edit
              </Button>
            )}
          </>
        ) : (
          // Success Screen
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              Appointment Booked Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your appointment has been confirmed.
            </Typography>

            {confirmationData && (
              <Card variant="outlined" sx={{ mt: 3, mb: 3, textAlign: 'left' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Appointment Details:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Confirmation ID
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {confirmationData.appointmentId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Patient
                      </Typography>
                      <Typography variant="body1">{confirmationData.patientName}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Appointment Type
                      </Typography>
                      <Typography variant="body1">{confirmationData.appointmentType}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography variant="body1">
                        {confirmationData.date} at {confirmationData.time}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Dentist
                      </Typography>
                      <Typography variant="body1">{confirmationData.provider}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                📱 A confirmation SMS has been sent to {confirmationData?.phone}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                💡 Please arrive 10 minutes before your appointment time.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button variant="outlined" fullWidth onClick={resetForm}>
                Book Another Appointment
              </Button>
              <Button variant="contained" fullWidth onClick={() => window.location.href = '/'}>
                Back to Home
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

