// ==========================================
// UNDANGAN CORE LOGIC (CDN READY)
// Jangan ubah ini untuk klien berbeda.
// Ubah pengaturan melalui window.UndanganConfig
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    // Pastikan konfigurasi tersedia
    const cfg = window.UndanganConfig || {};
    const domCfg = cfg.dom || {};

    // ==========================================
    // 1. SCRIPT PRELOADER
    // ==========================================
    const preloader = document.getElementById('preloader');
    const preloaderText = document.getElementById('preloader-text');
    if(preloader && preloaderText) {
        document.fonts.ready.then(function() {
            preloaderText.classList.add('font-loaded');
            let progress = 0;
            const simulateLoad = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress >= 100) progress = 100;
                preloaderText.style.backgroundPosition = `${100 - progress}% 0`;
                if (progress === 100) {
                    clearInterval(simulateLoad);
                    setTimeout(() => {
                        preloader.classList.add('uk-animation-fade', 'uk-animation-reverse');
                        setTimeout(() => { preloader.style.display = 'none'; }, 500);
                    }, 500);
                }
            }, 100);
        });
    }

    // ==========================================
    // 2. NAMA TAMU (URL PARAMETER)
    // ==========================================
    function replaceGuestName() {
        const urlParams = new URLSearchParams(window.location.search);
        const guestName = urlParams.get('to');
        if (guestName && domCfg.namaTamuTarget) {
            const nameElement = document.getElementById(domCfg.namaTamuTarget);
            if (nameElement) nameElement.textContent = decodeURIComponent(guestName);
        }
    }
    replaceGuestName();

    // ==========================================
    // 3. AUDIO & BUKA UNDANGAN
    // ==========================================
    const song = document.getElementById(domCfg.audioSong);
    const btnOpenCover = document.querySelector(".btn-open-cover");
    const unmuteSound = document.getElementById(domCfg.btnUnmute);
    const muteSound = document.getElementById(domCfg.btnMute);
    const coverOverlay = document.querySelector(".cover-overlay");
    const scrollContainer = document.querySelector(".main-content");
    let isUserMuted = false;
    
    if(song) song.loop = true;
    
    if(btnOpenCover) {
        btnOpenCover.addEventListener("click", function() {
            if(song) song.play();
            isUserMuted = false;
            if(unmuteSound) unmuteSound.style.display = "none";
            if(muteSound) muteSound.style.display   = "block";
            if(coverOverlay) coverOverlay.classList.toggle("active");
            if(scrollContainer) {
                scrollContainer.classList.toggle("show-scroll");
                scrollContainer.scrollTop = 0;
            }
        });
    }
    
    if(unmuteSound) {
        unmuteSound.addEventListener("click", function() {
            if(song) song.play(); isUserMuted = false;
            unmuteSound.style.display = "none"; muteSound.style.display = "block";
        });
    }
    
    if(muteSound) {
        muteSound.addEventListener("click", function() {
            if(song) song.pause(); isUserMuted = true;
            muteSound.style.display = "none"; unmuteSound.style.display = "block";
        });
    }
    
    document.addEventListener("visibilitychange", function() {
        if (document.hidden) {
            if(song) song.pause();
            if(muteSound) muteSound.style.display = "none"; 
            if(unmuteSound) unmuteSound.style.display = "block";
        } else {
            if (coverOverlay && coverOverlay.classList.contains("active") && !isUserMuted) {
                if(song) song.play();
                if(unmuteSound) unmuteSound.style.display = "none"; 
                if(muteSound) muteSound.style.display = "block";
            }
        }
    });

    // ==========================================
    // 4. COUNTDOWN TIMER
    // ==========================================
    if (cfg.tanggalAcara) {
        const targetDate = new Date(cfg.tanggalAcara);
        function pad(n) { return String(n).padStart(2, '0'); }
        function updateCountdown() {
            const diff = targetDate - new Date();
            const elHari = document.getElementById(domCfg.cdHari);
            if(!elHari) return; 
            
            if (diff <= 0) {
                elHari.textContent  = '00';
                document.getElementById(domCfg.cdJam).textContent   = '00';
                document.getElementById(domCfg.cdMenit).textContent = '00';
                document.getElementById(domCfg.cdDetik).textContent = '00';
                return;
            }
            elHari.textContent  = pad(Math.floor(diff / 86400000));
            document.getElementById(domCfg.cdJam).textContent   = pad(Math.floor((diff % 86400000) / 3600000));
            document.getElementById(domCfg.cdMenit).textContent = pad(Math.floor((diff % 3600000) / 60000));
            document.getElementById(domCfg.cdDetik).textContent = pad(Math.floor((diff % 60000) / 1000));
        }
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
});

