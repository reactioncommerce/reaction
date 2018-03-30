import loggly from "node-loggly-bulk";

class Bunyan2Loggly {
  constructor(logglyConfig, bufferLength = 1, bufferTimeout, callback) {
    if (!logglyConfig || !logglyConfig.token || !logglyConfig.subdomain) {
      throw new Error("bunyan-loggly requires a config object with token and subdomain");
    }

    logglyConfig.json = true;

    this.logglyClient = loggly.createClient(logglyConfig);

    this._buffer = [];
    this.bufferLength = bufferLength;
    this.bufferTimeout = bufferTimeout;
    this.callback = callback || function () {};
  }

  write(data) {
    if (typeof data !== "object") {
      throw new Error("bunyan-loggly requires a raw stream. Please define the type as raw when setting up the bunyan stream.");
    }

    // loggly prefers timestamp over time
    if (data.time) {
      data.timestamp = data.time;
      delete data.time;
    }

    this._buffer.push(data);

    this._checkBuffer();
  }

  _processBuffer() {
    clearTimeout(this._timeoutId);

    let content = this._buffer.slice();

    this._buffer = [];

    if (content.length === 1) {
      [content] = content;
    }

    this.logglyClient.log(content, (error, result) => {
      this.callback(error, result, content);
    });
  }

  _checkBuffer() {
    if (!this._buffer.length) {
      return;
    }

    if (this._buffer.length >= this.bufferLength) {
      return this._processBuffer();
    }

    if (this.bufferTimeout) {
      clearTimeout(this._timeoutId);
      this._timeoutId = setTimeout(() => { this._processBuffer(); }, this.bufferTimeout);
    }
  }
}

export default Bunyan2Loggly;
