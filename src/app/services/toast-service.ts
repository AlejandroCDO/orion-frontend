import {inject, Injectable} from '@angular/core';
import {ToastController} from "@ionic/angular";

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastCtrl: ToastController = inject(ToastController);

  async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2000,
      position: 'bottom',
      mode: 'ios',
      cssClass: 'custom-toast',
    });
    await toast.present();
  }
}
