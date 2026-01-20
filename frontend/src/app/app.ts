import { Component, OnInit, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AudioService } from './audio.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private route = inject(ActivatedRoute);
  private audioService = inject(AudioService);

  playlist = signal<string[]>([]);
  currentIndex = signal<number>(0);
  currentDir = signal<string>('');

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const dir = params['dir'];
      if (dir) {
        this.currentDir.set(dir);
        this.loadPlaylist(dir);
      }
    });
  }

  loadPlaylist(dir: string) {
    this.audioService.getFiles(dir).subscribe({
      next: (files) => {
        this.playlist.set(files);
        this.currentIndex.set(0);
      },
      error: (err) => {
        console.error('Failed to load playlist', err);
        this.playlist.set([]);
      }
    });
  }

  get currentTrackUrl() {
    const files = this.playlist();
    if (files.length === 0) return '';
    // Encode the path to handle special characters, but keep slashes
    const path = files[this.currentIndex()].split('/').map(segment => encodeURIComponent(segment)).join('/');
    return `/music/${path}`;
  }

  get currentTrackName() {
    const files = this.playlist();
    if (files.length === 0) return 'No tracks loaded';
    const path = files[this.currentIndex()];
    return path.split('/').pop() || path;
  }

  playTrack(index: number) {
    this.currentIndex.set(index);
    // Use timeout to ensure the src is updated before playing if we're manually triggering it
    setTimeout(() => {
      if (this.audioPlayer) {
        this.audioPlayer.nativeElement.load();
        this.audioPlayer.nativeElement.play();
      }
    }, 0);
  }

  onEnded() {
    this.next();
  }

  next() {
    const list = this.playlist();
    if (list.length === 0) return;
    const nextIndex = this.currentIndex() + 1;
    if (nextIndex < list.length) {
      this.playTrack(nextIndex);
    }
  }

  prev() {
    const list = this.playlist();
    if (list.length === 0) return;
    const prevIndex = this.currentIndex() - 1;
    if (prevIndex >= 0) {
      this.playTrack(prevIndex);
    }
  }
}
