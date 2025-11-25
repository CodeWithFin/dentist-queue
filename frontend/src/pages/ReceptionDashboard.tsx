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
import { Refresh, PersonAdd, Close } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueService } from '../services/queue';
import { roomsService } from '../services/rooms';
import { socketService } from '../services/socket';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    socketService.connect();
    socketService.joinReceptionRoom();

    const handleQueueUpdate = (data: any) => {
      console.log('Queue updated:', data);
      refetchQueue();
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
                  <TableCell>Priority</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Wait Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waitingQueue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
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
                  <TableCell>Room</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inProgress.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
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

