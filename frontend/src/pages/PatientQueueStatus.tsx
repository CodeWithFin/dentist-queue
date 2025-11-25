import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  Grid,
} from '@mui/material';
import { AccessTime, Person, LocationOn } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { queueService } from '../services/queue';
import { socketService } from '../services/socket';
import { toast } from 'react-toastify';

const PatientQueueStatus = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [realtimeData, setRealtimeData] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['patient-position', patientId],
    queryFn: () => queueService.getPatientPosition(patientId!),
    refetchInterval: 10000, // Fallback polling
    enabled: !!patientId,
  });

  useEffect(() => {
    if (!patientId) return;

    // Connect to WebSocket
    socketService.connect();
    socketService.joinPatientRoom(patientId);

    // Listen for position updates
    const handlePositionUpdate = (data: any) => {
      console.log('Position update:', data);
      setRealtimeData(data);
      refetch();
    };

    const handlePatientCalled = (data: any) => {
      if (data.patientId === patientId) {
        toast.info(`You are being called! Please proceed to ${data.roomNumber}`, {
          autoClose: false,
        });
        refetch();
      }
    };

    const handleNotification = (notification: any) => {
      toast.info(notification.message);
    };

    socketService.onPositionUpdate(handlePositionUpdate);
    socketService.onPatientCalled(handlePatientCalled);
    socketService.onNotification(handleNotification);

    return () => {
      socketService.offPositionUpdate(handlePositionUpdate);
      socketService.offPatientCalled(handlePatientCalled);
      socketService.offNotification(handleNotification);
      socketService.disconnect();
    };
  }, [patientId, refetch]);

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error">Patient not found in queue</Alert>
      </Box>
    );
  }

  const displayData = realtimeData || data;
  const { queueEntry, position, estimatedWait, totalInQueue } = displayData;

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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Your Queue Status
      </Typography>

      {queueEntry.status === 'CALLED' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          You are being called! Please proceed to {queueEntry.room?.name || 'the reception desk'}.
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" color="primary" fontWeight="bold">
                  #{queueEntry.queueNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Queue Number
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" color="secondary" fontWeight="bold">
                  {position}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Position in Queue
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" color="info.main" fontWeight="bold">
                  ~{estimatedWait}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Minutes Wait
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Visit Details
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography>
                {queueEntry.patient?.firstName} {queueEntry.patient?.lastName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Chip
                label={queueEntry.priority}
                color={getPriorityColor(queueEntry.priority) as any}
                size="small"
              />
              <Chip
                label={queueEntry.status}
                color={getStatusColor(queueEntry.status) as any}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <AccessTime sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Checked in at
                </Typography>
                <Typography>
                  {new Date(queueEntry.checkedInAt).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
            {queueEntry.room && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationOn sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Room
                  </Typography>
                  <Typography>{queueEntry.room.name}</Typography>
                </Box>
              </Box>
            )}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Reason for visit
              </Typography>
              <Typography>{queueEntry.reason}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          There are currently {totalInQueue} patients in the queue. You will receive a notification
          when it's your turn.
        </Typography>
      </Alert>
    </Box>
  );
};

export default PatientQueueStatus;

