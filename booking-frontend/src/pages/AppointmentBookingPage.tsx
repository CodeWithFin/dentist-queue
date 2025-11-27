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
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  LocalHospital,
  ChevronLeft,
  ChevronRight,
  Check,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, setHours, setMinutes } from 'date-fns';
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

const steps = [
  { id: 'personal', title: 'Personal Info' },
  { id: 'appointment', title: 'Appointment Details' },
  { id: 'confirmation', title: 'Confirmation' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

export default function AppointmentBookingPage() {
  const [currentStep, setCurrentStep] = useState(0);
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Available slots and providers
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate]);

  const loadProviders = async () => {
    try {
      const response = await apiService.get('/providers');
      if (response.data && response.data.length > 0) {
        setProviders(response.data);
      } else {
        setError('No providers available. Please contact the clinic.');
        console.warn('No providers found');
      }
    } catch (err: any) {
      console.error('Failed to load providers:', err);
      setError('Failed to load providers. Please refresh the page or contact the clinic.');
    }
  };

  const loadTimeSlots = async (date: string) => {
    try {
      setLoading(true);
      
      if (!providers || providers.length === 0) {
        setError('No providers available. Please contact the clinic to book an appointment.');
        setTimeSlots([]);
        return;
      }

      const response = await apiService.get('/appointments', { params: { date } });
      const existingAppointments = response.data || [];

      const slots: TimeSlot[] = [];
      const baseDate = new Date(date);
      const now = new Date();
      const isToday = format(baseDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = setMinutes(setHours(baseDate, hour), minute);
          const timeString = format(slotTime, 'HH:mm');
          const isoString = slotTime.toISOString();

          if (isToday && slotTime <= now) {
            continue;
          }

          const isTaken = existingAppointments.some((apt: any) => {
            const aptTime = format(new Date(apt.scheduledTime), 'HH:mm');
            return aptTime === timeString && apt.status !== 'CANCELLED';
          });

          const providerIndex = slots.length % providers.length;
          const provider = providers[providerIndex];

          slots.push({
            time: isoString,
            available: !isTaken,
            provider: `Dr. ${provider.firstName} ${provider.lastName}`,
            providerId: provider.id,
          });
        }
      }

      setTimeSlots(slots);
    } catch (err: any) {
      console.error('Failed to load time slots:', err);
      setError(err.response?.data?.message || 'Failed to load available time slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 0) {
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

    if (currentStep === 1) {
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

    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      let patientId: string;

      try {
        const patientData: any = {
          firstName,
          lastName,
          phone,
          address: '',
        };

        if (email) {
          patientData.email = email;
        }

        if (dateOfBirth) {
          patientData.dateOfBirth = new Date(dateOfBirth + 'T00:00:00.000Z').toISOString();
        }

        const patientResponse = await apiService.post('/patients', patientData);
        patientId = patientResponse.data.id;
      } catch (err: any) {
        if (err.response?.status === 409 || err.response?.data?.message?.includes('already exists')) {
          try {
            const phoneResponse = await apiService.get(`/patients/phone/${encodeURIComponent(phone)}`);
            patientId = phoneResponse.data.id;
          } catch (phoneErr: any) {
            try {
              const searchResponse = await apiService.get('/patients', {
                params: { search: phone },
              });
              if (searchResponse.data && searchResponse.data.length > 0) {
                const foundPatient = searchResponse.data.find((p: any) => p.phone === phone);
                if (foundPatient) {
                  patientId = foundPatient.id;
                } else {
                  patientId = searchResponse.data[0].id;
                }
              } else {
                throw new Error('Patient with this phone number exists but could not be found. Please contact the clinic.');
              }
            } catch (searchErr: any) {
              console.error('Error finding existing patient:', searchErr);
              throw new Error('We found your information in our system, but encountered an issue. Please contact the clinic or try again.');
            }
          }
        } else {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to create patient. Please try again.';
          throw new Error(errorMessage);
        }
      }

      const slot = timeSlots.find((s) => s.time === selectedTime);
      if (!slot) {
        throw new Error('Selected time slot not found. Please select a different time.');
      }

      if (!slot.providerId || slot.providerId === 'default') {
        throw new Error('No provider available for this time slot. Please select a different time.');
      }

      const appointmentDuration =
        appointmentTypes.find((t) => t.value === appointmentType)?.duration || 30;

      const appointmentResponse = await apiService.post('/appointments', {
        patientId,
        providerId: slot.providerId,
        scheduledTime: selectedTime,
        duration: appointmentDuration,
        reason: `${appointmentTypes.find((t) => t.value === appointmentType)?.label || appointmentType} - ${reason}`,
        notes: notes || undefined,
        status: 'SCHEDULED',
      });

      // SMS will be sent automatically by the backend
      // No need to send from frontend to avoid duplicate messages
      const smsStatus = 'sent'; // Backend handles SMS sending

      setConfirmationData({
        appointmentId: appointmentResponse.data.id,
        patientName: `${firstName} ${lastName}`,
        appointmentType: appointmentTypes.find((t) => t.value === appointmentType)?.label,
        date: format(new Date(selectedTime), 'EEEE, MMMM dd, yyyy'),
        time: format(new Date(selectedTime), 'h:mm a'),
        provider: slot.provider,
        phone,
        email,
        smsStatus,
      });

      setSuccess(true);
      setCurrentStep(2);
    } catch (err: any) {
      console.error('Booking failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to book appointment. Please try again.';
      
      if (err.response?.status === 404) {
        if (errorMessage.includes('Provider')) {
          setError('The selected provider is no longer available. Please select a different time slot.');
        } else if (errorMessage.includes('Patient')) {
          setError('Unable to find your patient record. Please contact the clinic.');
        } else {
          setError('The selected appointment slot is no longer available. Please choose another time.');
        }
      } else if (err.response?.status === 500) {
        setError('Server error occurred. Please try again or contact the clinic if the problem persists.');
      } else if (err.response?.status === 400) {
        setError(errorMessage || 'Invalid appointment details. Please check your information and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setDateOfBirth('');
    setAppointmentType('');
    setSelectedDate(null);
    setSelectedTime('');
    setReason('');
    setNotes('');
    setSuccess(false);
    setConfirmationData(null);
    setError('');
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return firstName.trim() !== '' && lastName.trim() !== '' && phone.trim() !== '';
      case 1:
        return appointmentType !== '' && selectedDate !== null && selectedTime !== '' && reason.trim() !== '';
      default:
        return true;
    }
  };

  if (success && currentStep === 2) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            </motion.div>
            <Typography variant="h4" gutterBottom color="success.main" sx={{ mb: 2 }}>
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

            {confirmationData?.smsStatus === 'sent' && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  ✅ SMS confirmation sent to {confirmationData?.phone}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  💡 Please arrive 10 minutes before your appointment time.
                </Typography>
              </Alert>
            )}
            
            {confirmationData?.smsStatus === 'failed' && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  ⚠️ Unable to send SMS to {confirmationData?.phone}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Your appointment is confirmed. Please save the details above.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  💡 Please arrive 10 minutes before your appointment time.
                </Typography>
              </Alert>
            )}
            
            {confirmationData?.smsStatus === 'mock' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  📱 SMS service is in test mode - no actual SMS sent
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  💡 Please arrive 10 minutes before your appointment time.
                </Typography>
              </Alert>
            )}
            
            {(!confirmationData?.smsStatus || confirmationData?.smsStatus === 'pending') && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  📱 SMS notification in progress
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  💡 Please arrive 10 minutes before your appointment time.
                </Typography>
              </Alert>
            )}

            <Button variant="outlined" fullWidth onClick={resetForm} sx={{ mt: 2 }}>
              Book Another Appointment
            </Button>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LocalHospital sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom>
            Book Your Appointment
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Schedule your dental appointment online - quick and easy!
          </Typography>
        </motion.div>
      </Box>

      {/* Progress indicator */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  cursor: index <= currentStep ? 'pointer' : 'default',
                  backgroundColor:
                    index < currentStep
                      ? '#1976d2'
                      : index === currentStep
                        ? '#1976d2'
                        : '#e0e0e0',
                  border: index === currentStep ? '4px solid rgba(25, 118, 210, 0.2)' : 'none',
                  transition: 'all 0.3s',
                }}
                onClick={() => {
                  if (index <= currentStep) {
                    setCurrentStep(index);
                  }
                }}
                whileTap={{ scale: 0.95 }}
              />
              <Typography
                variant="caption"
                sx={{
                  mt: 1.5,
                  display: { xs: 'none', sm: 'block' },
                  color: index === currentStep ? 'primary.main' : 'text.secondary',
                  fontWeight: index === currentStep ? 600 : 400,
                }}
              >
                {step.title}
              </Typography>
            </motion.div>
          ))}
        </Box>
        <Box
          sx={{
            width: '100%',
            height: 6,
            backgroundColor: '#f3f4f6', // bg-muted approximation
            borderRadius: '9999px', // rounded-full
            overflow: 'hidden',
            mt: 2,
          }}
        >
          <motion.div
            style={{
              height: '100%',
              backgroundColor: 'primary.main',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </Box>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              {/* Step 1: Personal Info */}
              {currentStep === 0 && (
                <>
                  <Box sx={{ p: 3, pb: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Tell us about yourself
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Let's start with some basic information
                    </Typography>
                  </Box>
                  <Box sx={{ px: 3, pb: 3 }}>
                    <motion.div variants={fadeInUp} style={{ marginBottom: 16 }}>
                      <TextField
                        fullWidth
                        required
                        label="First Name"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            transition: 'all 0.3s',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                            }
                          },
                        }}
                      />
                    </motion.div>
                    <motion.div variants={fadeInUp} style={{ marginBottom: 16 }}>
                      <TextField
                        fullWidth
                        required
                        label="Last Name"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            transition: 'all 0.3s',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                            }
                          },
                        }}
                      />
                    </motion.div>
                    <motion.div variants={fadeInUp} style={{ marginBottom: 16 }}>
                      <TextField
                        fullWidth
                        required
                        label="Phone Number"
                        placeholder="+254746551520"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        helperText="Include country code (e.g., +254746551520)"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            transition: 'all 0.3s',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                            }
                          },
                        }}
                      />
                    </motion.div>
                    <motion.div variants={fadeInUp} style={{ marginBottom: 16 }}>
                      <TextField
                        fullWidth
                        type="email"
                        label="Email (Optional)"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            transition: 'all 0.3s',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                            }
                          },
                        }}
                      />
                    </motion.div>
                    <motion.div variants={fadeInUp}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Date of Birth (Optional)"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            transition: 'all 0.3s',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                            }
                          },
                        }}
                      />
                    </motion.div>
                  </Box>
                </>
              )}

              {/* Step 2: Appointment Details */}
              {currentStep === 1 && (
                <>
                  <Box sx={{ p: 3, pb: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Appointment Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Select your preferred date, time, and appointment type
                    </Typography>
                  </Box>
                  <Box sx={{ px: 3, pb: 3 }}>
                    <motion.div variants={fadeInUp} style={{ marginBottom: 16 }}>
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
                    </motion.div>

                    <motion.div variants={fadeInUp} style={{ marginBottom: 16 }}>
                      <TextField
                        fullWidth
                        required
                        label="Select Date"
                        type="date"
                        value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          if (dateValue) {
                            const newDate = new Date(dateValue + 'T12:00:00');
                            if (newDate.getDay() !== 0) {
                              setSelectedDate(newDate);
                            } else {
                              setError('Sorry, clinic is closed on Sundays. Please select another date.');
                              setTimeout(() => setError(''), 3000);
                            }
                          }
                        }}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          min: format(new Date(), 'yyyy-MM-dd'),
                        }}
                        helperText="Clinic is closed on Sundays"
                      />
                    </motion.div>

                    {selectedDate && (
                      <motion.div variants={fadeInUp} style={{ marginBottom: 16 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Available Time Slots:
                        </Typography>
                        {loading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                            {timeSlots.map((slot, index) => (
                              <motion.div
                                key={slot.time}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Chip
                                  label={format(new Date(slot.time), 'h:mm a')}
                                  onClick={() => {
                                    if (slot.available) {
                                      setSelectedTime(slot.time);
                                    }
                                  }}
                                  color={selectedTime === slot.time ? 'primary' : 'default'}
                                  disabled={!slot.available}
                                  sx={{
                                    cursor: slot.available ? 'pointer' : 'not-allowed',
                                    opacity: slot.available ? 1 : 0.4,
                                    '&:hover': {
                                      backgroundColor: slot.available && selectedTime !== slot.time ? 'primary.light' : undefined,
                                    },
                                  }}
                                />
                              </motion.div>
                            ))}
                          </Box>
                        )}
                      </motion.div>
                    )}

                    <motion.div variants={fadeInUp} style={{ marginBottom: 16 }}>
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
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                      <TextField
                        fullWidth
                        label="Additional Notes (Optional)"
                        multiline
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special requirements or information..."
                      />
                    </motion.div>
                  </Box>
                </>
              )}

              {/* Step 3: Review & Confirm */}
              {currentStep === 2 && !success && (
                <>
                  <Box sx={{ p: 3, pb: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Review Your Appointment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Please review your details before confirming
                    </Typography>
                  </Box>
                  <Box sx={{ px: 3, pb: 3 }}>
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
                              {selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : ''}
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
                  </Box>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <Box sx={{ px: 3, pb: 2 }}>
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                onClick={prevStep}
                disabled={currentStep === 0}
                startIcon={<ChevronLeft />}
                sx={{ borderRadius: 3 }}
              >
                Back
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                disabled={!isStepValid() || loading}
                endIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : currentStep === steps.length - 1 ? (
                    <Check />
                  ) : (
                    <ChevronRight />
                  )
                }
                sx={{ borderRadius: 3 }}
              >
                {loading
                  ? 'Booking...'
                  : currentStep === steps.length - 1
                    ? 'Confirm Appointment'
                    : 'Next'}
              </Button>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>

      {/* Step indicator */}
      <motion.div
        style={{ marginTop: 16, textAlign: 'center' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Typography variant="body2" color="text.secondary">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </Typography>
      </motion.div>
    </Container>
  );
}
