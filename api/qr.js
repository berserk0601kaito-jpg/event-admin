const QRCode = require('qrcode');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = `${proto}://${host}/`;

  const png = await QRCode.toBuffer(url, {
    width: 400,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' }
  });

  res.setHeader('Content-Type', 'image/png');
  res.send(png);
};
