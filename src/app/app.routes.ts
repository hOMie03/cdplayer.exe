import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload';
import { CdBookComponent } from './components/cd-book/cd-book';
import { PlayerComponent } from './components/player/player';

export const routes: Routes = [
    { path: '', component: UploadComponent },
    { path: 'book', component: CdBookComponent },
    { path: 'player', component: PlayerComponent },
    { path: '**', redirectTo: '' }
];
