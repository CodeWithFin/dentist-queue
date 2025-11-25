import { useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { queueService } from '../services/queue';
import { socketService } from '../services/socket';

const PublicWaitingScreen = () => {
  const { data: queueData, refetch } = useQuery({
    queryKey: ['public-queue'],
    queryFn: () => queueService.getCurrentQueue(),
    refetchInterval: 3000,
  });

  useEffect(() => {
    socketService.connect();
    socketService.joinReceptionRoom();

    const handleQueueUpdate = () => {
      refetch();
    };

    socketService.onQueueUpdate(handleQueueUpdate);

    return () => {
      socketService.offQueueUpdate(handleQueueUpdate);
      socketService.disconnect();
    };
  }, [refetch]);

  const waitingQueue = queueData?.filter((q) => q.status === 'WAITING') || [];
  const nowServing = queueData?.filter((q) => q.status === 'CALLED') || [];

  return (
    <Box sx={{ backgroundColor: 'background.paper', minHeight: '100vh', p: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" gutterBottom fontWeight="bold">
          Queue Management System
        </Typography>
        <Typography variant="h5" color="text.secondary">
          {new Date().toLocaleString()}
        </Typography>
      </Box>

      {/* Now Serving */}
      {nowServing.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            🔔 Now Serving
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {nowServing.map((entry: any) => (
              <Paper
                key={entry.id}
                sx={{
                  p: 4,
                  minWidth: 300,
                  backgroundColor: 'success.light',
                  border: 3,
                  borderColor: 'success.main',
                }}
              >
                <Typography variant="h2" fontWeight="bold" color="success.dark">
                  #{entry.queueNumber}
                </Typography>
                <Typography variant="h5" sx={{ mt: 2 }}>
                  {entry.room?.name || 'Reception'}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* Waiting Queue */}
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          ⏰ Waiting Queue ({waitingQueue.length})
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="h6">Queue Number</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6">Position</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6">Priority</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6">Estimated Wait</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {waitingQueue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="h6" color="text.secondary" sx={{ py: 4 }}>
                      No patients in queue
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                waitingQueue.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Typography variant="h4" fontWeight="bold">
                        #{entry.queueNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h5">{entry.position}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entry.priority}
                        color={
                          entry.priority === 'EMERGENCY'
                            ? 'error'
                            : entry.priority === 'URGENT'
                            ? 'warning'
                            : 'default'
                        }
                        size="medium"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="h5">~{entry.estimatedWait} min</Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default PublicWaitingScreen;