// ==========================================
// 5. FUNGSI GLOBAL (Dipanggil lewat onClick di HTML)
// ==========================================
const globalCfg = window.UndanganConfig || {};
const gDom = globalCfg.dom || {};

// Alert
function showCustomAlert(message, status) {
    const container = document.getElementById(gDom.alertContainer || 'custom-alert-container');
    if(!container) return;
    const alertBox = document.createElement('div');
    alertBox.className = `uk-alert-${status}`;
    alertBox.setAttribute('uk-alert', '');
    alertBox.innerHTML = `<a class="uk-alert-close" uk-close></a><p>${message}</p>`;
    container.appendChild(alertBox);
    setTimeout(() => { if(typeof UIkit !== 'undefined') UIkit.alert(alertBox).close(); }, 3500);
}

// Salin Text
function salinRekening(text) {
    navigator.clipboard.writeText(text).then(function() {
        showCustomAlert('<i class="fa-solid fa-circle-check"></i> Nomor rekening berhasil disalin!', 'primary');
    });
}
function salinAlamat() {
    var alamat = globalCfg.alamatLengkap || 'Alamat belum diatur';
    navigator.clipboard.writeText(alamat).then(function() {
        showCustomAlert('<i class="fa-solid fa-circle-check"></i> Alamat berhasil disalin!', 'primary');
    });
}

// Lightbox & Modal
function gmLightboxOpen(el) {
    var lb  = document.getElementById(gDom.lightboxId);
    var img = document.getElementById(gDom.lightboxImg);
    var cap = document.getElementById(gDom.lightboxCap);
    if(img) img.src = el.getAttribute('data-gm-src');
    if(cap) cap.textContent = el.getAttribute('data-gm-caption') || '';
    if(lb) lb.classList.add('open');
    var sc = document.getElementById('scroll-container');
    if(sc) sc.style.overflow = 'hidden';
}
function gmLightboxClose() {
    var lb  = document.getElementById(gDom.lightboxId);
    var img = document.getElementById(gDom.lightboxImg);
    if(lb) lb.classList.remove('open'); 
    if(img) img.src = '';
    var sc = document.getElementById('scroll-container');
    if (sc) {
        if (sc.classList.contains('show-scroll')) sc.style.overflowY = 'scroll';
        sc.style.overflow = '';
    }
}
function videoModalOpen(embedUrl, caption) {
    var modal  = document.getElementById(gDom.videoModalId);
    var iframe = document.getElementById(gDom.videoModalFrame);
    var cap    = document.getElementById(gDom.videoModalCap);
    if(iframe) iframe.src = embedUrl; 
    if(cap) cap.textContent = caption || '';
    if(modal) modal.classList.add('open');
    var sc = document.getElementById('scroll-container');
    if(sc) sc.style.overflow = 'hidden';
}
function videoModalClose() {
    var modal  = document.getElementById(gDom.videoModalId);
    var iframe = document.getElementById(gDom.videoModalFrame);
    if(modal) modal.classList.remove('open'); 
    if(iframe) iframe.src = '';
    var sc = document.getElementById('scroll-container');
    if (sc) {
        if (sc.classList.contains('show-scroll')) sc.style.overflowY = 'scroll';
        sc.style.overflow = '';
    }
}

// ==========================================
// 6. KONFIGURASI GOOGLE SHEET & RSVP
// ==========================================
let globalWishes = []; 

