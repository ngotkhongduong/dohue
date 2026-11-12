"use strict";

/* =========================================================
   1. CẤU HÌNH CHUNG
========================================================= */

const CFG = window.WEDDING_CONFIG || {};

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

const weddingDate = CFG.date instanceof Date
    ? CFG.date
    : new Date(CFG.date || "2026-12-27T10:30:00");

const groomName = CFG.groom || "Đô";
const brideName = CFG.bride || "Huệ";


/* =========================================================
   2. HÀM TIỆN ÍCH
========================================================= */

function setText(selector, value) {
    const element = $(selector);

    if (element && value !== undefined && value !== null) {
        element.textContent = value;
    }
}

function setAddressLines(selector, lines, fallback = "") {
    const element = $(selector);

    if (!element) return;

    element.replaceChildren();

    const addressLines = Array.isArray(lines) && lines.length
        ? lines
        : [fallback];

    addressLines.forEach((line, index) => {
        if (index > 0) {
            element.appendChild(document.createElement("br"));
        }

        element.appendChild(
            document.createTextNode(String(line || ""))
        );
    });
}

function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return "";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
}

function pad(number) {
    return String(number).padStart(2, "0");
}


/* =========================================================
   3. HIỂN THỊ THÔNG TIN THIỆP CƯỚI
========================================================= */


function renderWeddingInfo() {
    setText("#groomName", groomName);
    setText("#brideName", brideName);

    setText("#ceremonyTime", CFG.ceremony?.time);
    setText("#ceremonyPlace", CFG.ceremony?.place);

    setAddressLines(
        "#ceremonyAddress",
        CFG.ceremony?.addressLines,
        CFG.ceremony?.address || ""
    );

    setText("#receptionTime", CFG.reception?.time);
    setText("#receptionPlace", CFG.reception?.place);

    setAddressLines(
        "#receptionAddress",
        CFG.reception?.addressLines,
        CFG.reception?.address || ""
    );

    // Liên kết bản đồ
    const ceremonyMap = $("#ceremonyMap");
    if (ceremonyMap && CFG.ceremony?.map) {
        ceremonyMap.href = CFG.ceremony.map;
        ceremonyMap.target = "_blank";
        ceremonyMap.rel = "noopener noreferrer";
    }

    const receptionMap = $("#receptionMap");
    if (receptionMap && CFG.reception?.map) {
        receptionMap.href = CFG.reception.map;
        receptionMap.target = "_blank";
        receptionMap.rel = "noopener noreferrer";
    }

    // Ngày cưới
    const date = new Date(CFG.date);

    if (Number.isNaN(date.getTime())) {
        console.error("Ngày cưới trong config.js không hợp lệ:", CFG.date);
        return;
    }

    const weekday = new Intl.DateTimeFormat("vi-VN", {
        weekday: "long"
    }).format(date);

    const dateLong = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);

    // Ví dụ: Chủ nhật
    setText(
        "#weddingWeekday",
        weekday.charAt(0).toUpperCase() + weekday.slice(1)
    );

    // Ví dụ: 27/12/2026
    setText("#weddingDateLong", dateLong);

    // Cập nhật tất cả phần tử có data-wedding-date
    document.querySelectorAll("[data-wedding-date]").forEach(el => {
        el.textContent = dateLong;
    });
}



/* =========================================================
   4. ĐẾM NGƯỢC NGÀY CƯỚI
========================================================= */

function updateCountdown() {
    const now = new Date();
    const distance = weddingDate.getTime() - now.getTime();

    const days = Math.max(0, Math.floor(distance / 86400000));
    const hours = Math.max(
        0,
        Math.floor((distance % 86400000) / 3600000)
    );
    const minutes = Math.max(
        0,
        Math.floor((distance % 3600000) / 60000)
    );
    const seconds = Math.max(
        0,
        Math.floor((distance % 60000) / 1000)
    );

    setText("#days", pad(days));
    setText("#hours", pad(hours));
    setText("#minutes", pad(minutes));
    setText("#seconds", pad(seconds));
}

function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}


/* =========================================================
   5. NHẠC NỀN
========================================================= */

const backgroundMusic = $("#backgroundMusic");
const musicToggle = $("#musicToggle");

