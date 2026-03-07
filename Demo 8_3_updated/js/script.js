// JavaScript UTF-8 Encoding - Vietnamese Characters Support
// -*- coding: utf-8 -*-

// ===== GLOBAL VARIABLES =====
let isAnimating = false;
let lastHeartTime = 0;
let lastSparkleTime = 0;
let lastMessageTime = 0;
let lastImageTime = 0;
let lastFlowerTime = 0;

// Performance optimization - throttle intervals
const HEART_INTERVAL = 3000; // Increased from 2000
const SPARKLE_INTERVAL = 2000; // Increased from 1000
const MESSAGE_INTERVAL = 2500; // Increased from 1500
const IMAGE_INTERVAL = 4000; // Increased from 2000-4000
const FLOWER_INTERVAL = 500; // Increased from 300

// ===== PERFORMANCE OPTIMIZED FUNCTIONS =====
function throttle(func, delay) {
    return function(...args) {
        const now = Date.now();
        if (now - delay > lastHeartTime) {
            lastHeartTime = now;
            return func.apply(this, args);
        }
    };
}

// Iframe audio system cho smooth cross-page playback
window.iframeAudio = {
    frame: null,
    audio: null,
    isInitialized: false,
    
    init: function() {
        if (this.isInitialized) return;
        
        this.frame = document.getElementById('audioFrame');
        if (!this.frame) return;
        
        // Tạo document trong iframe
        const iframeDoc = this.frame.contentDocument || this.frame.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
            </head>
            <body>
                <audio id="continuousAudio" src="music/Thanh Tan.mp3" loop volume="0.3"></audio>
                <script>
                    window.parent.iframeAudio.audio = document.getElementById('continuousAudio');
                    window.parent.iframeAudio.audio.addEventListener('play', () => {
                        window.parent.iframeAudio.onPlay();
                    });
                    window.parent.iframeAudio.audio.addEventListener('pause', () => {
                        window.parent.iframeAudio.onPause();
                    });
                    window.parent.iframeAudio.audio.addEventListener('timeupdate', () => {
                        window.parent.iframeAudio.onTimeUpdate();
                    });
                    window.parent.iframeAudio.audio.addEventListener('error', (e) => {
                        console.log('❌ Iframe audio error:', e);
                    });
                </script>
            </body>
            </html>
        `);
        iframeDoc.close();
        
        // Load audio ngay
        setTimeout(() => {
            if (this.audio) {
                this.audio.load();
                console.log('🎵 Iframe audio system initialized');
            }
        }, 100);
        
        this.isInitialized = true;
    },
    
    play: function() {
        if (this.audio) {
            this.audio.play().then(() => {
                console.log('✅ Iframe audio playing smoothly');
            }).catch(e => console.log('❌ Iframe audio play failed:', e));
        }
    },
    
    pause: function() {
        if (this.audio) {
            this.audio.pause();
            console.log('⏸️ Iframe audio paused');
        }
    },
    
    setCurrentTime: function(time) {
        if (this.audio) {
            this.audio.currentTime = time;
        }
    },
    
    getCurrentTime: function() {
        return this.audio ? this.audio.currentTime : 0;
    },
    
    onPlay: function() {
        window.isPlaying = true;
        saveMusicState();
    },
    
    onPause: function() {
        window.isPlaying = false;
        saveMusicState();
    },
    
    onTimeUpdate: function() {
        if (window.isPlaying) {
            saveMusicState();
        }
    }
};

// GLOBAL AUDIO ELEMENT - Giải pháp dứt điểm
window.globalMusicAudio = null;

// Function tạo global audio element chỉ một lần
function createGlobalAudio() {
    if (window.globalMusicAudio) return window.globalMusicAudio;
    
    window.globalMusicAudio = new Audio('music/Thanh Tan.mp3');
    window.globalMusicAudio.loop = true;
    window.globalMusicAudio.volume = 0.3;
    window.globalMusicAudio.preload = 'auto';
    
    // Event listeners
    window.globalMusicAudio.addEventListener('play', () => {
        window.isPlaying = true;
        console.log('🎵 Global audio playing');
    });
    
    window.globalMusicAudio.addEventListener('pause', () => {
        window.isPlaying = false;
        console.log('⏸️ Global audio paused');
    });
    
    window.globalMusicAudio.addEventListener('timeupdate', () => {
        // Lưu state mỗi giây
        if (window.isPlaying && Math.floor(window.globalMusicAudio.currentTime) % 1 === 0) {
            saveSimpleMusicState();
        }
    });
    
    window.globalMusicAudio.addEventListener('error', (e) => {
        console.log('❌ Global audio error:', e);
    });
    
    // Load audio
    window.globalMusicAudio.load();
    console.log('🎵 Global audio element created');
    
    return window.globalMusicAudio;
}

// Simple save state
function saveSimpleMusicState() {
    if (!window.globalMusicAudio) return;
    
    const state = {
        isPlaying: window.isPlaying || false,
        currentTime: Math.round(window.globalMusicAudio.currentTime * 100) / 100,
        volume: window.globalMusicAudio.volume,
        timestamp: Date.now()
    };
    
    localStorage.setItem('globalMusicState', JSON.stringify(state));
}

// Simple restore state
function restoreSimpleMusicState() {
    const savedState = localStorage.getItem('globalMusicState');
    if (!savedState || !window.globalMusicAudio) return false;
    
    const state = JSON.parse(savedState);
    console.log('🔄 Restoring global music state:', state);
    
    // Set volume
    window.globalMusicAudio.volume = state.volume || 0.3;
    
    // Set currentTime
    window.globalMusicAudio.currentTime = state.currentTime || 0;
    
    // Play nếu đang playing
    if (state.isPlaying) {
        window.globalMusicAudio.play().then(() => {
            console.log('✅ Global music restored and playing');
            window.isPlaying = true;
        }).catch(e => {
            console.log('❌ Global restore play failed:', e);
            window.isPlaying = false;
        });
    } else {
        window.isPlaying = false;
    }
    
    return true;
}

// Simple play function
function playGlobalMusic() {
    const audio = createGlobalAudio();
    return audio.play().then(() => {
        window.isPlaying = true;
        console.log('✅ Global music playing');
    }).catch(e => {
        console.log('❌ Global play failed:', e);
        window.isPlaying = false;
        throw e;
    });
}

// ===== MUSIC PLAYER WITH PLAYLIST =====
function initMusicPlayer() {
    // Khởi tạo iframe audio system
    window.iframeAudio.init();
    
    // Không cần music player UI nữa, chỉ setup audio cơ bản
    const bgMusic = document.getElementById('bgMusic');
    const autoPlayAudio = document.getElementById('autoPlayAudio');
    
    if (!bgMusic) return;
    
    console.log('🎵 Setting up Thanh Tân music with iframe system...');
    
    // Set initial volume
    bgMusic.volume = 0;
    if (autoPlayAudio) {
        autoPlayAudio.volume = 0;
    }
    
    // Đồng bộ với iframe audio
    if (window.iframeAudio.audio) {
        // Khi iframe audio phát, local audio cũng phát (im lặng để sync)
        window.iframeAudio.audio.addEventListener('play', () => {
            if (!window.isPlaying) {
                console.log('🎵 Iframe audio playing, syncing local audio...');
                bgMusic.src = 'music/Thanh Tan.mp3';
                bgMusic.currentTime = window.iframeAudio.getCurrentTime();
                bgMusic.volume = 0; // Im lặng
                bgMusic.play().catch(e => console.log('Local audio sync failed:', e));
                window.isPlaying = true;
                saveMusicState();
            }
        });
        
        // Khi iframe audio pause, local audio cũng pause
        window.iframeAudio.audio.addEventListener('pause', () => {
            if (window.isPlaying) {
                bgMusic.pause();
                window.isPlaying = false;
                saveMusicState();
            }
        });
        
        // Đồng bộ currentTime liên tục
        setInterval(() => {
            if (window.isPlaying && window.iframeAudio.audio && bgMusic) {
                if (Math.abs(bgMusic.currentTime - window.iframeAudio.getCurrentTime()) > 0.1) {
                    bgMusic.currentTime = window.iframeAudio.getCurrentTime();
                }
            }
        }, 200);
    }
    
    // Luôn phát Thanh Tân
    bgMusic.src = 'music/Thanh Tan.mp3';
}

// Function to save music state
function saveMusicState() {
    if (!window.globalMusicAudio) return;
    
    saveSimpleMusicState();
}

// Auto-save state mỗi giây khi đang phát
setInterval(() => {
    if (window.isPlaying) {
        saveMusicState();
    }
}, 1000);

// Lưu state ngay trước khi chuyển trang
window.addEventListener('beforeunload', function() {
    if (window.isPlaying) {
        saveMusicState();
        console.log('💾 Final state saved before page unload');
    }
});

// Lưu state khi click vào link để chuyển trang
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && window.isPlaying) {
        saveMusicState();
        console.log('💾 State saved before navigation');
    }
});

// Function to restore music state (global)
window.restoreMusicStateGlobal = function() {
    const savedState = sessionStorage.getItem('musicState');
    
    if (savedState && window.iframeAudio.audio) {
        const state = JSON.parse(savedState);
        console.log('🔄 Restoring iframe Thanh Tân state:', state);
        
        if (state.currentSong) {
            // Nếu đang play, tiếp tục phát từ đúng thời điểm
            if (state.isPlaying) {
                // Đợi iframe audio ready rồi set currentTime và play
                const tryPlay = () => {
                    if (window.iframeAudio.audio.readyState >= 2) { // HAVE_CURRENT_DATA
                        window.iframeAudio.setCurrentTime(state.currentTime || 0);
                        console.log('⏰ Iframe currentTime set to:', window.iframeAudio.getCurrentTime());
                        
                        window.iframeAudio.play().then(() => {
                            console.log('✅ Iframe Thanh Tân continued smoothly from time:', window.iframeAudio.getCurrentTime());
                            window.isPlaying = true;
                        }).catch(e => {
                            console.log('❌ Iframe audio play failed:', e);
                        });
                    } else {
                        // Thử lại sau 100ms nếu chưa ready
                        setTimeout(tryPlay, 100);
                    }
                };
                
                tryPlay();
            } else {
                // Nếu đang pause, chỉ set currentTime
                window.iframeAudio.setCurrentTime(state.currentTime || 0);
                console.log('⏸️ Iframe audio paused, time set to:', window.iframeAudio.getCurrentTime());
            }
        }
    } else if (!window.iframeAudio.isInitialized) {
        // Nếu chưa có iframe audio, khởi tạo nó
        window.iframeAudio.init();
    }
};

// ===== FLOWER PAGE FUNCTIONS =====
function initFlowerPage() {
    console.log('🌸 Flower page initialized');
    
    // Tạo global audio
    createGlobalAudio();
    
    // Thử restore state
    const restored = restoreSimpleMusicState();
    
    // Dù restore thành công hay không, cũng đảm bảo nhạc đang phát
    setTimeout(() => {
        if (!window.isPlaying || !window.globalMusicAudio || window.globalMusicAudio.paused) {
            console.log('🌸 Music not playing on flower page, forcing play...');
            playGlobalMusic().then(() => {
                console.log('✅ Thanh Tân forced to play on flower page!');
            }).catch(e => {
                console.log('❌ Forced play failed on flower page, trying user interaction fallback:', e);
                
                // Fallback: đợi user interaction
                const tryPlayAfterInteraction = () => {
                    if (!window.isPlaying || !window.globalMusicAudio || window.globalMusicAudio.paused) {
                        playGlobalMusic().then(() => {
                            console.log('✅ Music started after user interaction on flower page');
                        }).catch(e2 => {
                            console.log('❌ Even user interaction failed on flower page:', e2);
                        });
                    }
                    document.removeEventListener('click', tryPlayAfterInteraction);
                    document.removeEventListener('keydown', tryPlayAfterInteraction);
                    document.removeEventListener('touchstart', tryPlayAfterInteraction);
                };
                
                document.addEventListener('click', tryPlayAfterInteraction, { once: true });
                document.addEventListener('keydown', tryPlayAfterInteraction, { once: true });
                document.addEventListener('touchstart', tryPlayAfterInteraction, { once: true });
            });
        } else {
            console.log('✅ Music already playing on flower page');
        }
    }, 1500);
    
    // Bắt đầu hoạt ảnh hoa sau khi trang tải xong
    setTimeout(() => {
        startFlowerAnimation();
    }, 1000);
    
    // Debug: Kiểm tra trạng thái audio sau 3 giây
    setTimeout(() => {
        console.log('🔍 Flower Page Audio Status:');
        console.log('- Global audio exists:', !!window.globalMusicAudio);
        console.log('- Is playing:', window.isPlaying);
        console.log('- Audio paused:', window.globalMusicAudio?.paused);
        console.log('- Current time:', window.globalMusicAudio?.currentTime);
        
        // Force play lần cuối cùng nếu cần
        if (!window.isPlaying || !window.globalMusicAudio || window.globalMusicAudio.paused) {
            console.log('🔧 FLOWER PAGE FINAL FORCE PLAY...');
            if (window.globalMusicAudio) {
                window.globalMusicAudio.play().then(() => {
                    console.log('✅ FLOWER PAGE FINAL FORCE PLAY SUCCESSFUL!');
                    window.isPlaying = true;
                }).catch(e => {
                    console.log('❌ Flower page final force play failed:', e);
                });
            }
        }
    }, 3000);
}

function startFlowerAnimation() {
    const flowerContainer = document.getElementById('flowerContainer');
    const backButton = document.getElementById('backButton');
    
    if (!flowerContainer) return;
    
    console.log('🌸 Starting flower animation...');
    
    // Hiển thị lời chúc rơi từ trên cao
    setTimeout(() => {
        createFallingMessages();
    }, 2000);
    
    // Hiển thị hình ảnh mẹ rơi từ trên cao
    setTimeout(() => {
        createFallingMotherImages();
    }, 2500);
    
    // Hiển thị nút quay lại
    setTimeout(() => {
        if (backButton) {
            backButton.style.opacity = '1';
            backButton.style.pointerEvents = 'auto';
        }
    }, 4000);
}

function createFallingMessages() {
    // Chỉ tạo lời chúc rơi ở trang flower.html
    if (!window.location.pathname.includes('flower.html')) {
        return;
    }
    
    const container = document.getElementById('fallingMessages');
    if (!container) return;
    
    const messages = [
        '💕 Mẹ yêu con!',
        '🌸 Con chúc mẹ luôn vui vẻ',
        '💖 Mẹ là người tuyệt vời nhất',
        '🌺 Cảm ơn mẹ vì tất cả',
        '💝 Mẹ là món quà quý giá',
        '🌷 Con yêu mẹ rất nhiều',
        '💗 Mẹ mãi là hậu phương vững chắc',
        '🌹 Chúc mẹ luôn khỏe mạnh',
        '💞 Mẹ là ngọn đuốc soi đường',
        '🌸 Con tự hào về mẹ'
    ];
    
    // Tạo 3 lời chúc rơi cùng lúc (giảm từ 4)
    const batchSize = 3; // Giảm số lời chúc rơi cùng lúc
    let messageIndex = 0;
    
    function createBatch() {
        // Tạo batch lời chúc - vô hạn
        for (let i = 0; i < batchSize; i++) {
            setTimeout(() => {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'falling-message';
                
                // Lấy message theo vòng lặp
                const messageText = messages[messageIndex % messages.length];
                messageDiv.textContent = messageText;
                
                // Random position và styling
                messageDiv.style.left = Math.random() * 80 + 10 + '%';
                messageDiv.style.animationDelay = Math.random() * 1 + 's';
                messageDiv.style.fontSize = '16px'; // Font-size cố định, không random
                
                // Random class cho màu sắc khác nhau
                const messageTypes = ['heart-message', 'flower-message', 'love-message'];
                const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
                messageDiv.classList.add(randomType);
                
                container.appendChild(messageDiv);
                
                // Remove sau animation
                setTimeout(() => {
                    messageDiv.remove();
                }, 10000);
                
                messageIndex++;
            }, i * 500); // Tăng lên 500ms để lời chúc rơi thưa hơn, đọc kịp
        }
        
        // Lặp lại tạo batch mới - thưa hơn để đọc kịp
        setTimeout(createBatch, 2500); // Tăng lên 2.5 giây để có thời gian đọc
    }
    
    // Bắt đầu tạo batch đầu tiên
    createBatch();
}

// ===== UTILITY FUNCTIONS =====
// Function tạo chấm vàng nhỏ lấp lánh
function createGoldenDots() {
    const container = document.getElementById('fallingMessages');
    if (!container) return;
    
    // Tạo chấm vàng liên tục
    const createDot = () => {
        const dot = document.createElement('div');
        dot.className = 'golden-dot';
        
        // Random position
        dot.style.left = Math.random() * 100 + '%';
        dot.style.top = Math.random() * 100 + '%';
        
        // Random size
        const size = 2 + Math.random() * 4; // 2-6px
        dot.style.width = size + 'px';
        dot.style.height = size + 'px';
        
        // Random animation delay
        dot.style.animationDelay = Math.random() * 3 + 's';
        
        container.appendChild(dot);
        
        // Remove sau animation
        setTimeout(() => {
            dot.remove();
        }, 6000);
    };
    
    // Tạo nhiều chấm vàng một lúc
    for (let i = 0; i < 15; i++) {
        setTimeout(createDot, i * 200);
    }
    
    // Tạo chấm vàng liên tục
    setInterval(createDot, 1000);
}

function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * window.innerWidth + 'px';
    heart.style.animationDelay = Math.random() * 6 + 's';
    heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
    
    const heartsContainer = document.getElementById('heartsContainer');
    if (heartsContainer) {
        heartsContainer.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 7000);
    }
}

function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.innerHTML = '✨';
    sparkle.style.left = Math.random() * window.innerWidth + 'px';
    sparkle.style.top = Math.random() * window.innerHeight + 'px';
    sparkle.style.animationDelay = Math.random() * 2 + 's';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 2000);
}

function createSparkleParticles() {
    const container = document.getElementById('sparkleContainer');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 3 + 's';
        sparkle.style.animationDuration = (Math.random() * 3 + 2) + 's';
        container.appendChild(sparkle);
    }
}

// Function tạo hiệu ứng nền cho trang chủ
function createFloatingElements() {
    const container = document.getElementById('sparkleContainer');
    if (!container) return;
    
    console.log('✨ Creating floating elements for index page...');
    
    // Tạo các hiệu ứng có sẵn trong HTML
    const existingElements = document.querySelectorAll('.floating-element, .floating-diagonal, .zigzag-float, .wave-float');
    existingElements.forEach(el => {
        el.style.opacity = '1';
        el.style.animation = 'float 6s ease-in-out infinite';
    });
}

// ===== INDEX PAGE FUNCTIONS =====
function initIndexPage() {
    console.log('🏠 Index page initialized - starting music then redirecting...');
    
    // Tạo global audio
    createGlobalAudio();
    
    // Thử restore state trước
    const restored = restoreSimpleMusicState();
    if (!restored) {
        // Nếu không có state, phát mới
        setTimeout(() => {
            playGlobalMusic().then(() => {
                console.log('✅ Music started, now redirecting to letter page...');
                
                // Chuyển trang sau khi nhạc đã bắt đầu
                setTimeout(() => {
                    window.location.href = 'letter.html';
                }, 500);
            }).catch(e => {
                console.log('❌ Music failed, redirecting anyway:', e);
                window.location.href = 'letter.html';
            });
        }, 1000);
    } else {
        // Nếu restore thành công, chuyển trang sau 1 giây
        setTimeout(() => {
            window.location.href = 'letter.html';
        }, 1000);
    }
}

// Function chuyển trang letter mà không làm mất nhạc
function goToLetterPage() {
    console.log('💌 Clicked envelope - going to letter page with music...');
    
    // Lưu trạng thái nhạc trước khi chuyển
    if (window.globalMusicAudio) {
        saveSimpleMusicState();
        console.log('💾 Global music state saved before navigation');
    }
    
    // Chuyển trang
    window.location.href = 'letter.html';
}

// ===== LETTER PAGE FUNCTIONS =====
function initLetterPage() {
    console.log('Letter page initialized');
    
    // Chỉ thêm nội dung lời chúc nếu đang ở trang letter.html
    if (window.location.pathname.includes('letter.html')) {
        // Để trống lá thư, không hiển thị lời chúc
        const letterElement = document.getElementById('letter');
        if (letterElement) {
            letterElement.innerHTML = '';
            console.log('💌 Letter content cleared - no wishes displayed');
        }
    } 
    
    // Tạo global audio
    createGlobalAudio();
    
    // Thử restore state
    const restored = restoreSimpleMusicState();
    
    // Dù restore thành công hay không, cũng đảm bảo nhạc đang phát
    setTimeout(() => {
        if (!window.isPlaying || !window.globalMusicAudio || window.globalMusicAudio.paused) {
            console.log('🎵 Music not playing, forcing play...');
            playGlobalMusic().then(() => {
                console.log('✅ Thanh Tân forced to play on letter page!');
            }).catch(e => {
                console.log('❌ Forced play failed, trying user interaction fallback:', e);
                
                // Fallback: đợi user interaction
                const tryPlayAfterInteraction = () => {
                    if (!window.isPlaying || !window.globalMusicAudio || window.globalMusicAudio.paused) {
                        playGlobalMusic().then(() => {
                            console.log('✅ Music started after user interaction');
                        }).catch(e2 => {
                            console.log('❌ Even user interaction failed:', e2);
                        });
                    }
                    document.removeEventListener('click', tryPlayAfterInteraction);
                    document.removeEventListener('keydown', tryPlayAfterInteraction);
                    document.removeEventListener('touchstart', tryPlayAfterInteraction);
                };
                
                document.addEventListener('click', tryPlayAfterInteraction, { once: true });
                document.addEventListener('keydown', tryPlayAfterInteraction, { once: true });
                document.addEventListener('touchstart', tryPlayAfterInteraction, { once: true });
            });
        } else {
            console.log('✅ Music already playing on letter page');
        }
    }, 1500);
    
    // Tạo các họa tiết động
    createDecorativeElements();
    
    // Debug: Kiểm tra trạng thái audio sau 3 giây
    setTimeout(() => {
        console.log('🔍 Final Audio Status:');
        console.log('- Global audio exists:', !!window.globalMusicAudio);
        console.log('- Is playing:', window.isPlaying);
        console.log('- Audio paused:', window.globalMusicAudio?.paused);
        console.log('- Current time:', window.globalMusicAudio?.currentTime);
        
        // Force play lần cuối cùng nếu cần
        if (!window.isPlaying || !window.globalMusicAudio || window.globalMusicAudio.paused) {
            console.log('🔧 FINAL FORCE PLAY ATTEMPT...');
            if (window.globalMusicAudio) {
                window.globalMusicAudio.play().then(() => {
                    console.log('✅ FINAL FORCE PLAY SUCCESSFUL!');
                    window.isPlaying = true;
                }).catch(e => {
                    console.log('❌ Final force play failed:', e);
                });
            }
        }
    }, 3000);
    
    // Xử lý click vào phong bì
    const envelopeContainer = document.getElementById('envelopeContainer');
    const envelope = document.getElementById('envelope');
    console.log('Envelope container found:', envelopeContainer);
    console.log('Envelope element found:', envelope);
    
    // Gán sự kiện cho container
    if (envelopeContainer) {
        envelopeContainer.addEventListener('click', handleEnvelopeClick);
        console.log('Click event listener added to envelope container');
        
        // Thêm debug hover
        envelopeContainer.addEventListener('mouseenter', () => {
            console.log('Mouse entered envelope container');
        });
    } else {
        console.error('Envelope container not found!');
    }
    
    // Gán sự kiện trực tiếp cho phong bì (backup)
    if (envelope) {
        envelope.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Direct envelope click!');
            handleEnvelopeClick();
        });
        console.log('Direct click listener added to envelope');
    } else {
        console.error('Envelope element not found!');
    }
    
    // Gán sự kiện cho toàn bộ container chính (backup cuối)
    const mainContainer = document.querySelector('.container');
    if (mainContainer) {
        mainContainer.addEventListener('click', (e) => {
            if (e.target.closest('.envelope') || e.target.closest('.envelope-container')) {
                console.log('Container click detected on envelope');
                handleEnvelopeClick();
            }
        });
        console.log('Container click listener added');
    }
}

function createDecorativeElements() {
    const container = document.getElementById('decorativeContainer');
    if (!container) return;
    
    const flowers = ['🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🏵️', '🌼', '🌵', '🌾'];
    const leaves = ['🍃', '🌿', '🍀', '🍁', '🍂'];
    const sparkles = ['✨', '⭐', '💫', '🌟', '💥', '⚡'];
    const stars = ['⭐', '🌟', '✦', '✧', '🌠'];
    const hearts = ['❤️', '💕', '💖', '💗', '💓', '💝'];
    const butterflies = ['🦋', '🦋'];
    const birds = ['🕊️', '🦜', '🦅'];
    const rainbows = ['🌈', '☀️', '🌙', '☁️'];
    
    // Tạo hoa bay lơ lửng (rời rạc hơn)
    for (let i = 0; i < 18; i++) {
        const flower = document.createElement('div');
        flower.className = 'floating-flower';
        flower.innerHTML = flowers[i % flowers.length];
        flower.style.left = (Math.random() * 120 - 20) + '%'; // Bắt đầu từ ngoài màn hình
        flower.style.top = (Math.random() * 100) + '%'; // Thêm vị trí top ngẫu nhiên
        flower.style.animationDelay = Math.random() * 15 + 's'; // Tăng delay
        flower.style.animationDuration = (8 + Math.random() * 8) + 's'; // Tăng duration variety
        flower.style.fontSize = (12 + Math.random() * 16) + 'px'; // Tăng variety size
        container.appendChild(flower);
    }
    
    // Tạo lá bay (rời rạc hơn)
    for (let i = 0; i < 15; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'floating-leaf';
        leaf.innerHTML = leaves[i % leaves.length];
        leaf.style.left = (Math.random() * 120 - 20) + '%'; // Bắt đầu từ ngoài màn hình
        leaf.style.top = (Math.random() * 100) + '%'; // Thêm vị trí top ngẫu nhiên
        leaf.style.animationDelay = Math.random() * 18 + 's'; // Tăng delay
        leaf.style.animationDuration = (10 + Math.random() * 10) + 's'; // Tăng duration variety
        leaf.style.fontSize = (10 + Math.random() * 14) + 'px'; // Tăng variety size
        container.appendChild(leaf);
    }
    
    // Tạo sparkle (rời rạc hơn)
    for (let i = 0; i < 25; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'floating-sparkle';
        sparkle.innerHTML = sparkles[i % sparkles.length];
        sparkle.style.left = (Math.random() * 120 - 20) + '%'; // Bắt đầu từ ngoài màn hình
        sparkle.style.top = (Math.random() * 100) + '%'; // Thêm vị trí top ngẫu nhiên
        sparkle.style.animationDelay = Math.random() * 12 + 's'; // Tăng delay
        sparkle.style.animationDuration = (4 + Math.random() * 6) + 's'; // Tăng variety
        sparkle.style.fontSize = (8 + Math.random() * 12) + 'px'; // Tăng variety size
        container.appendChild(sparkle);
    }
    
    // Tạo hoa xoay quanh container (tăng từ 4 -> 8)
    for (let i = 0; i < 8; i++) {
        const rotatingFlower = document.createElement('div');
        rotatingFlower.className = 'rotating-flower';
        rotatingFlower.innerHTML = flowers[i % flowers.length];
        rotatingFlower.style.left = (10 + i * 10) + '%';
        rotatingFlower.style.top = (5 + Math.random() * 90) + '%';
        rotatingFlower.style.animationDelay = (i * 1.5) + 's';
        rotatingFlower.style.fontSize = (18 + Math.random() * 10) + 'px';
        container.appendChild(rotatingFlower);
    }
    
    // Tạo sao nhấp nháy (tăng từ 5 -> 12)
    for (let i = 0; i < 12; i++) {
        const star = document.createElement('div');
        star.className = 'pulse-star';
        star.innerHTML = stars[i % stars.length];
        star.style.left = (5 + i * 8) + '%';
        star.style.top = (10 + Math.random() * 80) + '%';
        star.style.animationDelay = (i * 0.4) + 's';
        star.style.fontSize = (16 + Math.random() * 8) + 'px';
        container.appendChild(star);
    }
    
    // Thêm trái tim bay (rời rạc hơn)
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = hearts[i % hearts.length];
        heart.style.left = (Math.random() * 120 - 20) + '%'; // Bắt đầu từ ngoài màn hình
        heart.style.top = (Math.random() * 100) + '%'; // Thêm vị trí top ngẫu nhiên
        heart.style.animationDelay = Math.random() * 20 + 's'; // Tăng delay
        heart.style.animationDuration = (7 + Math.random() * 9) + 's'; // Tăng variety
        heart.style.fontSize = (10 + Math.random() * 14) + 'px'; // Tăng variety size
        container.appendChild(heart);
    }
    
    // Thêm bướm bay (rời rạc hơn)
    for (let i = 0; i < 10; i++) {
        const butterfly = document.createElement('div');
        butterfly.className = 'butterfly-fly';
        butterfly.innerHTML = butterflies[i % butterflies.length];
        butterfly.style.left = (Math.random() * 120 - 20) + '%'; // Bắt đầu từ ngoài màn hình
        butterfly.style.top = (Math.random() * 100) + '%'; // Thêm vị trí top ngẫu nhiên
        butterfly.style.animationDelay = Math.random() * 25 + 's'; // Tăng delay
        butterfly.style.animationDuration = (10 + Math.random() * 12) + 's'; // Tăng variety
        butterfly.style.fontSize = (14 + Math.random() * 12) + 'px'; // Tăng variety size
        container.appendChild(butterfly);
    }
    
    // Thêm chim bay (rời rạc hơn)
    for (let i = 0; i < 8; i++) {
        const bird = document.createElement('div');
        bird.className = 'bird-fly';
        bird.innerHTML = birds[i % birds.length];
        bird.style.left = (Math.random() * 120 - 20) + '%'; // Bắt đầu từ ngoài màn hình
        bird.style.top = (Math.random() * 100) + '%'; // Thêm vị trí top ngẫu nhiên
        bird.style.animationDelay = Math.random() * 30 + 's'; // Tăng delay
        bird.style.animationDuration = (12 + Math.random() * 15) + 's'; // Tăng variety
        bird.style.fontSize = (16 + Math.random() * 14) + 'px'; // Tăng variety size
        container.appendChild(bird);
    }
    
    // Thêm cầu vồng nhỏ (rời rạc hơn)
    for (let i = 0; i < 6; i++) {
        const rainbow = document.createElement('div');
        rainbow.className = 'rainbow-float';
        rainbow.innerHTML = rainbows[i % rainbows.length];
        rainbow.style.left = (Math.random() * 120 - 20) + '%'; // Bắt đầu từ ngoài màn hình
        rainbow.style.top = (Math.random() * 100) + '%'; // Vị trí top hoàn toàn ngẫu nhiên
        rainbow.style.animationDelay = Math.random() * 25 + 's'; // Tăng delay
        rainbow.style.animationDuration = (12 + Math.random() * 10) + 's'; // Tăng variety
        rainbow.style.fontSize = (18 + Math.random() * 12) + 'px'; // Tăng variety size
        container.appendChild(rainbow);
    }
    
    // Thêm các hạt sáng xoáy (rời rạc hơn)
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'swirl-particle';
        particle.innerHTML = '✦';
        particle.style.left = (Math.random() * 120 - 20) + '%'; // Bắt đầu từ ngoài màn hình
        particle.style.top = (Math.random() * 100) + '%'; // Vị trí top ngẫu nhiên
        particle.style.animationDelay = Math.random() * 15 + 's'; // Tăng delay
        particle.style.animationDuration = (5 + Math.random() * 7) + 's'; // Tăng variety
        particle.style.fontSize = (6 + Math.random() * 10) + 'px'; // Tăng variety size
        container.appendChild(particle);
    }
    
    // Thêm các vòng tròn phát sáng (mới - 8 cái)
    for (let i = 0; i < 8; i++) {
        const circle = document.createElement('div');
        circle.className = 'glow-circle';
        circle.style.left = (10 + i * 11) + '%';
        circle.style.top = (20 + Math.random() * 60) + '%';
        circle.style.animationDelay = (i * 0.6) + 's';
        circle.style.width = circle.style.height = (8 + Math.random() * 8) + 'px';
        container.appendChild(circle);
    }
}

function handleEnvelopeClick() {
    console.log('Envelope clicked!');
    
    if (isAnimating) {
        console.log('Already animating, ignoring click');
        return;
    }
    
    isAnimating = true;
    console.log('Starting animation');
    
    const envelope = document.getElementById('envelope');
    console.log('Envelope element found:', envelope);
    
    if (envelope) {
        // Mở phong bì
        envelope.classList.add('opened');
        console.log('Added opened class to envelope');
        
        // Chuyển đến trang bó hoa sau 1 giây
        setTimeout(() => {
            console.log('Redirecting to flower.html');
            
            // Lưu trạng thái nhạc trước khi chuyển
            if (window.globalMusicAudio) {
                saveSimpleMusicState();
                console.log('💾 Music state saved before going to flower page');
            }
            
            window.location.href = 'flower.html';
        }, 1000);
    } else {
        console.error('Envelope element not found!');
    }
}

function createFallingMessages() {
    // Chỉ tạo lời chúc rơi ở trang flower.html
    if (!window.location.pathname.includes('flower.html')) {
        return;
    }
    
    const container = document.getElementById('fallingMessages');
    if (!container) return;
    const messages = [
        "🌸 Chúc mẹ 8/3 luôn vui vẻ",
        "👩‍👧‍👦 Mẹ luôn tuyệt vời nhất",
        "🌺 Chúc mẹ 8/3 hạnh phúc",
        "🌻 Mẹ mãi là người tuyệt vời",
        "🌷 Chúc mẹ luôn xinh đẹp",
        "🌼 Con chúc mẹ thật niềm vui",
        "💐 Chúc mẹ luôn khỏe mạnh",
        "🎀 Mẹ là món quà quý giá",
        "🌸 Chúc mẹ luôn cười nhiều",
        "👩‍👧‍👦 Mẹ là người con yêu nhất",
        "🌺 Chúc mẹ 8/3 tràn ngập vui",
        "🌻 Cảm ơn mẹ vì tất cả",
        "🌷 Chúc mẹ luôn hạnh phúc",
        "🌼 Mẹ là người tuyệt vời nhất",
        "💐 Con yêu mẹ rất nhiều",
        "🌸 Chúc mẹ luôn trẻ trung",
        "👩‍👧‍👦 Mẹ là điểm tựa vững chắc",
        "🌺 Chúc mẹ 8/3 thật ý nghĩa",
        "🌻 Mẹ là người con kính nhất",
        "🌷 Chúc mẹ luôn mạnh khỏe",
        "🌼 Con chúc mẹ hạnh phúc mỗi ngày",
        "💐 Chúc mẹ 8/3 thật nhiều vui",
        "🌸 Mẹ là người đặc biệt nhất",
        "👩‍👧‍👦 Chúc mẹ luôn bình an",
        "🌺 Mẹ là tình yêu lớn nhất",
        "🌻 Chúc mẹ thật nhiều sức khỏe",
        "🌷 Mẹ mãi là người con tự hào",
        "🌼 Chúc mẹ luôn rạng rỡ",
        "💐 Mẹ luôn là người tuyệt vời",
        "🌸 Con luôn yêu mẹ rất nhiều",
        "👩‍👧‍👦 Chúc mẹ 8/3 thật nhiều vui",
        "🌺 Mẹ là người con thương nhất",
        "🌻 Chúc mẹ luôn khỏe mạnh",
        "🌷 Mẹ là ánh sáng gia đình",
        "🌼 Chúc mẹ luôn hạnh phúc",
        "💐 Mẹ mãi là người tuyệt vời",
        "🌸 Con luôn biết ơn mẹ",
        "👩‍👧‍👦 Chúc mẹ thật nhiều niềm vui",
        "🌺 Mẹ là người con yêu nhất",
        "🌻 Chúc mẹ 8/3 thật ý nghĩa"
    ];
    
    // Tạo 3 lời chúc rơi cùng lúc (giảm từ 4)
    const batchSize = 3; // Giảm số lời chúc rơi cùng lúc
    let messageIndex = 0;
    
    function createBatch() {
        // Tạo batch lời chúc - vô hạn
        for (let i = 0; i < batchSize; i++) {
            setTimeout(() => {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'falling-message';
                
                // Lấy message theo vòng lặp
                const messageText = messages[messageIndex % messages.length];
                messageDiv.textContent = messageText;
                
                // Ensure proper UTF-8 encoding
                messageDiv.setAttribute('data-encoding', 'utf-8');
                
                // Force proper font rendering
                messageDiv.style.fontFamily = "'Roboto', Arial, sans-serif !important";
                messageDiv.style.unicodeBidi = 'embed';
                messageDiv.style.textRendering = 'optimizeLegibility';
                
                // Random position và styling
                const xPos = Math.random() * (window.innerWidth - 250);
                messageDiv.style.left = xPos + 'px';
                messageDiv.style.top = '-50px';
                messageDiv.style.animationDelay = Math.random() * 1 + 's';
                messageDiv.style.fontSize = '16px'; // Font-size cố định, không random
                
                // Random class cho màu sắc khác nhau
                const types = ['heart-message', 'flower-message', 'love-message'];
                const randomType = types[Math.floor(Math.random() * types.length)];
                messageDiv.classList.add(randomType);
                
                // Ít swaying hơn để dễ đọc
                if (Math.random() > 0.7) { // Chỉ 30% swaying
                    messageDiv.classList.add('swaying');
                }
                
                container.appendChild(messageDiv);
                
                // Remove sau animation
                setTimeout(() => {
                    messageDiv.remove();
                }, 10000);
                
                messageIndex++;
            }, i * 500); // Tăng lên 500ms để lời chúc rơi thưa hơn, đọc kịp
        }
        
        // Lặp lại tạo batch mới - thưa hơn để đọc kịp
        setTimeout(createBatch, 2500); // Tăng lên 2.5 giây để có thời gian đọc
    }
    
    // Bắt đầu tạo batch đầu tiên
    createBatch();
}

// Thêm hàm tạo hình ảnh mẹ rơi từ trên cao
function createFallingMotherImages() {
    const container = document.getElementById('fallingMessages');
    if (!container) return;
    
    // Danh sách các đường dẫn hình ảnh mẹ (dựa trên file thực tế)
    const motherImages = [
        'images/mother1.jpg.jpg',
        'images/mother2.jpg.jpg', 
        'images/mother3.jpg.jpg',
        'images/mother4.jpg.jpg',
        'images/mother5.jpg.jpg',
        'images/mother6.jpg.jpg',
        'images/mother7.jpg.jpg',
        'images/mother8.jpg.jpg',
        'images/mother9.jpg.jpg',
        'images/mother10.jpg.jpg',
        'images/mother11.jpg.jpg',
        'images/mother12.jpg.jpg',
        // Hình ảnh mới đã thêm
        'images/mother13.jpg.jpg',
        'images/mother14.jpg.jpg',
        'images/mother15.jpg.jpg',
        'images/mother16.jpg.jpg',
        'images/mother17.jpg.jpg',
        'images/mother18.jpg.jpg',
        'images/mother19.jpg.jpg',
        'images/mother20.jpg.jpg',
        'images/mother21.jpg.jpg'
    ];
    
    // Nếu bạn chưa có thư mục images, có thể dùng emoji tạm thời (ít nhất có thể)
    const fallbackEmojis = [
        '👩‍👧‍👦', // Mother with children emoji
        '👩‍👧', // Mother with daughter emoji
        '👩‍👦', // Mother with son emoji
        '🌹', // Rose emoji
        '🌸', // Cherry blossom emoji
        '🌺', // Hibiscus emoji
        '🌻', // Sunflower emoji
        '🎀', // Ribbon emoji
        '🌷', // Tulip emoji
        '🌼', // Daisy emoji
    ];
    
    let imageIndex = 0;
    
    const createSingleImage = () => {
        const image = document.createElement('div');
        image.className = 'falling-mother-image';
        
        // Ưu tiên hình ảnh thật - 90% cơ hội dùng hình thật
        const useRealImage = Math.random() > 0.1; // 90% real image, 10% emoji
        
        if (useRealImage && motherImages.length > 0) {
            // Dùng hình ảnh thật
            const imageIndex = Math.floor(Math.random() * motherImages.length);
            const img = document.createElement('img');
            img.src = motherImages[imageIndex];
            img.alt = 'Mother Image';
            
            // Xử lý lỗi nếu không tải được hình
            img.onload = function() {
                console.log('Image loaded successfully:', img.src);
            };
            
            img.onerror = function() {
                // Nếu không tải được hình, dùng emoji thay thế
                console.log('Image failed to load, using emoji fallback:', img.src);
                image.innerHTML = fallbackEmojis[Math.floor(Math.random() * fallbackEmojis.length)];
                image.classList.add('emoji-fallback');
            };
            
            image.appendChild(img);
        } else {
            // Dùng emoji (ít hơn)
            const emojiIndex = Math.floor(Math.random() * fallbackEmojis.length);
            image.innerHTML = fallbackEmojis[emojiIndex];
            image.classList.add('emoji-fallback');
        }
        
        // Random type cho màu sắc đa dạng
        const types = ['mother-image-1', 'mother-image-2', 'mother-image-3'];
        image.classList.add(types[Math.floor(Math.random() * types.length)]);
        
        // Vị trí ngẫu nhiên trên trục X với khoảng cách lớn hơn để rời rạc
        const xPos = Math.random() * (window.innerWidth - 150);
        image.style.left = xPos + 'px';
        
        // Bắt đầu từ trên cao
        image.style.top = '-80px';
        
        // Thêm swaying cho hình ảnh (ít hơn để không bị lỗi)
        if (Math.random() > 0.7) { // Chỉ 30% swaying (giảm từ 50%)
            image.classList.add('swaying');
        }
        
        container.appendChild(image);
        
        // Xóa image sau khi animation kết thúc
        setTimeout(() => {
            image.remove();
        }, 12000);
        
        imageIndex++;
    };
    
    // Tạo hình ảnh liên tục VÔ HẠN - rời rạc từng cái
    const createContinuousImages = () => {
        // Chỉ tạo 1 hình ảnh mỗi lần để rời rạc
        createSingleImage();
    };
    
    // Bắt đầu ngay lập tức với delay ngẫu nhiên
    setTimeout(() => {
        createContinuousImages();
    }, Math.random() * 2000); // Random start 0-2s
    
    // Lặp lại mỗi 4 giây để tạo dòng chảy rời rạc và giảm lag
    setInterval(() => {
        const now = Date.now();
        if (now - lastImageTime >= IMAGE_INTERVAL) {
            lastImageTime = now;
            createContinuousImages();
        }
    }, IMAGE_INTERVAL);
    
    // Thêm thêm hình ảnh ngẫu nhiên nhưng ít hơn để giảm performance
    setInterval(() => {
        if (Math.random() > 0.8) { // Chỉ 20% cơ hội (giảm từ 30%)
            const now = Date.now();
            if (now - lastImageTime >= IMAGE_INTERVAL * 0.5) {
                lastImageTime = now;
                createContinuousImages();
            }
        }
    }, IMAGE_INTERVAL * 1.5); // 3-5 giây random interval
}

function createFlowerBranches(container) {
    if (!container) return;
    
    const colors = [
        // Rose colors - deep reds and pinks
        '#ff006e', '#ff4081', '#ff6b9d', '#ff1744', '#d50000',
        '#c2185b', '#e91e63', '#f06292', '#ff4081', '#ff80ab',
        '#f8bbd0', '#fce4ec', '#fff0f5', '#ffe0ec', '#ffd1dc',
        
    ];
    
    // Create flowers CONTINUOUSLY - never stop
    let flowerIndex = 0;
    
    const createContinuousFlower = () => {
        createSingleFlower(container, colors, flowerIndex);
        flowerIndex++;
        
        // Log creation
        console.log(`Created continuous flower ${flowerIndex}`);
    };
    
    // Start immediately
    createContinuousFlower();
    
    // Create new flower every 500ms - reduced frequency to prevent lag
    setInterval(() => {
        const now = Date.now();
        if (now - lastFlowerTime >= FLOWER_INTERVAL) {
            lastFlowerTime = now;
            createContinuousFlower();
        }
    }, FLOWER_INTERVAL);
    
    // Create extra flowers randomly for density (reduced frequency)
    setInterval(() => {
        if (Math.random() > 0.5) { // 50% chance (reduced from 70%)
            const now = Date.now();
            if (now - lastFlowerTime >= FLOWER_INTERVAL * 0.7) {
                lastFlowerTime = now;
                createContinuousFlower();
            }
        }
    }, FLOWER_INTERVAL * 1.5); // 750ms instead of 500ms
    
    console.log('Started continuous flower rain - never stops!');
}

function createSingleFlower(container, colors, index) {
    // Create branch
    const branch = document.createElement('div');
    branch.className = 'flower-branch';
    
    // Create flower container
    const flower = document.createElement('div');
    flower.className = 'flower';
    flower.style.width = '25px';
    flower.style.height = '25px';
    flower.style.position = 'relative';
    flower.style.margin = '0 auto';
    
    // Create 12 petals with SIMPLE approach
    for (let j = 0; j < 12; j++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        
        // Simple styling that WORKS
        const angle = j * 30; // 30 degrees apart
        const color = colors[j % colors.length];
        
        petal.style.cssText = `
            position: absolute;
            width: 16px;
            height: 26px;
            background: linear-gradient(135deg, ${color}, ${colors[(j+1) % colors.length]});
            border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
            top: 50%;
            left: 50%;
            transform-origin: center bottom;
            transform: translate(-50%, -50%) rotate(${angle}deg) translateY(-15px);
            opacity: 1;
            z-index: 5;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        `;
        
        flower.appendChild(petal);
    }
    
    // Create center with SIMPLE approach
    const center = document.createElement('div');
    center.className = 'flower-center';
    center.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: radial-gradient(circle, #fff, #ffeb3b, #ff9800);
        border-radius: 50%;
        top: 30%;
        left: 30%;
        z-index: 10;
        opacity: 1;
        box-shadow: 0 0 20px rgba(255,235,59,0.8);
    `;
    
    flower.appendChild(center);
    
    // Create stem
    const stem = document.createElement('div');
    stem.className = 'stem';
    stem.style.cssText = `
        width: 3px;
        height: 50px;
        background: linear-gradient(to bottom, #4caf50, #2e7d32);
        margin: 0 auto;
        position: relative;
    `;
    
    // Assemble
    branch.appendChild(flower);
    branch.appendChild(stem);
    
    // Position and animate
    branch.style.cssText = `
        position: absolute;
        left: ${Math.random() * (window.innerWidth - 50)}px;
        top: -100px;
        transform: scale(0.3);
        opacity: 0;
        transition: all 2s ease-in-out;
    `;
    
    container.appendChild(branch);
    
    // Start falling immediately with natural swaying motion
    setTimeout(() => {
        const startX = Math.random() * (window.innerWidth - 50);
        const swayAmount = (Math.random() - 0.5) * 300; // -150px to +150px
        const midX = startX + swayAmount * 0.5;
        const endX = startX + swayAmount;
        
        branch.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${window.innerHeight + 100}px;
            transform: scale(1) rotate(${Math.random() * 360}deg);
            opacity: 1;
            transition: all 8s cubic-bezier(0.4, 0, 0.6, 1);
        `;
        
        // Add natural wave movement during fall
        setTimeout(() => {
            branch.style.left = `${midX}px`;
            branch.style.transform = `scale(1.1) rotate(${Math.random() * 360}deg)`;
        }, 2000); // 1/4 through fall
        
        setTimeout(() => {
            branch.style.left = `${endX}px`;
            branch.style.transform = `scale(1) rotate(${Math.random() * 360}deg)`;
        }, 4000); // Halfway through fall
        
        setTimeout(() => {
            branch.style.left = `${midX + swayAmount * 0.3}px`;
            branch.style.transform = `scale(0.9) rotate(${Math.random() * 360}deg)`;
        }, 6000); // 3/4 through fall
    }, Math.random() * 2000); // Random start 0-2s
    
    // Auto cleanup after falling
    setTimeout(() => {
        branch.remove();
        console.log(`Cleaned up flower ${index + 1}`);
    }, 10000); // Remove after 10 seconds
    
    console.log(`Created flower ${index + 1} with 12 petals`);
}

// Function setup cho trang 1
function setupPage1AutoPlay() {
    const autoplayTrigger = document.getElementById('autoplayTrigger');
    const autoPlayAudio = document.getElementById('autoPlayAudio');
    const bgMusic = document.getElementById('bgMusic');
    
    if (!autoplayTrigger || !autoPlayAudio || !bgMusic) return;
    
    console.log('🎵 Setting up page 1 overlay auto-play with iframe system...');
    
    // Khởi tạo iframe audio system
    window.iframeAudio.init();
    
    // Khi user click overlay
    autoplayTrigger.addEventListener('click', function() {
        console.log('🖱️ User clicked overlay - starting iframe auto-play...');
        
        // Ẩn overlay ngay lập tức
        autoplayTrigger.style.display = 'none';
        
        // Phát nhạc với iframe audio
        window.iframeAudio.play().then(() => {
            console.log('✅ Iframe Thanh Tân started smoothly!');
            window.isPlaying = true;
            
            // Lưu trạng thái
            const autoState = {
                isPlaying: true,
                currentSong: 'music/Thanh Tan.mp3',
                currentTime: 0,
                volume: 0.3,
                currentSongIndex: 0
            };
            sessionStorage.setItem('musicState', JSON.stringify(autoState));
            
            // Đồng bộ với local audio elements (im lặng)
            if (autoPlayAudio) {
                autoPlayAudio.src = 'music/Thanh Tan.mp3';
                autoPlayAudio.currentTime = 0;
                autoPlayAudio.volume = 0;
                autoPlayAudio.play().catch(e => console.log('Auto-play audio sync failed:', e));
            }
            
            if (bgMusic) {
                bgMusic.src = 'music/Thanh Tan.mp3';
                bgMusic.currentTime = 0;
                bgMusic.volume = 0;
                bgMusic.play().catch(e => console.log('BG music sync failed:', e));
            }
        }).catch(e => {
            console.log('❌ Iframe auto-play failed:', e);
        });
    });
    
    // Auto-click sau 3 giây nếu user không click
    setTimeout(() => {
        if (autoplayTrigger.style.display !== 'none') {
            console.log('⏰ Auto-clicking overlay after timeout...');
            autoplayTrigger.click();
        }
    }, 3000);
}

// ===== LETTER PAGE FUNCTIONS =====
function initializeApp() {
    console.log('🚀 Initializing app...');
    
    // Khởi tạo các hiệu ứng riêng cho từng trang
    const currentPage = window.location.pathname.split('/').pop();
    console.log('📄 Current page:', currentPage);
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initIndexPage();
            break;
        case 'flower.html':
            initFlowerPage();
            break;
        case 'letter.html':
            initLetterPage();
            break;
    }
    
    // Global music restore cho tất cả các trang (trừ index.html vì sẽ chuyển ngay)
    if (currentPage !== 'index.html' && currentPage !== '') {
        if (window.restoreMusicStateGlobal) {
            window.restoreMusicStateGlobal();
        }
    } else {
        // Trang index.html cũng cần restore để phát nhạc
        if (window.restoreMusicStateGlobal) {
            window.restoreMusicStateGlobal();
        }
    }
    
    // Only initialize music player if music player UI exists (page 2)
    const musicPlayer = document.getElementById('musicPlayer');
    if (musicPlayer) {
        console.log('🎵 Music player UI found, initializing...');
        initMusicPlayer();
    } else {
        console.log('🔇 No music player UI found');
    }
    
    // Đảm bảo nhạc phát khi trang trở nên visible
    document.addEventListener('visibilitychange', function() {
        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic && !document.hidden) {
            const savedState = sessionStorage.getItem('musicState');
            if (savedState) {
                const state = JSON.parse(savedState);
                if (state.isPlaying && bgMusic.paused) {
                    console.log('👁️ Page visible, resuming music...');
                    bgMusic.play().catch(e => console.log('Visibility change play failed:', e));
                }
            }
        }
    });
    
    // Thử phát nhạc khi có user interaction đầu tiên
    const firstInteraction = () => {
        const bgMusic = document.getElementById('bgMusic');
        const savedState = sessionStorage.getItem('musicState');
        
        if (bgMusic && savedState) {
            const state = JSON.parse(savedState);
            if (state.isPlaying && bgMusic.paused) {
                bgMusic.play().then(() => {
                    console.log('✅ Music started on first interaction');
                }).catch(e => console.log('First interaction play failed:', e));
            }
        }
        
        // Remove listener sau lần tương tác đầu tiên
        document.removeEventListener('click', firstInteraction);
        document.removeEventListener('keydown', firstInteraction);
        document.removeEventListener('touchstart', firstInteraction);
    };
    
    // Thêm các event listener cho interaction đầu tiên
    document.addEventListener('click', firstInteraction, { once: true });
    document.addEventListener('keydown', firstInteraction, { once: true });
    document.addEventListener('touchstart', firstInteraction, { once: true });
    
    // Khởi tạo hiệu ứng chung với throttling để giảm lag
    setInterval(() => {
        const now = Date.now();
        if (now - lastHeartTime >= HEART_INTERVAL) {
            lastHeartTime = now;
            createHeart();
        }
    }, HEART_INTERVAL);
    
    setInterval(() => {
        const now = Date.now();
        if (now - lastSparkleTime >= SPARKLE_INTERVAL) {
            lastSparkleTime = now;
            createSparkle();
        }
    }, SPARKLE_INTERVAL);
}

// ===== START APP =====
document.addEventListener('DOMContentLoaded', initializeApp);
