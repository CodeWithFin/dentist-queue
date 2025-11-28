import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { Refresh, PersonAdd, CalendarToday } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueService } from '../services/queue';
import { roomsService } from '../services/rooms';
import { appointmentsService } from '../services/appointments';
import { socketService } from '../services/socket';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ReceptionDashboard = () => {
  const queryClient = useQueryClient();
  const [callPatientDialog, setCallPatientDialog] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState('');

  const { data: queueData, refetch: refetchQueue } = useQuery({
    queryKey: ['current-queue'],
    queryFn: () => queueService.getCurrentQueue(),
    refetchInterval: 5000,
  });

  const { data: stats } = useQuery({
    queryKey: ['queue-stats'],
    queryFn: () => queueService.getStats(),
    refetchInterval: 10000,
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsService.getAll(),
  });

  const { data: appointments, refetch: refetchAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsService.getAll({ status: 'SCHEDULED' }),
    refetchInterval: 10000,
  });

  const callPatientMutation = useMutation({
    mutationFn: ({ id, roomId }: { id: string; roomId: string }) =>
      queueService.callNext(id, roomId),
    onSuccess: () => {
      toast.success('Patient called successfully!');
      setCallPatientDialog(null);
      setSelectedRoom('');
      refetchQueue();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to call patient');
    },
  });

  const startServiceMutation = useMutation({
    mutationFn: (id: string) => queueService.startService(id),
    onSuccess: () => {
      toast.success('Service started!');
      refetchQueue();
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => queueService.complete(id),
    onSuccess: () => {
      toast.success('Service completed!');
      refetchQueue();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => queueService.remove(id),
    onSuccess: () => {
      toast.success('Patient removed from queue');
      refetchQueue();
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentsService.cancel(appointmentId),
    onSuccess: () => {
      toast.success('Appointment cancelled successfully');
      refetchAppointments();
      refetchQueue();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    },
  });

  const checkInAppointmentMutation = useMutation({
    mutationFn: ({ appointmentId, patientId, reason }: { appointmentId: string; patientId: string; reason: string }) =>
      queueService.checkInAppointment(appointmentId, patientId, reason),
    onSuccess: () => {
      toast.success('Appointment checked in! Patient added to queue with priority.');
      refetchQueue();
      refetchAppointments();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check in appointment');
    },
  });

  useEffect(() => {
    socketService.connect();
    socketService.joinReceptionRoom();

    const handleQueueUpdate = (data: any) => {
      console.log('Queue updated:', data);
      refetchQueue();
      refetchAppointments();
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] });
    };

    socketService.onQueueUpdate(handleQueueUpdate);

    return () => {
      socketService.offQueueUpdate(handleQueueUpdate);
      socketService.disconnect();
    };
  }, [queryClient, refetchQueue]);

  const handleCallPatient = (entry: any) => {
    setCallPatientDialog(entry);
  };

  const handleConfirmCall = () => {
    if (!selectedRoom) {
      toast.error('Please select a room');
      return;
    }
    callPatientMutation.mutate({
      id: callPatientDialog.id,
      roomId: selectedRoom,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY':
        return 'error';
      case 'URGENT':
        return 'warning';
      case 'APPOINTMENT':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING':
        return 'warning';
      case 'CALLED':
        return 'info';
      case 'IN_SERVICE':
        return 'success';
      default:
        return 'default';
    }
  };

  const waitingQueue = queueData?.filter((q) => q.status === 'WAITING') || [];
  const inProgress = queueData?.filter((q) => ['CALLED', 'IN_SERVICE'].includes(q.status)) || [];

  // Filter appointments to only show today onwards (exclude past appointments)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to midnight to include all of today

  const futureAppointments = appointments?.filter((apt: any) => {
    const appointmentDate = new Date(apt.scheduledTime);
    return appointmentDate >= today; // Only appointments from today onwards
  }) || [];

  // Group appointments by date
  const groupedAppointments = futureAppointments.reduce((groups: any, apt: any) => {
    const date = format(new Date(apt.scheduledTime), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(apt);
    return groups;
  }, {});

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'default';
      case 'CHECKED_IN':
        return 'success';
      case 'COMPLETED':
        return 'primary';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Reception Dashboard</Typography>
        <Box>
          <Button
            startIcon={<PersonAdd />}
            variant="outlined"
            sx={{ mr: 1 }}
            href="/check-in"
          >
            New Check-In
          </Button>
          <Button startIcon={<Refresh />} onClick={() => refetchQueue()}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {stats?.currentQueueSize || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Queue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {waitingQueue.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Waiting
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main">
                {inProgress.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                ~{stats?.averageWaitTime || 0}m
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Wait Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Waiting Queue */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Waiting Queue ({waitingQueue.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Queue #</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Wait Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waitingQueue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No patients waiting
                    </TableCell>
                  </TableRow>
                ) : (
                  waitingQueue.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Typography variant="h6">#{entry.queueNumber}</Typography>
                      </TableCell>
                      <TableCell>{entry.position}</TableCell>
                      <TableCell>
                        {entry.patient?.firstName} {entry.patient?.lastName}
                      </TableCell>
                      <TableCell>
                        {entry.appointment?.provider
                          ? `Dr. ${entry.appointment.provider.firstName} ${entry.appointment.provider.lastName}`
                          : entry.room?.provider
                          ? `Dr. ${entry.room.provider.firstName} ${entry.room.provider.lastName}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.priority}
                          color={getPriorityColor(entry.priority) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{entry.reason}</TableCell>
                      <TableCell>~{entry.estimatedWait}m</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleCallPatient(entry)}
                        >
                          Call
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          sx={{ ml: 1 }}
                          onClick={() => removeMutation.mutate(entry.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            In Progress ({inProgress.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Queue #</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inProgress.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No patients in service
                    </TableCell>
                  </TableRow>
                ) : (
                  inProgress.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>#{entry.queueNumber}</TableCell>
                      <TableCell>
                        {entry.patient?.firstName} {entry.patient?.lastName}
                      </TableCell>
                      <TableCell>
                        {entry.appointment?.provider ? (
                          <>Dr. {entry.appointment.provider.firstName} {entry.appointment.provider.lastName}</>
                        ) : entry.room?.provider ? (
                          <>Dr. {entry.room.provider.firstName} {entry.room.provider.lastName}</>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not assigned</Typography>
                        )}
                      </TableCell>
                      <TableCell>{entry.room?.name || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={entry.status}
                          color={getStatusColor(entry.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {entry.status === 'CALLED' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => startServiceMutation.mutate(entry.id)}
                          >
                            Start Service
                          </Button>
                        )}
                        {entry.status === 'IN_SERVICE' && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => completeMutation.mutate(entry.id)}
                          >
                            Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Scheduled Appointments */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday /> Scheduled Appointments
            </Typography>
            <Button size="small" startIcon={<Refresh />} onClick={() => refetchAppointments()}>
              Refresh
            </Button>
          </Box>

          {!futureAppointments || futureAppointments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
              No scheduled appointments for today or future dates
            </Typography>
          ) : (
            Object.keys(groupedAppointments)
              .sort()
              .map((date) => (
                <Box key={date} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>Patient</TableCell>
                          <TableCell>Doctor</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedAppointments[date].map((apt: any) => (
                          <TableRow key={apt.id}>
                            <TableCell>
                              {format(new Date(apt.scheduledTime), 'h:mm a')}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {apt.patient.firstName} {apt.patient.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {apt.patient.phone}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              Dr. {apt.provider.firstName} {apt.provider.lastName}
                            </TableCell>
                            <TableCell>{apt.reason}</TableCell>
                            <TableCell>
                              <Chip
                                label={apt.status}
                                color={getAppointmentStatusColor(apt.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {apt.status === 'SCHEDULED' && !apt.queueEntry && (
                                <>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                      // Directly check in with APPOINTMENT priority (Priority 3)
                                      checkInAppointmentMutation.mutate({
                                        appointmentId: apt.id,
                                        patientId: apt.patientId,
                                        reason: apt.reason,
                                      });
                                    }}
                                    disabled={checkInAppointmentMutation.isPending}
                                  >
                                    Check In
                                  </Button>
                                  <Button
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                    sx={{ ml: 1 }}
                                    onClick={() => {
                                      if (window.confirm(`Cancel appointment for ${apt.patient.firstName} ${apt.patient.lastName}?`)) {
                                        cancelAppointmentMutation.mutate(apt.id);
                                      }
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </>
                              )}
                              {apt.queueEntry && (
                                <Chip label="In Queue" color="success" size="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))
          )}
        </CardContent>
      </Card>

      {/* Call Patient Dialog */}
      <Dialog open={!!callPatientDialog} onClose={() => setCallPatientDialog(null)}>
        <DialogTitle>Call Patient</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Typography gutterBottom>
            Call {callPatientDialog?.patient?.firstName} {callPatientDialog?.patient?.lastName}?
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Room</InputLabel>
            <Select
              value={selectedRoom}
              label="Select Room"
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              {rooms
                ?.filter((r) => r.status === 'AVAILABLE')
                .map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.name} ({room.roomNumber})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCallPatientDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmCall}
            disabled={!selectedRoom || callPatientMutation.isPending}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReceptionDashboard;

