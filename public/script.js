document.addEventListener('DOMContentLoaded', () => {
    const processBtn = document.getElementById('processBtn');
    const urlInput = document.getElementById('urlInput');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const previewThumb = document.getElementById('previewThumb');
    
    const resultArea = document.getElementById('resultArea');
    const resultImage = document.getElementById('resultImage');
    const errorBox = document.getElementById('errorBox');
    const errorText = document.getElementById('errorText');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // Status Logic
    let currentMode = 'upload'; // 'upload' or 'url'
    let selectedFile = null;

    // --- Tab Switching ---
    window.switchTab = (mode) => {
        currentMode = mode;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(mode + '-panel').classList.add('active');
        
        // Reset Error
        errorBox.classList.add('hidden');
    };

    // --- File Handling (Click & Drop) ---
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });

    function handleFile(file) {
        if (file && file.type.startsWith('image/')) {
            selectedFile = file;
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                previewThumb.src = e.target.result;
                previewThumb.classList.add('show');
                dropZone.querySelector('i').style.display = 'none';
                dropZone.querySelector('p').style.display = 'none';
            };
            reader.readAsDataURL(file);
            errorBox.classList.add('hidden');
        } else {
            showError("Mohon upload file gambar (JPG/PNG).");
        }
    }

    // --- Processing ---
    processBtn.addEventListener('click', async () => {
        errorBox.classList.add('hidden');
        resultArea.classList.add('hidden');
        setLoading(true);

        try {
            let bodyData;
            let headers = {};

            if (currentMode === 'upload') {
                if (!selectedFile) throw new Error("Pilih foto terlebih dahulu!");
                const formData = new FormData();
                formData.append('image', selectedFile);
                bodyData = formData;
                // Fetch API akan otomatis mengatur Content-Type untuk FormData
            } else {
                const url = urlInput.value.trim();
                if (!url) throw new Error("Masukkan URL gambar!");
                bodyData = JSON.stringify({ url: url });
                headers = { 'Content-Type': 'application/json' };
            }

            // Panggil Backend kita
            // Perhatikan: Method ganti jadi POST agar bisa bawa file
            const response = await fetch('/api', {
                method: 'POST',
                headers: headers,
                body: bodyData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Gagal memproses gambar.");
            }

            // Handle Image Response
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            resultImage.src = imageUrl;
            resultArea.classList.remove('hidden');

            downloadBtn.onclick = () => {
                const a = document.createElement('a');
                a.href = imageUrl;
                a.download = 'sann404-result.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

        } catch (err) {
            console.error(err);
            showError(err.message);
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        const btnText = document.getElementById('btnText');
        const btnLoader = document.getElementById('btnLoader');
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

    function showError(msg) {
        errorText.textContent = msg;
        errorBox.classList.remove('hidden');
    }
    
    // Sidebar Logic (Sama seperti sebelumnya)
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const overlay = document.getElementById('overlay');
    function toggleSidebar() { sidebar.classList.toggle('active'); overlay.classList.toggle('active'); }
    openBtn.addEventListener('click', toggleSidebar);
    closeBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
});
