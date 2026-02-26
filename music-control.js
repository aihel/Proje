// Müzik Kontrol Sistemi (Bildirim Panelinde Çalar)
class MusicPlayer {
    constructor() {
        this.audio = new Audio('assets/music/88.m4a');
        this.audio.loop = true;
        this.isPlaying = false;
        this.volume = 0.7;
        
        this.setupControls();
    }
    
    setupControls() {
        const toggleBtn = document.getElementById('music-toggle');
        const volumeSlider = document.getElementById('volume-slider');
        const volumeBtn = document.getElementById('music-volume');
        
        toggleBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pause();
                toggleBtn.textContent = '🔇 Müzik Aç';
            } else {
                this.play();
                toggleBtn.textContent = '🔊 Müzik Kapat';
            }
        });
        
        volumeSlider.addEventListener('input', (e) => {
            this.volume = e.target.value;
            this.audio.volume = this.volume;
            volumeBtn.textContent = this.volume > 0.5 ? '🔊 Ses' : '🔉 Ses';
        });
        
        volumeBtn.addEventListener('click', () => {
            if (this.volume > 0) {
                this.lastVolume = this.volume;
                this.volume = 0;
                volumeSlider.value = 0;
            } else {
                this.volume = this.lastVolume || 0.7;
                volumeSlider.value = this.volume;
            }
            this.audio.volume = this.volume;
            volumeBtn.textContent = this.volume > 0.5 ? '🔊 Ses' : this.volume > 0 ? '🔉 Ses' : '🔇 Ses';
        });
    }
    
    play() {
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
            })
            .catch(e => console.log('Müzik çalınamadı:', e));
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
    }
}

// Müzik başlat
const music = new MusicPlayer();
