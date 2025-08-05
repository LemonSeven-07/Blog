const app = require('./app/app.js');
const webSocketService = require('./app/socket.js');

app.listen(process.env.APP_PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.APP_PORT}`);
});

webSocketService.listen();
