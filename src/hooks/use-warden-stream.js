// useWardenStream — connects to /api/warden/stream via fetch +
// ReadableStream.getReader(), parses SSE frames, and dispatches events to
// WardenContext. Implementation lands in T059 (US1).
export function useWardenStream() {
  return { connect: () => {}, disconnect: () => {}, status: 'idle' };
}
