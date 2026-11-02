export function sendData(res, data, status = 200, meta) {
  return res.status(status).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  })
}
