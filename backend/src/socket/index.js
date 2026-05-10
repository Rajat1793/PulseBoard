const initSocket = (io) => {
  io.on('connection', (socket) => {
    // Join a poll analytics room (used by creators viewing analytics)
    socket.on('join-poll', (pollId) => {
      socket.join(`poll-${pollId}`);
    });

    // Leave a poll room
    socket.on('leave-poll', (pollId) => {
      socket.leave(`poll-${pollId}`);
    });

    socket.on('disconnect', () => {
      // Socket.io automatically handles room cleanup on disconnect
    });
  });
};

module.exports = { initSocket };