const musicPlaylist = [
    "music/wedding_01.mp3",
    "music/wedding_02.mp3",
    "music/wedding_03.mp3",
    "music/wedding_04.mp3",
    "music/wedding_05.mp3",
    "music/wedding_06.mp3",
    "music/wedding_07.mp3",
    "music/wedding_08.mp3",
    "music/wedding_09.mp3",
    "music/wedding_10.mp3",
    "music/wedding_11.mp3",
    "music/wedding_12.mp3"    
];

let currentTrack = "";
let failedTracks = new Set();
let musicStarted = false;
let isChangingTrack = false;


/**
 * Chọn bài hát ngẫu nhiên, không lặp bài vừa phát.
 */
function getRandomTrack() {
    const availableTracks = musicPlaylist.filter(
        track => track !== currentTrack &&
                 !failedTracks.has(track)
    );

    if (!availableTracks.length) {
        return null;
    }

    return availableTracks[
        Math.floor(Math.random() * availableTracks.length)
    ];
}


/**
 * Cập nhật giao diện nút nhạc.
 */
function updateMusicButton(isPlaying) {
    if (!musicToggle) return;

    musicToggle.textContent = isPlaying ? "Ⅱ" : "♪";

    musicToggle.setAttribute(
        "aria-label",
        isPlaying ? "Tắt nhạc" : "Bật nhạc"
    );

    musicToggle.setAttribute(
        "aria-pressed",
        String(isPlaying)
    );

    musicToggle.classList.toggle("is-playing", isPlaying);
}


/**
 * Phát một bài hát.
 */
function playTrack(track) {
    if (!backgroundMusic || !track) return;

    currentTrack = track;
    isChangingTrack = true;

    backgroundMusic.src = track;
    backgroundMusic.load();

    const playPromise = backgroundMusic.play();

    if (playPromise && typeof playPromise.then === "function") {
        playPromise
            .then(() => {
                musicStarted = true;
                isChangingTrack = false;
                updateMusicButton(true);
            })
            .catch(error => {
                isChangingTrack = false;

                // Không đánh dấu file hỏng nếu trình duyệt chặn autoplay.
                if (error.name === "NotAllowedError") {
                    console.warn(
                        "Trình duyệt chưa cho phép phát nhạc:",
                        track
                    );

                    updateMusicButton(false);
                    return;
                }

                console.warn("Không thể phát nhạc:", track, error);
                updateMusicButton(false);
            });
    } else {
        isChangingTrack = false;
    }
}


/**
 * Chuyển sang bài hát tiếp theo.
 */
function playNextTrack() {
    if (!backgroundMusic || isChangingTrack) return;

    const nextTrack = getRandomTrack();

    if (!nextTrack) {
        console.warn("Không còn bài nhạc hợp lệ để phát.");
        updateMusicButton(false);
        return;
    }

    playTrack(nextTrack);
}


/**
 * Bắt đầu phát nhạc khi người dùng mở thiệp.
 * Hàm này được gọi trực tiếp từ sự kiện click.
 */
function startBackgroundMusic() {
    if (!backgroundMusic || !musicPlaylist.length) return;

    if (musicStarted && !backgroundMusic.paused) {
        return;
    }

    // Nếu đã có bài hát nhưng đang tạm dừng, tiếp tục bài đó.
    if (currentTrack && backgroundMusic.paused &&
        !failedTracks.has(currentTrack)) {

        const playPromise = backgroundMusic.play();

        if (playPromise && typeof playPromise.then === "function") {
            playPromise
                .then(() => {
                    musicStarted = true;
                    updateMusicButton(true);
                })
                .catch(error => {
                    console.warn("Không thể tiếp tục phát nhạc:", error);
                    updateMusicButton(false);
                });
        }

        return;
    }

    playNextTrack();
}


/**
 * Nút bật/tắt nhạc.
 */
