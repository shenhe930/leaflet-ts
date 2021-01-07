import { extend, falseFn, splitWords, stamp } from './Util';

type Listener = (event: Record<string, unknown>) => void;
type Event = {
  type: string;
  target: Evented;
  sourceTarget: Evented;
} & Record<string, unknown>;

export class Evented {
  private _events: Record<
    string,
    Array<{ fn: Listener; ctx: unknown }>
  > | null = {};
  private _eventParents: Record<string, Evented> = {};
  private _firingCount = 0;
  /* @method on(type: String, fn: Function, context?: Object): this
   * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
   *
   * @alternative
   * @method on(eventMap: Object): this
   * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
   */
  public on(
    types: string | Record<string, Listener>,
    fn: Listener,
    context?: unknown,
  ): this {
    // types can be a map of types/handlers
    if (typeof types === 'object') {
      for (const type in types) {
        // we don't process space-separated events here for performance;
        // it's a hot path since Layer uses the on(obj) syntax
        this._on(type, types[type], fn);
      }
    } else {
      // types can be a string of space-separated words
      const typeList = splitWords(types);

      for (let i = 0, len = typeList.length; i < len; i++) {
        this._on(typeList[i], fn, context);
      }
    }

    return this;
  }

  /* @method off(type: String, fn?: Function, context?: Object): this
   * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
   *
   * @alternative
   * @method off(eventMap: Object): this
   * Removes a set of type/listener pairs.
   *
   * @alternative
   * @method off: this
   * Removes all listeners to all events on the object. This includes implicitly attached events.
   */
  public off(
    types: string | Record<string, Listener>,
    fn: Listener,
    context?: unknown,
  ): this {
    if (!types) {
      // clear all listeners if called without arguments
      this._events = null;
    } else if (typeof types === 'object') {
      for (const type in types) {
        this._off(type, types[type], fn);
      }
    } else {
      const typeList = splitWords(types);

      for (let i = 0, len = typeList.length; i < len; i++) {
        this._off(typeList[i], fn, context);
      }
    }

    return this;
  }

  // @method fire(type: String, data?: Object, propagate?: Boolean): this
  // Fires an event of the specified type. You can optionally provide a data
  // object — the first argument of the listener function will contain its
  // properties. The event can optionally be propagated to event parents.
  public fire(
    type: string,
    data?: Record<string, unknown>,
    propagate?: boolean,
  ): this {
    if (!this.listens(type, propagate)) {
      return this;
    }

    const event: Event = extend({}, data || {}, {
      type: type,
      target: this,
      sourceTarget: (data && data.sourceTarget) || this,
    }) as Event;

    if (this._events) {
      const listeners = this._events[type];

      if (listeners) {
        this._firingCount = this._firingCount + 1 || 1;
        for (let i = 0, len = listeners.length; i < len; i++) {
          const l = listeners[i];
          l.fn.call(l.ctx || this, event);
        }

        this._firingCount--;
      }
    }

    if (propagate) {
      // propagate the event to parents (set with addEventParent)
      this._propagateEvent(event);
    }

    return this;
  }

  // @method listens(type: String): Boolean
  // Returns `true` if a particular event type has any listeners attached to it.
  public listens(type: string, propagate?: boolean): boolean {
    const listeners = this._events && this._events[type];
    if (listeners && listeners.length) {
      return true;
    }

    if (propagate) {
      // also check parents for listeners if event propagates
      for (const id in this._eventParents) {
        if (this._eventParents[id].listens(type, propagate)) {
          return true;
        }
      }
    }
    return false;
  }

  // @method once(…): this
  // Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
  public once(
    types: string | Record<string, Listener>,
    fn: Listener,
    context?: unknown,
  ): this {
    if (typeof types === 'object') {
      for (const type in types) {
        this.once(type, types[type], fn);
      }
      return this;
    }

    const handler = () => {
      this.off(types, fn, context).off(types, handler, context);
    };

    // add a listener that's executed once and removed after that
    return this.on(types, fn, context).on(types, handler, context);
  }

  // attach listener (without syntactic sugar now)
  private _on(type: string, fn: Listener, context?: unknown): void {
    this._events = this._events || {};

    /* get/init listeners for type */
    let typeListeners = this._events[type];
    if (!typeListeners) {
      typeListeners = [];
      this._events[type] = typeListeners;
    }

    if (context === this) {
      // Less memory footprint.
      context = undefined;
    }
    const newListener = { fn: fn, ctx: context };
    const listeners = typeListeners;

    // check if fn already there
    for (let i = 0, len = listeners.length; i < len; i++) {
      if (listeners[i].fn === fn && listeners[i].ctx === context) {
        return;
      }
    }

    listeners.push(newListener);
  }

  // @method addEventParent(obj: Evented): this
  // Adds an event parent - an `Evented` that will receive propagated events
  public addEventParent(obj: Evented): this {
    this._eventParents = this._eventParents || {};
    this._eventParents[stamp(obj)] = obj;
    return this;
  }

  // @method removeEventParent(obj: Evented): this
  // Removes an event parent, so it will stop receiving propagated events
  public removeEventParent(obj: Evented): this {
    if (this._eventParents) {
      delete this._eventParents[stamp(obj)];
    }
    return this;
  }

  private _off(type: string, fn: Listener, context?: unknown): void {
    let listeners, i, len;

    if (!this._events) {
      return;
    }

    listeners = this._events[type];

    if (!listeners) {
      return;
    }

    if (!fn) {
      // Set all removed listeners to noop so they are not called if remove happens in fire
      for (i = 0, len = listeners.length; i < len; i++) {
        listeners[i].fn = falseFn;
      }
      // clear all listeners for a type if function isn't specified
      this._events[type] = [];
      return;
    }

    if (context === this) {
      context = undefined;
    }

    if (listeners) {
      // find fn and remove it
      for (i = 0, len = listeners.length; i < len; i++) {
        const l = listeners[i];
        if (l.ctx !== context) {
          continue;
        }
        if (l.fn === fn) {
          // set the removed listener to noop so that's not called if remove happens in fire
          l.fn = falseFn;

          if (this._firingCount) {
            /* copy array in case events are being fired */
            this._events[type] = listeners = listeners.slice();
          }
          listeners.splice(i, 1);

          return;
        }
      }
    }
  }

  private _propagateEvent(e: Event) {
    for (const id in this._eventParents) {
      this._eventParents[id].fire(
        e.type,
        extend(
          {
            layer: e.target,
            propagatedFrom: e.target,
          },
          e,
        ),
        true,
      );
    }
  }
}
