
export class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playHit() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playBreak() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playPowerUp() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playLaunch() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  private isMusicPlaying = false;
  private musicOsc: OscillatorNode[] = [];
  private musicGain: GainNode | null = null;

  startMusic() {
    this.init();
    if (!this.ctx || this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    this.musicGain.connect(this.ctx.destination);

    const notes = [220, 261.63, 329.63, 392.00]; // Am7 arpeggio
    
    const playNote = (index: number, time: number) => {
        if (!this.ctx || !this.musicGain || !this.isMusicPlaying) return;
        
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[index % notes.length], time);
        
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(0.5, time + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, time + 2);
        
        osc.connect(g);
        g.connect(this.musicGain);
        
        osc.start(time);
        osc.stop(time + 2);
        
        this.musicOsc.push(osc);
        
        const nextTime = time + 0.5;
        setTimeout(() => playNote(index + 1, nextTime), 500);
    };

    playNote(0, this.ctx.currentTime);
  }

  stopMusic() {
      this.isMusicPlaying = false;
      this.musicOsc.forEach(o => { try { o.stop(); } catch(e) {} });
      this.musicOsc = [];
  }
}

export const soundManager = new SoundManager();
