function sleep(time, callback) {
  let stop = new Date().getTime();
  while (new Date().getTime() < stop + time) {
    ;
  }
  callback();
}
