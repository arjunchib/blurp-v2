interface stringable {
  toString(): string;
}

export class Events<T extends stringable, D> {
  private eventTarget = new EventTarget();
  private listenerMap = new WeakMap<(data: D) => void, EventListener>();

  addEventListener<T2 extends T, D2 extends D>(
    type: T2,
    listener: (data: D2) => void
  ): void {
    const fn = (e: Event) => {
      const eventData = e instanceof CustomEvent ? e.detail : null;
      listener(eventData);
    };
    this.listenerMap.set(listener as (data: D) => void, fn);
    this.eventTarget.addEventListener(type.toString(), fn);
  }

  removeEventListener<T2 extends T, D2 extends D>(
    type: T2,
    listener: (data: D2) => void
  ): void {
    const fn = this.listenerMap.get(listener as (data: D) => void) || null;
    this.listenerMap.delete(listener as (data: D) => void);
    console.log("Remove listener", listener, fn?.name);
    this.eventTarget.removeEventListener(type.toString(), fn);
  }

  dispatchEvent(type: T, data?: D): boolean {
    return this.eventTarget.dispatchEvent(
      new CustomEvent(type.toString(), {
        detail: data,
      })
    );
  }
}
