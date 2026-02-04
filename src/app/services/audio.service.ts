import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AudioService {
    private audio = new Audio();
    isPlaying = signal(false);
    currentTime = signal(0);
    duration = signal(0);

    constructor() {
        this.audio.ontimeupdate = () => this.currentTime.set(this.audio.currentTime);
        this.audio.onloadedmetadata = () => this.duration.set(this.audio.duration);
        this.audio.onended = () => {
            this.isPlaying.set(false);
            this.currentTime.set(0);
        };
    }

    playFile(url: string) {
        this.audio.src = url;
        this.audio.load();
        this.play();
    }

    play() {
        this.audio.play().catch(e => console.error("Play error", e));
        this.isPlaying.set(true);
    }

    pause() {
        this.audio.pause();
        this.isPlaying.set(false);
    }

    seek(time: number) {
        this.audio.currentTime = time;
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying.set(false);
    }
}
