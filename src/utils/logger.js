const fs = require('fs');
const path = require('path');

class Logger {
  constructor(logFilePath) {
    this.logFilePath = logFilePath || path.join(__dirname, '..', '..', 'logs', 'bot.log');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}\n`;

    // Write to file
    fs.appendFile(this.logFilePath, logMessage, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });

    // Also log to console
    console.log(logMessage.trim());
  }

  info(message) {
    this.log('info', message);
  }

  error(message) {
    this.log('error', message);
  }

  warn(message) {
    this.log('warn', message);
  }
}

module.exports = Logger;