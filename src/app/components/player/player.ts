import { Component, inject, OnInit, OnDestroy, signal, ElementRef, ViewChild, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LibraryService, Song } from '../../services/library.service';
import { AudioService } from '../../services/audio.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-player',
  templateUrl: './player.html',
  styleUrl: './player.css',
  imports: [DatePipe]
})
export class PlayerComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  library = inject(LibraryService);
  audio = inject(AudioService);
  ngZone = inject(NgZone);

  @ViewChild('spinningCd') spinningCd!: ElementRef<HTMLDivElement>;

  currentIndex = signal(0);

  // Animation state
  rotation = 0;
  rotationSpeed = 0;
  readonly MAX_SPEED = 2; // Degrees per frame
  readonly DAMPING = 0.98;
  animId: number | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (this.library.songs().length === 0) {
        this.router.navigate(['/']);
        return;
      }

      if (params['index'] !== undefined) {
        this.currentIndex.set(+params['index']);
        this.loadSong();
      } else {
        this.router.navigate(['/book']);
      }
    });

    this.startAnimationLoop();
  }

  startAnimationLoop() {
    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        if (this.audio.isPlaying()) {
          if (this.rotationSpeed < this.MAX_SPEED) {
            this.rotationSpeed += 0.05; // Acceleration
          }
        } else {
          this.rotationSpeed *= this.DAMPING; // Deceleration
        }

        // Clamp low speed to 0
        if (this.rotationSpeed < 0.01 && !this.audio.isPlaying()) this.rotationSpeed = 0;

        this.rotation = (this.rotation + this.rotationSpeed) % 360;

        if (this.spinningCd && this.spinningCd.nativeElement) {
          this.spinningCd.nativeElement.style.transform = `rotate(${this.rotation}deg)`;
        }

        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    });
  }

  loadSong() {
    const song = this.currentSong;
    if (song) {
      const url = URL.createObjectURL(song.file);
      this.audio.playFile(url);
    }
  }

  get currentSong(): Song | undefined {
    return this.library.songs()[this.currentIndex()];
  }

  togglePlay() {
    if (this.audio.isPlaying()) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
  }

  next() {
    if (this.currentIndex() < this.library.songs().length - 1) {
      this.currentIndex.update(i => i + 1);
      this.loadSong();
    }
  }

  prev() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
      this.loadSong();
    }
  }

  seek(event: Event) {
    const input = event.target as HTMLInputElement;
    this.audio.seek(+input.value);
  }

  backToBook() {
    this.audio.stop();
    this.router.navigate(['/book']);
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    this.audio.stop();
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }
}
