import { Injectable } from '@angular/core';
import * as musicMetadata from 'music-metadata-browser';
import { Buffer } from 'buffer';

// Polyfill buffer if needed for the browser
(window as any).Buffer = Buffer;

@Injectable({
    providedIn: 'root'
})
export class MetadataService {
    async getMetadata(file: File) {
        try {
            return await musicMetadata.parseBlob(file);
        } catch (error) {
            console.error("Metadata parsing error", error);
            return null;
        }
    }
}
