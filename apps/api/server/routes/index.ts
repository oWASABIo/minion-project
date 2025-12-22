export default eventHandler(() => {
  return {
    status: "ok",
    service: "MINIONS API",
    version: "1.0.0",
    check: "Use /api/ai-status to check credentials",
  };
});
