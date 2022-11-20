export class Events<T extends string> {
  private eventTarget = new EventTarget();

  addEventListener(
    type: T,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    this.eventTarget.addEventListener(type, listener, options);
  }

  removeEventListener(
    type: T,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions | undefined
  ): void {
    this.eventTarget.removeEventListener(type, callback, options);
  }

  // deno-lint-ignore ban-types
  dispatchEvent(type: T, data?: {}): boolean {
    return this.eventTarget.dispatchEvent(
      new CustomEvent(type, {
        detail: data,
      })
    );
  }
}
