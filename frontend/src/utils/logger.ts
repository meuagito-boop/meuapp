type LoggerArgs = unknown[];

const canLog = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

export const logger = {
  info: (...args: LoggerArgs) => {
    if (canLog) {
      console.log(...args);
    }
  },
  warn: (...args: LoggerArgs) => {
    if (canLog) {
      console.warn(...args);
    }
  },
  error: (...args: LoggerArgs) => {
    if (canLog) {
      console.error(...args);
    }
  },
};
