/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
export const FILE_KEY = 'files';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  uploadText;
  downloadText;

  downloadURL2 ='../../assets/dummy.pdf';
  downloadProgress = 0;
  downloadURL='';
  myFiles=[];

  constructor(
    private fileOpener: FileOpener,
    private http: HttpClient
  ) {

    this.loadFiles();
  }
 async loadFiles(){
  const videoList = await Preferences.get({key: FILE_KEY});
  this.myFiles = JSON.parse(videoList.value) || [];
 }
  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      // eslint-disable-next-line new-parens
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  getMineType(name) {
    if (name.indexOf('pdf') >= 0) {
      return 'application/pdf';
    } else if (name.indexOf('png') >= 0) {
      return 'image/png';
    } else if (name.indexOf('mp4') >= 0) {
      return 'video/mp4';
    }
  }

  downloadFile() {
    this.http
      .get(this.downloadURL2, {
        responseType: 'blob',
        reportProgress: true,
        observe: 'events',
      })
      .subscribe(async (event) => {
        console.log('event', event);
        if (event.type === HttpEventType.DownloadProgress) {
          this.downloadProgress = Math.round(
            (100 * event.loaded) / event.total
          );
        } else if (event.type === HttpEventType.Response) {
          this.downloadProgress = 0;
          const name = this.downloadURL.substring(
            this.downloadURL.lastIndexOf('/') + 1
          );
          const base64 = (await this.convertBlobToBase64(event.body)) as string;

          const foo = await Filesystem.writeFile({
            path: name,
            data: base64,
            directory: Directory.Documents,
          });
          console.log('ppppp', foo);
          const path = foo.uri;
          const mimetype = this.getMineType(name);

          this.fileOpener.open(path, mimetype)
          .then(()=>console.log('File Opened'))
          .catch(error => console.log('Error in opening', error));
          this.myFiles.unshift(path);

          Preferences.set({
            key: FILE_KEY,
            value: JSON.stringify(this.myFiles)
          });
        }
      });
  }

}
