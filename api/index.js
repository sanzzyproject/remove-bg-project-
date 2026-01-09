// api/index.js
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

// Konfigurasi Multer (Simpan file di Memory sementara)
const upload = multer({ storage: multer.memoryStorage() });

// Helper: Fungsi upload ke Telegra.ph (Hosting sementara gratis)
async function uploadToTelegraph(buffer, mimetype) {
    const form = new FormData();
    form.append('file', buffer, { filename: 'image.jpg', contentType: mimetype });

    try {
        // Menggunakan upload telegra.ph yang umum digunakan
        const response = await axios.post('https://telegra.ph/upload', form, {
            headers: { ...form.getHeaders() }
        });
        
        if (response.data && response.data[0] && response.data[0].src) {
            return 'https://telegra.ph' + response.data[0].src;
        }
        throw new Error('Gagal upload ke server sementara.');
    } catch (error) {
        throw new Error('Gagal membuat link gambar publik: ' + error.message);
    }
}

// Handler Utama Vercel
module.exports = async (req, res) => {
    // Jalankan Multer middleware manual
    await new Promise((resolve, reject) => {
        upload.single('image')(req, res, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    try {
        let imageUrl = '';

        // JIKA USER UPLOAD FILE
        if (req.file) {
            console.log("Memproses file upload...");
            // Upload dulu ke Telegra buat dapet URL
            imageUrl = await uploadToTelegraph(req.file.buffer, req.file.mimetype);
            console.log("URL Sementara berhasil dibuat:", imageUrl);
        } 
        // JIKA USER PAKA URL
        else if (req.body.url || req.query.url) {
            imageUrl = req.body.url || req.query.url;
        } else {
            return res.status(400).json({ error: 'Harap upload gambar atau masukkan URL.' });
        }

        // KIRIM KE API SAWIT
        const targetApi = `https://api.sawit.biz.id/api/removebg?url=${encodeURIComponent(imageUrl)}`;
        
        const response = await axios.get(targetApi, {
            responseType: 'arraybuffer'
        });

        // Kirim hasil balik ke frontend
        res.setHeader('Content-Type', 'image/png');
        res.send(response.data);

    } catch (error) {
        console.error("Error Detail:", error.message);
        res.status(500).json({ 
            error: 'Gagal memproses gambar.', 
            detail: error.message 
        });
    }
};
