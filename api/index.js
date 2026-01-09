// api/index.js
const axios = require('axios');

module.exports = async (req, res) => {
  // Ambil URL gambar dari query parameter frontend
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL gambar diperlukan.' });
  }

  const targetApi = `https://api.sawit.biz.id/api/removebg?url=${url}`;

  try {
    // Memanggil API eksternal
    const response = await axios.get(targetApi, {
      responseType: 'arraybuffer' // Kita butuh data mentah gambar (binary)
    });

    // Mengatur header agar browser tahu ini adalah gambar
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 's-maxage=86400'); // Cache hasil agar cepat
    
    // Mengirimkan gambar yang sudah diproses ke frontend
    res.send(response.data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memproses gambar. Pastikan URL valid.' });
  }
};