function toggleBackgroundMusic() {
    if (!backgroundMusic) return;

    if (backgroundMusic.paused) {
        if (!currentTrack || failedTracks.has(currentTrack)) {
            playNextTrack();
        } else {
            const playPromise = backgroundMusic.play();

            if (playPromise && typeof playPromise.then === "function") {
                playPromise
                    .then(() => {
                        musicStarted = true;
                        updateMusicButton(true);
                    })
                    .catch(error => {
                        console.warn("Không thể bật nhạc:", error);
                        updateMusicButton(false);
                    });
            }
        }
    } else {
        backgroundMusic.pause();
        updateMusicButton(false);
    }
}


/**
 * Tự chuyển bài khi bài hiện tại kết thúc.
 */
function initMusic() {
    if (!backgroundMusic) {
        console.warn("Không tìm thấy #backgroundMusic.");
        return;
    }

    backgroundMusic.addEventListener("ended", () => {
        playNextTrack();
    });

    backgroundMusic.addEventListener("error", () => {
        if (!currentTrack) return;

        const errorCode = backgroundMusic.error?.code;

        console.error("Không thể tải file nhạc:", {
            file: currentTrack,
            code: errorCode,
            message: backgroundMusic.error?.message
        });

        failedTracks.add(currentTrack);

        if (failedTracks.size < musicPlaylist.length) {
            playNextTrack();
        } else {
            console.error("Tất cả file nhạc đều không thể phát.");
            updateMusicButton(false);
        }
    });

    backgroundMusic.addEventListener("play", () => {
        updateMusicButton(true);
    });

    backgroundMusic.addEventListener("pause", () => {
        updateMusicButton(false);
    });

    if (musicToggle) {
        musicToggle.addEventListener(
            "click",
            toggleBackgroundMusic
        );
    }
}


/* =========================================================
   6. MỞ THIỆP CƯỚI
========================================================= */

let invitationOpened = false;

function openInvitation() {
    if (invitationOpened) return;

    invitationOpened = true;

    document.body.classList.remove("invitation-locked");
    document.body.classList.add("invitation-opened");

    const invitation = $("#invitation");

    // Phát nhạc ngay trong thao tác click của người dùng.
    startBackgroundMusic();

    if (invitation) {
        setTimeout(() => {
            invitation.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 150);
    }
}

function initInvitation() {
    const triggers = new Set([
        ...$$("[data-open-invitation]")
    ]);

    const openButton = $("#openInvitation");

    if (openButton) {
        triggers.add(openButton);
    }

    triggers.forEach(element => {
        element.addEventListener("click", event => {
            event.preventDefault();
            openInvitation();
        });
    });
}


/* =========================================================
   7. MENU ĐIỀU HƯỚNG
========================================================= */

function initNavigation() {
    const menuToggle = $(".menu-toggle");
    const mainNav = $(".main-nav");

    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("active");

        menuToggle.classList.toggle("active", isOpen);

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });

    // Đóng menu khi chọn liên kết.
    $$("a", mainNav).forEach(link => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("active");
            menuToggle.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}


/* =========================================================
   8. HIỆU ỨNG KHI CUỘN TRANG
========================================================= */

function initReveal() {
    const elements = $$(".reveal");

    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
        elements.forEach(element => {
            element.classList.add("visible");
        });

        return;
    }

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12
        }
    );

    elements.forEach(element => {
        observer.observe(element);
    });
}


/* =========================================================
   9. THƯ VIỆN ẢNH / LIGHTBOX
========================================================= */

let galleryImages = [];
let currentGalleryIndex = 0;