function renderWishes() {
    const sliderList = document.getElementById(gDom.wishesSliderList);
    if(!sliderList) return;
    sliderList.innerHTML = ''; 

    if (globalWishes.length === 0) {
        sliderList.innerHTML = '<li style="text-align:center; padding:20px; color:var(--c-white); opacity: 0.6;">Belum ada ucapan. Jadilah yang pertama!</li>';
        return;
    }

    const wishesToRender = globalWishes.slice(0, 20); 
    let slideHTML = '';
    let groupHTML = '';

    wishesToRender.forEach((wish, index) => {
        const formattedUcapan = wish.ucapan.replace(/\n{3,}/g, '\n\n').replace(/\n/g, '<br>');
        groupHTML += `
            <div class="sec12-wish-card-v2 glass-form">
                <div class="sec12-wish-name">${wish.nama}</div>
                <div class="sec12-wish-text">"${formattedUcapan}"</div>
            </div>
        `;
        if ((index + 1) % 4 === 0 || index === wishesToRender.length - 1) {
            slideHTML += `<li><div class="sec12-wishes-group">${groupHTML}</div></li>`;
            groupHTML = ''; 
        }
    });

    sliderList.innerHTML = slideHTML;
    try { if(typeof UIkit !== 'undefined') UIkit.slider(sliderList.closest('[uk-slider]')).show(0); } catch(e){}
}

function loadWishes() {
    if(!globalCfg.sheetURL || !globalCfg.sheetName) return;
    const sliderList = document.getElementById(gDom.wishesSliderList);
    if(sliderList) sliderList.innerHTML = '<li style="text-align:center; padding:20px; color:var(--c-white); opacity: 0.6;">Memuat doa & ucapan...</li>';

    fetch(globalCfg.sheetURL + '?sheetName=' + globalCfg.sheetName)
        .then(response => response.json())
        .then(res => {
            if (res.result === 'success') {
                globalWishes = res.data;
                renderWishes();
            }
        })
        .catch(error => {
            console.error('Gagal memuat ucapan:', error);
            if(sliderList) sliderList.innerHTML = '<li style="text-align:center; padding:20px; color:var(--c-danger);">Gagal memuat daftar ucapan.</li>';
        });
}
document.addEventListener('DOMContentLoaded', loadWishes);

let rsvpAttendance = 'attend';
function setAttend(val) {
    rsvpAttendance = val;
    const rAttend = document.getElementById('radio-attend');
    const rMaybe = document.getElementById('radio-maybe');
    const rNo = document.getElementById('radio-no');
    if(rAttend) rAttend.classList.toggle('active', val === 'attend');
    if(rMaybe) rMaybe.classList.toggle('active', val === 'maybe');
    if(rNo) rNo.classList.toggle('active', val === 'no');
}

function submitRsvp() {
    const elName = document.getElementById(gDom.rsvpNameInput);
    const elWishes = document.getElementById(gDom.rsvpWishesInput);
    const elGuests = document.getElementById(gDom.rsvpGuestsInput);
    
    if(!elName || !elWishes || !elGuests) return;

    const name   = elName.value.trim();
    const wishes = elWishes.value.trim();
    const guests = elGuests.value; 

    if (!name) {
        showCustomAlert('<i class="fa-solid fa-circle-exclamation"></i> Mohon isi nama terlebih dahulu.', 'warning');
        return;
    }

    const btnSend = document.querySelector('.sec11-rsvp-btn-send');
    let originalBtnText = "Kirim";
    if(btnSend) {
        originalBtnText = btnSend.innerHTML;
        btnSend.innerHTML = 'MENGIRIM...';
        btnSend.disabled = true;
    }

    const formData = new FormData();
    formData.append('nama', name);
    formData.append('kehadiran', rsvpAttendance);
    formData.append('jumlah_tamu', guests);
    formData.append('ucapan', wishes);
    formData.append('sheetName', globalCfg.sheetName);
    formData.append('honeypot', ''); 

    fetch(globalCfg.sheetURL, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if(data.result === 'success') {
                globalWishes.unshift({ nama: name, ucapan: wishes || 'Selamat menempuh hidup baru!' });
                renderWishes();
                showCustomAlert('<i class="fa-solid fa-circle-check"></i> Terima kasih, ' + name + '! Ucapanmu sudah terkirim. 💛', 'primary');
                
                elName.value = '';
                elWishes.value = '';
                elGuests.selectedIndex = 0;
                setAttend('attend');
            } else {
                throw new Error(data.error);
            }
        })
        .catch(error => {
            console.error('Error!', error.message);
            showCustomAlert('<i class="fa-solid fa-circle-exclamation"></i> Gagal mengirim data. Coba lagi beberapa saat.', 'warning');
        })
        .finally(() => {
            if(btnSend) {
                btnSend.innerHTML = originalBtnText;
                btnSend.disabled = false;
            }
        });
}

