import { Injectable, signal } from '@angular/core';
import { MetadataService } from './metadata.service';

export interface Song {
    file: File;
    title: string;
    artist: string;
    album: string; // [NEW] Added album field
    cover: string;
    duration: number;
}

@Injectable({ providedIn: 'root' })
export class LibraryService {
    songs = signal<Song[]>([]);
    loading = signal(false);

    constructor(private metadataService: MetadataService) { }

    async addFiles(files: File[]) {
        this.loading.set(true);
        const newSongs: Song[] = [];

        // Process sequentially to not freeze UI too much, or use play for parallel
        for (const file of files) {
            const meta = await this.metadataService.getMetadata(file);
            let cover = 'assets/default-cd.png';

            if (meta && meta.common.picture && meta.common.picture.length > 0) {
                const pic = meta.common.picture[0];
                const base64 = this.arrayBufferToBase64(pic.data);
                cover = `data:${pic.format};base64,${base64}`;
            }

            newSongs.push({
                file,
                title: meta?.common.title || file.name.replace(/\.[^/.]+$/, ""),
                artist: meta?.common.artist || 'Unknown Artist',
                album: meta?.common.album || 'Unknown Album', // [NEW] Map album
                cover,
                duration: meta?.format.duration || 0
            });
        }

        this.songs.update(current => [...current, ...newSongs]);
        this.loading.set(false);
    }

    private arrayBufferToBase64(buffer: Uint8Array): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        // Chunking to avoid stack overflow on large images
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}
