/**
 * Runtime code shared by the host and every remote.
 *
 * This module is declared as a Module Federation singleton, so exactly one copy
 * is live on the page no matter how many remotes import it. That is the whole
 * point: the event bus below only works if publishers and subscribers are
 * talking to the *same* `handlers` map. If this were bundled per app, each app
 * would get its own map and no message would ever cross an app boundary.
 *
 * Keep this package small and genuinely shared. Anything that does not need one
 * instance belongs in a normal workspace package instead — a singleton couples
 * the remotes' release cycles, since a breaking change here needs every app
 * redeployed together.
 */

type Handler = (payload: unknown) => void;

const handlers = new Map<string, Set<Handler>>();

/** Subscribes to an event. Returns an unsubscribe function. */
export function on(event: string, fn: Handler): () => void {
  let set = handlers.get(event);
  if (!set) {
    set = new Set();
    handlers.set(event, set);
  }
  set.add(fn);

  return () => {
    set.delete(fn);
    if (set.size === 0) handlers.delete(event);
  };
}

/** Publishes an event to every current subscriber. */
export function emit(event: string, payload?: unknown): void {
  // Copied before iterating so a handler that unsubscribes during dispatch
  // cannot mutate the set we are walking.
  for (const fn of [...(handlers.get(event) ?? [])]) {
    try {
      fn(payload);
    } catch (err) {
      // One bad subscriber must not stop the rest from being notified.
      console.error(`@cloud-ui/shared: handler for "${event}" threw`, err);
    }
  }
}