// ==========================================
// 7. SMOOTH SCROLL, PAGINATION & OTHERS
// ==========================================
function easeInOutQuad(t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--; return -c/2 * (t*(t-2) - 1) + b;
}
function scrollToSection(id) {
    const closeBtn = document.querySelector('.close-btn');
    if(closeBtn) closeBtn.click();
    
    const container = document.getElementById('scroll-container');
    const target = document.getElementById(id);
    if (container && target) {
        setTimeout(() => {
            container.style.scrollSnapType = 'none';
            container.classList.remove('snap-active');
            const startPosition = container.scrollTop;
            const targetPosition = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
            const distance = targetPosition - startPosition;
            const duration = 800;
            let startTime = null;
            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
                container.scrollTop = run;
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                } else {
                    container.scrollTop = targetPosition;
                    container.style.scrollSnapType = '';
                    container.classList.add('snap-active');
                }
            }
            requestAnimationFrame(animation);
        }, 250);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Nav modal overlay dismiss
    const navModal = document.getElementById('nav-modal');
    if(navModal) {
        navModal.addEventListener('click', function(e) {
            if (e.target === this) { const closeBtn = document.querySelector('.close-btn'); if(closeBtn) closeBtn.click(); }
        });
    }

    // Pagination Counter
    const sections = ['sec-1','sec-2','sec-3','sec-4','sec-5','sec-6','sec-7','sec-8','sec-9','sec-10','sec-11','sec-12','sec-13'];
    const container = document.getElementById('scroll-container');
    const pgCurrent = document.getElementById('pg-current');
    const pgTotal   = document.getElementById('pg-total');
    if(container && pgCurrent && pgTotal) {
        pgTotal.textContent = sections.length;
        function updateCounter() {
            let current = 0;
            const containerRectTop = container.getBoundingClientRect().top;
            sections.forEach(function(id, i) {
                const el = document.getElementById(id);
                if (el) {
                    const elAbsoluteTop = el.getBoundingClientRect().top - containerRectTop + container.scrollTop;
                    if (container.scrollTop >= elAbsoluteTop - (container.clientHeight / 2)) { current = i; }
                }
            });
            pgCurrent.textContent = current + 1;
        }
        container.addEventListener('scroll', updateCounter);
        updateCounter();
    }

    // Modal Esc press
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { gmLightboxClose(); videoModalClose(); }
    });
    const vidModal = document.getElementById(gDom.videoModalId || 'video-modal');
    if(vidModal) {
        vidModal.addEventListener('click', function(e) { if (e.target === this) videoModalClose(); });
    }

    // Trackpad Horizontal
    function initTrackpadScroll(containerEl, sliderEl) {
        if (!containerEl || !sliderEl) return;
        var throttle = false;
        containerEl.addEventListener('wheel', function(e) {
            var ax = Math.abs(e.deltaX), ay = Math.abs(e.deltaY);
            if (ax < 5 || ax <= ay) return;
            e.preventDefault(); e.stopPropagation();
            if (throttle) return;
            throttle = true;
            setTimeout(function() { throttle = false; }, 600);
            var items = sliderEl.querySelectorAll('.uk-slider-items > li');
            var cur = 0;
            items.forEach(function(li, i) { if (li.classList.contains('uk-active')) cur = i; });
            var next = e.deltaX > 0 ? Math.min(cur + 1, items.length - 1) : Math.max(cur - 1, 0);
            try { if(typeof UIkit !== 'undefined') UIkit.slider(sliderEl).show(next); } catch(err) {}
        }, { passive: false });
    }
    var wishesContainer = document.querySelector('.sec12-wishes-slider-container');
    var wishesSlider = wishesContainer ? wishesContainer.querySelector('[uk-slider]') : null;
    if (wishesContainer && wishesSlider) initTrackpadScroll(wishesContainer, wishesSlider);
    
    var galleryContainer = document.querySelector('.gallery-slider-container');
    var gallerySlider = galleryContainer ? galleryContainer.querySelector('[uk-slider]') : null;
    if (galleryContainer && gallerySlider) initTrackpadScroll(galleryContainer, gallerySlider);
});
