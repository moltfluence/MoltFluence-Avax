export function runLog(event: string, data: Record<string, unknown>) {
  const payload = {
    t: new Date().toISOString(),
    event,
    ...data,
  };

  console.log("[moltfluence-run]", JSON.stringify(payload));
}
