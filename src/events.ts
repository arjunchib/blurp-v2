export class Events<
  Type extends {
    toString(): string;
  },
  Data
> {
  private eventTarget = new EventTarget();
  private listenerMap = new WeakMap<(data: Data) => void, EventListener>();

  addEventListener<T extends Type, D extends Data>(
    type: T,
    listener: (data: D) => void
  ): void {
    const fn = (e: Event) => {
      const eventData = e instanceof CustomEvent ? e.detail : null;
      listener(eventData);
    };
    this.listenerMap.set(listener as (data: Data) => void, fn);
    this.eventTarget.addEventListener(type.toString(), fn);
  }

  removeEventListener<T extends Type, D extends Data>(
    type: T,
    listener: (data: D) => void
  ): void {
    const fn = this.listenerMap.get(listener as (data: Data) => void) || null;
    this.listenerMap.delete(listener as (data: Data) => void);
    this.eventTarget.removeEventListener(type.toString(), fn);
  }

  dispatchEvent(type: Type, data?: Data): boolean {
    return this.eventTarget.dispatchEvent(
      new CustomEvent(type.toString(), {
        detail: data,
      })
    );
  }
}