function initGallery() {
    const galleryItems = $$(".gallery-item");
    const lightbox = $("#lightbox");

    if (!galleryItems.length || !lightbox) return;

    const lightboxImage =
        $("#lightboxImage", lightbox) ||
        $(".lightbox-image img", lightbox) ||
        $("img", lightbox);

    const closeButton =
        $(".lightbox-close", lightbox) ||
        $("[data-lightbox-close]", lightbox);

    const prevButton =
        $(".lightbox-prev", lightbox) ||
        $("[data-lightbox-prev]", lightbox);

    const nextButton =
        $(".lightbox-next", lightbox) ||
        $("[data-lightbox-next]", lightbox);

    galleryImages = galleryItems.map(item => {
        const img = $("img", item);

        return {
            src: item.dataset.full || img?.dataset.full || img?.src || "",
            alt: img?.alt || ""
        };
    });

    function showGalleryImage(index) {
        if (!galleryImages.length || !lightboxImage) return;

        currentGalleryIndex =
            (index + galleryImages.length) % galleryImages.length;

        const image = galleryImages[currentGalleryIndex];

        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;

        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");

        document.body.classList.add("lightbox-open");
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        lightbox.setAttribute("aria-hidden", "true");

        document.body.classList.remove("lightbox-open");
    }

    function showPrevious() {
        showGalleryImage(currentGalleryIndex - 1);
    }

    function showNext() {
        showGalleryImage(currentGalleryIndex + 1);
    }

    galleryItems.forEach((item, index) => {
        item.addEventListener("click", event => {
            event.preventDefault();
            showGalleryImage(index);
        });
    });

    if (closeButton) {
        closeButton.addEventListener("click", closeLightbox);
    }

    if (prevButton) {
        prevButton.addEventListener("click", showPrevious);
    }

    if (nextButton) {
        nextButton.addEventListener("click", showNext);
    }

    // Nhấn ra vùng nền để đóng.
    lightbox.addEventListener("click", event => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    // Điều khiển bằng bàn phím.
    document.addEventListener("keydown", event => {
        if (!lightbox.classList.contains("active")) return;

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "ArrowLeft") {
            showPrevious();
        }

        if (event.key === "ArrowRight") {
            showNext();
        }
    });
}


/* =========================================================
   10. TẠO FILE LỊCH .ICS
========================================================= */

function formatICSDate(date) {
    return date.toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
}

function escapeICS(value) {
    return String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
}

function initCalendar() {
    const calendarLink = $("#calendarLink");

    if (!calendarLink) return;

    calendarLink.addEventListener("click", event => {
        event.preventDefault();

        const start = new Date(weddingDate);
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

        const location = [
            CFG.ceremony?.place || "",
            ...(CFG.ceremony?.addressLines || [])
        ].filter(Boolean).join(", ");

        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Wedding Invitation//Do Hue//VI",
            "CALSCALE:GREGORIAN",
            "BEGIN:VEVENT",
            `UID:${Date.now()}@wedding-dohue`,
            `DTSTAMP:${formatICSDate(new Date())}`,
            `DTSTART:${formatICSDate(start)}`,
            `DTEND:${formatICSDate(end)}`,
            `SUMMARY:${escapeICS(`Đám cưới ${groomName} & ${brideName}`)}`,
            `LOCATION:${escapeICS(location)}`,
            `DESCRIPTION:${escapeICS("Trân trọng kính mời bạn đến chung vui cùng cô dâu và chú rể.")}`,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob(
            [icsContent],
            { type: "text/calendar;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");

        downloadLink.href = url;
        downloadLink.download = "thiep-cuoi-do-hue.ics";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        URL.revokeObjectURL(url);
    });
}


/* =========================================================
   11. RSVP - GỬI ĐĂNG KÝ THAM DỰ
========================================================= */

/**
 * Đọc giá trị từ FormData theo nhiều tên trường.
 * Hỗ trợ cả guestName/name và attendance/attending.
 */
function getFormField(formData, names, defaultValue = "") {
    for (const name of names) {
        const value = formData.get(name);

        if (value !== null && value !== undefined) {
            return String(value).trim();
        }
    }

    return defaultValue;
}


/**
 * Chuẩn hóa câu trả lời tham dự về Có / Không.
 */
function normalizeAttendance(value) {
    const text = String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.,!♡]/g, "")
        .replace(/\s+/g, " ");

    // Khách xác nhận tham dự
    if (
        text === "co" ||
        text.startsWith("co ") ||
        text.includes("minh se den") ||
        text.includes("se tham du")
    ) {
        return "Có";
    }

    // Khách xác nhận không tham dự
    if (
        text === "khong" ||
        text.startsWith("khong ") ||
        text.startsWith("rat tiec") ||
        text.includes("khong the tham du")
    ) {
        return "Không";
    }

    console.warn("Giá trị attendance chưa được nhận diện:", value);

    return "";
}


/**
 * Hiển thị thông báo trong form.
 */
