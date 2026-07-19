// --- Script Điều Khiển Slide Bài Giảng Tương Tác ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Quản lý trạng thái Slides
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    
    let currentSlideIndex = 0;
    const totalSlides = slides.length;

    // Cập nhật trạng thái hiển thị Slide
    function updateSlide() {
        slides.forEach((slide, index) => {
            if (index === currentSlideIndex) {
                slide.classList.add('active');
                
                // Cập nhật số trang động
                const slideNumEl = slide.querySelector('.slide-num');
                if (slideNumEl) {
                    const formattedCurrent = String(index + 1).padStart(2, '0');
                    const formattedTotal = String(totalSlides).padStart(2, '0');
                    slideNumEl.textContent = `${formattedCurrent} / ${formattedTotal}`;
                }
            } else {
                slide.classList.remove('active');
            }
        });

        // Cập nhật thanh tiến độ progress-bar
        const progressPercentage = ((currentSlideIndex + 1) / totalSlides) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Trạng thái nút bấm
        prevBtn.disabled = currentSlideIndex === 0;
        nextBtn.disabled = currentSlideIndex === totalSlides - 1;
    }

    // Sự kiện chuyển slide tiếp theo
    function nextSlide() {
        if (currentSlideIndex < totalSlides - 1) {
            currentSlideIndex++;
            updateSlide();
        }
    }

    // Sự kiện lùi slide trước đó
    function prevSlide() {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            updateSlide();
        }
    }

    // Gắn sự kiện cho nút bấm
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Gắn sự kiện bàn phím (Mũi tên Trái / Phải / Phím Space)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault(); // Tránh cuộn trang
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        }
    });

    // 2. Logic tương tác Từ vựng (Click để ẩn/hiện Pinyin và Nghĩa)
    const vocabItems = document.querySelectorAll('.vocab-item.interactive');
    
    vocabItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const hiddenElements = item.querySelectorAll('.hidden');
            
            if (hiddenElements.length > 0) {
                // Nếu đang ẩn -> Hiện toàn bộ thông tin
                hiddenElements.forEach(el => el.classList.remove('hidden'));
            } else {
                // Nếu đang hiện -> Ẩn bính âm và nghĩa đi để hỏi lại học viên
                const pinyin = item.querySelector('.pinyin');
                const meaning = item.querySelector('.meaning');
                if (pinyin) pinyin.classList.add('hidden');
                if (meaning) meaning.classList.add('hidden');
            }
        });
    });

    // 3. Logic phát âm tương tác sử dụng Web Speech API (Text-to-Speech)
    const phoneticMap = {
        // Thanh mẫu (Initials)
        'b': '玻', 'p': '坡', 'm': '摸', 'f': '佛',
        'd': '得', 't': '特', 'n': '讷', 'l': '勒',
        'g': '哥', 'k': '科', 'h': '喝',
        // Vận mẫu (Finals)
        'a': '啊', 'o': '喔', 'e': '鹅', 'i': '衣', 'u': '乌', 'ü': '迂',
        'ai': '哀', 'ei': '诶', 'ao': '熬', 'ou': '欧', 'an': '安', 'en': '恩'
    };

    function speakChinese(text) {
        if ('speechSynthesis' in window) {
            // Hủy phát âm hiện tại nếu đang đọc dở
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 1.0; // Đọc với tốc độ bình thường (1.0)

            // Tìm giọng đọc tiếng Trung phù hợp
            const voices = window.speechSynthesis.getVoices();
            const zhVoice = voices.find(voice => voice.lang.includes('zh') || voice.lang.includes('ZH'));
            if (zhVoice) {
                utterance.voice = zhVoice;
            }

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Speech synthesis không được hỗ trợ trên trình duyệt này.');
        }
    }

    // Nạp trước danh sách giọng nói để tránh lỗi không tìm thấy voice khi vừa tải trang
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
        }
    }

    // Hiệu ứng click nhấp nháy cho các phần tử phát âm được
    function applyClickFeedback(element) {
        element.classList.add('audio-playing');
        setTimeout(() => {
            element.classList.remove('audio-playing');
        }, 150);
    }

    // Đăng ký phát âm cho Thanh mẫu & Vận mẫu (nếu có)
    const phoneticItems = document.querySelectorAll('.p-item');
    phoneticItems.forEach(item => {
        item.classList.add('playable');
        item.addEventListener('click', () => {
            applyClickFeedback(item);
            const val = item.querySelector('span').textContent.trim();
            const speechText = phoneticMap[val.toLowerCase()] || val;
            speakChinese(speechText);
        });
    });

    // Đăng ký phát âm cho Từ vựng chính
    const vocabItemsInteractive = document.querySelectorAll('.vocab-item.interactive');
    vocabItemsInteractive.forEach(item => {
        item.classList.add('playable');
        item.addEventListener('click', (e) => {
            const zhChar = item.querySelector('.zh-char');
            if (zhChar) {
                applyClickFeedback(item);
                speakChinese(zhChar.textContent.trim());
            }
        });
    });

    // Đăng ký phát âm cho Từ vựng mở rộng
    const customVocabCards = document.querySelectorAll('.custom-vocab-card');
    customVocabCards.forEach(card => {
        card.classList.add('playable');
        card.addEventListener('click', () => {
            const zhChar = card.querySelector('.vocab-badge-zh');
            if (zhChar) {
                applyClickFeedback(card);
                speakChinese(zhChar.textContent.trim());
            }
        });
    });

    // Đăng ký phát âm cho các ô Số đếm
    const numberItems = document.querySelectorAll('.number-item');
    numberItems.forEach(item => {
        item.classList.add('playable');
        item.addEventListener('click', () => {
            const zhChar = item.querySelector('.num-zh');
            if (zhChar) {
                applyClickFeedback(item);
                speakChinese(zhChar.textContent.trim());
            }
        });
    });

    // Đăng ký phát âm cho các Bong bóng hội thoại
    const dialogBubbles = document.querySelectorAll('.dialog-bubble');
    dialogBubbles.forEach(bubble => {
        bubble.classList.add('playable');
        bubble.addEventListener('click', () => {
            const zhText = bubble.querySelector('.zh');
            if (zhText) {
                applyClickFeedback(bubble);
                speakChinese(zhText.textContent.trim());
            }
        });
    });

    // Đăng ký phát âm cho các cụm từ ghép
    const compoundPhrases = document.querySelectorAll('.compound-phrase');
    compoundPhrases.forEach(phrase => {
        phrase.classList.add('playable');
        phrase.addEventListener('click', () => {
            applyClickFeedback(phrase);
            // Lấy phần chữ Hán đứng trước dấu tag Pinyin
            const zhText = phrase.innerHTML.split('<')[0].trim();
            speakChinese(zhText);
        });
    });

    // Đăng ký phát âm cho các dòng danh sách luyện tập có thuộc tính data-pronounce
    const drillItems = document.querySelectorAll('[data-pronounce]');
    drillItems.forEach(item => {
        item.classList.add('playable');
        item.addEventListener('click', () => {
            applyClickFeedback(item);
            const text = item.getAttribute('data-pronounce');
            speakChinese(text);
        });
    });

    // Support swipe gestures on mobile
    let touchstartX = 0;
    let touchendX = 0;
    const slidesContainer = document.querySelector('.slides-container');

    if (slidesContainer) {
        slidesContainer.addEventListener('touchstart', (e) => {
            touchstartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slidesContainer.addEventListener('touchend', (e) => {
            touchendX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 55; // Khoảng cách vuốt tối thiểu (px)
        if (touchendX < touchstartX - swipeThreshold) {
            nextSlide(); // Vuốt sang trái -> Trang tiếp theo
        }
        if (touchendX > touchstartX + swipeThreshold) {
            prevSlide(); // Vuốt sang phải -> Trang trước đó
        }
    }

    // Khởi tạo trạng thái ban đầu
    updateSlide();
});
