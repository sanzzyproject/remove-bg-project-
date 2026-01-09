document.addEventListener('DOMContentLoaded', () => {
    const processBtn = document.getElementById('processBtn');
    const urlInput = document.getElementById('urlInput');
    const resultArea = document.getElementById('resultArea');
    const resultImage = document.getElementById('resultImage');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const downloadBtn = document.getElementById('downloadBtn');

    // Sidebar Logic
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const overlay = document.getElementById('overlay');

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    openBtn.addEventListener('click', toggleSidebar);
    closeBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);

    // Process Image
    processBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        
        if (!url) {
            alert("Silakan masukkan URL gambar terlebih dahulu!");
            return;
        }

        // UI State: Loading
        setLoading(true);
        resultArea.classList.add('hidden');

        try {
            // Panggil API Backend kita (bukan API eksternal langsung)
            // Backend kita ada di /api/index.js (diakses via /api?url=...)
            const response = await fetch(`/api?url=${encodeURIComponent(url)}`);

            if (!response.ok) throw new Error('Gagal memproses gambar');

            // Convert response ke Blob (binary image)
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            // Tampilkan hasil
            resultImage.src = imageUrl;
            resultArea.classList.remove('hidden');

            // Setup tombol download
            downloadBtn.onclick = () => {
                const a = document.createElement('a');
                a.href = imageUrl;
                a.download = 'sann404-removebg.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan atau URL gambar tidak dapat diakses.");
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'block';
            processBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            processBtn.disabled = false;
        }
    }
});
