import { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import { CheckCircle, HourglassEmpty } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueService } from '../services/queue';
import { roomsService } from '../services/rooms';
import { socketService } from '../services/socket';
import { toast } from 'react-toastify';

const DentistDashboard = () => {
  const queryClient = useQueryClient();

  const { data: queueData, refetch } = useQuery({
    queryKey: ['dentist-queue'],
    queryFn: () => queueService.getCurrentQueue(),
    refetchInterval: 5000,
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsService.getAll(),
  });

  const updateRoomStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      roomsService.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Room status updated');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => queueService.complete(id),
    onSuccess: () => {
      toast.success('Service completed!');
      refetch();
    },
  });

  useEffect(() => {
    socketService.connect();
    socketService.joinReceptionRoom(); // Dentist can also listen to reception updates

    const handleQueueUpdate = () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    };

    socketService.onQueueUpdate(handleQueueUpdate);

    return () => {
      socketService.offQueueUpdate(handleQueueUpdate);
      socketService.disconnect();
    };
  }, [queryClient, refetch]);

  const myPatients = queueData?.filter((q) => ['CALLED', 'IN_SERVICE'].includes(q.status)) || [];
  const waitingPatients = queueData?.filter((q) => q.status === 'WAITING') || [];

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'OCCUPIED':
        return 'warning';
      case 'MAINTENANCE':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dentist Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* My Patients */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Patients ({myPatients.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {myPatients.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  No patients currently assigned
                </Typography>
              ) : (
                <List>
                  {myPatients.map((entry: any) => (
                    <ListItem
                      key={entry.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              #{entry.queueNumber} - {entry.patient?.firstName}{' '}
                              {entry.patient?.lastName}
                            </Typography>
                            <Chip
                              label={entry.status}
                              color={entry.status === 'IN_SERVICE' ? 'success' : 'info'}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              <strong>Room:</strong> {entry.room?.name || 'Not assigned'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Reason:</strong> {entry.reason}
                            </Typography>
                            {entry.notes && (
                              <Typography variant="body2">
                                <strong>Notes:</strong> {entry.notes}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      {entry.status === 'IN_SERVICE' && (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => completeMutation.mutate(entry.id)}
                          sx={{ ml: 2 }}
                        >
                          Complete
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Waiting Queue */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Waiting Queue ({waitingPatients.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {waitingPatients.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  No patients waiting
                </Typography>
              ) : (
                <List>
                  {waitingPatients.slice(0, 10).map((entry: any, index: number) => (
                    <ListItem
                      key={entry.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: index === 0 ? 'action.hover' : 'transparent',
                      }}
                    >
                      <Box sx={{ mr: 2 }}>
                        <HourglassEmpty color="action" />
                      </Box>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            #{entry.queueNumber} - {entry.patient?.firstName}{' '}
                            {entry.patient?.lastName}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                            <Chip label={entry.priority} size="small" />
                            <Typography variant="caption">• {entry.reason}</Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Room Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Room Management
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {rooms?.map((room) => (
                  <Grid item xs={12} sm={6} md={4} key={room.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6">{room.name}</Typography>
                          <Chip
                            label={room.status}
                            color={getRoomStatusColor(room.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Room {room.roomNumber}
                        </Typography>
                        {room.provider && (
                          <Typography variant="body2">
                            {room.provider.firstName} {room.provider.lastName}
                          </Typography>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() =>
                              updateRoomStatusMutation.mutate({
                                id: room.id,
                                status: 'AVAILABLE',
                              })
                            }
                            disabled={room.status === 'AVAILABLE'}
                          >
                            Free
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() =>
                              updateRoomStatusMutation.mutate({
                                id: room.id,
                                status: 'OCCUPIED',
                              })
                            }
                            disabled={room.status === 'OCCUPIED'}
                          >
                            Occupied
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DentistDashboard;

