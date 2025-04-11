// video-optimizer.service.ts
import { Injectable } from '@angular/core';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { toBlobURL } from '@ffmpeg/util';

@Injectable({
  providedIn: 'root'
})
export class VideoOptimizerService {
  private ffmpeg: FFmpeg;
  private isLoaded = false;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  async loadFFmpeg() {
    if (!this.isLoaded) {
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`/assets/ffmpeg/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`/assets/ffmpeg/ffmpeg-core.wasm`, 'application/wasm')
      });
      this.isLoaded = true;
    }
  }

  async optimizeVideo(file: File, maxSizeMB = 5): Promise<File> {
    await this.loadFFmpeg();
    
    const inputName = 'input.mp4';
    const outputName = 'output.mp4';
    const targetSizeBytes = maxSizeMB * 1024 * 1024;
    
    // 1. Primera pasada - compresión moderada
    let optimizedFile = await this.compressVideo(file, inputName, outputName, 1500);
    
    // 2. Si sigue siendo muy grande, reducir calidad
    if (optimizedFile.size > targetSizeBytes) {
      optimizedFile = await this.compressVideo(file, inputName, outputName, 1000);
    }
    
    // 3. Si aún es muy grande, reducir resolución
    if (optimizedFile.size > targetSizeBytes) {
      optimizedFile = await this.compressVideo(file, inputName, outputName, 800, '640x360');
    }
    
    return optimizedFile;
  }

  private async compressVideo(
    file: File, 
    inputName: string, 
    outputName: string, 
    bitrate: number, 
    scale?: string
  ): Promise<File> {
    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    let command = [
      '-i', inputName,
      '-c:v', 'libx264',
      '-b:v', `${bitrate}k`,
      '-preset', 'fast',
      '-movflags', '+faststart',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-y', outputName
    ];
    
    if (scale) {
      command.splice(8, 0, '-vf', `scale=${scale}`);
    }
    
    await this.ffmpeg.exec(command);
    
    const data = await this.ffmpeg.readFile(outputName);
    return new File([data], file.name, { type: 'video/mp4' });
  }
}