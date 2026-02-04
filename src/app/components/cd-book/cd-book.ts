import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { LibraryService, Song } from '../../services/library.service';
import { Router } from '@angular/router';

interface Album {
  name: string;
  artist: string;
  cover: string;
  songs: Song[];
}

@Component({
  selector: 'app-cd-book',
  templateUrl: './cd-book.html',
  styleUrl: './cd-book.css'
})
export class CdBookComponent implements OnInit {
  library = inject(LibraryService);
  router = inject(Router);
  isOpen = signal(false);
  currentIndex = signal(0);

  albums = computed(() => {
    const songs = this.library.songs();
    const albumMap = new Map<string, Album>();

    songs.forEach(song => {
      const key = song.album || 'Unknown Album';
      if (!albumMap.has(key)) {
        albumMap.set(key, {
          name: key,
          artist: song.artist, // Take artist from first song
          cover: song.cover,   // Take cover from first song
          songs: []
        });
      }
      albumMap.get(key)!.songs.push(song);
    });

    return Array.from(albumMap.values());
  });

  currentAlbum = computed(() => {
    const albums = this.albums();
    return albums[this.currentIndex()];
  });

  ngOnInit() {
    if (this.library.songs().length === 0) {
      this.router.navigate(['/']);
    }
  }

  toggleBook() {
    this.isOpen.update(v => !v);
  }

  nextPage(event: Event) {
    event.stopPropagation();
    if (this.currentIndex() < this.albums().length - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  prevPage(event: Event) {
    event.stopPropagation();
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  playSong(song: Song) {
    if (!this.isOpen()) return;
    // We need to find the global index of this song to pass to player
    // This is a bit inefficient but safe
    const globalIndex = this.library.songs().indexOf(song);
    if (globalIndex !== -1) {
      this.router.navigate(['/player'], { queryParams: { index: globalIndex } });
    }
  }
}
