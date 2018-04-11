export class ReactiveVar {
  constructor() {
  	this.value = undefined;
  }
  set(value) {
    this.value = value;
  }
  get() {
    return this.value;
  }
}