function showFormMessage(message, type = "") {
    const messageElement = $("#formMessage");

    if (!messageElement) {
        console.log(message);
        return;
    }

    messageElement.textContent = message;

    messageElement.classList.remove(
        "success",
        "error",
        "loading"
    );

    if (type) {
        messageElement.classList.add(type);
    }

    messageElement.style.display = "block";
}


/**
 * Gửi dữ liệu RSVP.
 *
 * Apps Script nhận:
 * name
 * attending
 * guestCount
 * message
 *
 * Sử dụng URLSearchParams + no-cors để tránh preflight CORS.
 */
async function submitRSVP(form) {
    const endpoint = CFG.rsvpEndpoint;

    if (!endpoint) {
        showFormMessage(
            "Chưa cấu hình địa chỉ nhận đăng ký. Vui lòng liên hệ cô dâu chú rể.",
            "error"
        );

        return;
    }

    const formData = new FormData(form);

    // Hỗ trợ nhiều cách đặt tên input trong HTML.
    const name = getFormField(
        formData,
        ["guestName", "name", "fullName"]
    );

    const rawAttendance = getFormField(
        formData,
        ["attendance", "attending", "willAttend"]
    );

    const attending = normalizeAttendance(rawAttendance);

    const rawGuestCount = getFormField(
        formData,
        ["guestCount", "numberOfGuests", "guests"],
        "0"
    );

    const message = getFormField(
        formData,
        ["message", "wish", "wishes"]
    );

    if (!name) {
        showFormMessage("Vui lòng nhập họ và tên.", "error");
        return;
    }

    if (!attending) {
        showFormMessage(
            "Vui lòng chọn bạn có tham dự hay không.",
            "error"
        );

        return;
    }

    let guestCount = Number(rawGuestCount);

    if (!Number.isInteger(guestCount) || guestCount < 0) {
        showFormMessage(
            "Số người tham dự không hợp lệ.",
            "error"
        );

        return;
    }

    if (attending === "Không") {
        guestCount = 0;
    }

    const payload = new URLSearchParams();

    payload.append("name", name);
    payload.append("attending", attending);
    payload.append("guestCount", String(guestCount));
    payload.append("message", message);

    const submitButton = $(
        'button[type="submit"], input[type="submit"]',
        form
    );

    const originalButtonText = submitButton
        ? submitButton.textContent
        : "";

    if (submitButton) {
        submitButton.disabled = true;

        if (submitButton.tagName === "BUTTON") {
            submitButton.textContent = "Đang gửi...";
        }
    }

    showFormMessage("Đang gửi thông tin đăng ký...", "loading");

    try {
        await fetch(endpoint, {
            method: "POST",
            mode: "no-cors",
            body: payload
        });

        /*
         * Với no-cors, trình duyệt không cho đọc response.
         * Không được dùng response.json() hoặc response.ok.
         *
         * Vì vậy chỉ thông báo yêu cầu đã được gửi đi,
         * không khẳng định dữ liệu chắc chắn đã ghi vào Sheets.
         */
        showFormMessage(
            "Đã gửi yêu cầu đăng ký. Cảm ơn bạn! Nếu cần xác nhận chắc chắn, vui lòng liên hệ cô dâu chú rể.",
            "success"
        );

        // Không tự reset form để tránh mất dữ liệu
        // khi Apps Script chưa ghi thành công.

    } catch (error) {
        console.error("RSVP error:", error);

        showFormMessage(
            "Không thể gửi yêu cầu. Vui lòng kiểm tra kết nối mạng và thử lại.",
            "error"
        );

    } finally {
        if (submitButton) {
            submitButton.disabled = false;

            if (submitButton.tagName === "BUTTON") {
                submitButton.textContent =
                    originalButtonText || "Gửi xác nhận";
            }
        }
    }
}


/**
 * Khởi tạo form RSVP.
 */
function initRSVP() {
    const form = $("#rsvpForm");

    if (!form) {
        console.warn("Không tìm thấy form #rsvpForm.");
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        submitRSVP(form);
    });
}


/* =========================================================
   12. KHỞI TẠO WEBSITE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    console.log("Wedding invitation: Đô & Huệ");

    renderWeddingInfo();

    initCountdown();

    initMusic();

    initInvitation();

    initNavigation();

    initReveal();

    initGallery();

    initCalendar();

    initRSVP();
});