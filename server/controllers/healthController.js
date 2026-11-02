export function getHealth(_req, res) {
  res.json({
    status: 'ok',
    service: 'threadly-api',
    timestamp: new Date().toISOString(),
  })
}
