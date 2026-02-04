import { Component, inject } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  imports: [],
  templateUrl: './upload.html',
  styleUrl: './upload.css'
})
export class UploadComponent {
  library = inject(LibraryService);
  router = inject(Router);

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      await this.library.addFiles(files);
      if (this.library.songs().length > 0) {
        this.router.navigate(['/book']);
      }
    }
  }
}
