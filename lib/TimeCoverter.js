export function serverToClientTime(serverTime) {
    if (!serverTime) return null;

    const date =
        typeof serverTime === "string"
            ? new Date(serverTime)
            : serverTime;

    // If invalid date
    if (isNaN(date.getTime())) return null;

    return date; // JS Date auto-converts UTC → local
  }