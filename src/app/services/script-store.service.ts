import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

@Injectable({
    providedIn: 'root'
  })
  export class ScriptStoreService {
    private scripts: string[] = [
      'js/jquery.min.js',
      'vendor/wow/wow.min.js',
      'vendor/bootstrap/dist/js/bootstrap.bundle.min.js',
      'vendor/bootstrap-select/dist/js/bootstrap-select.min.js',
      'vendor/bootstrap-touchspin/bootstrap-touchspin.js',
      'vendor/swiper/swiper-bundle.min.js',
      'vendor/magnific-popup/magnific-popup.js',
      'vendor/imagesloaded/imagesloaded.js',
      'vendor/masonry/masonry-4.2.2.js',
      'vendor/masonry/isotope.pkgd.min.js',
      'vendor/countdown/jquery.countdown.js',
      'vendor/wnumb/wNumb.js',
      'vendor/nouislider/nouislider.min.js',
      'vendor/slick/slick.min.js',
      'vendor/lightgallery/dist/lightgallery.min.js',
      'vendor/lightgallery/dist/plugins/thumbnail/lg-thumbnail.min.js',
      'vendor/lightgallery/dist/plugins/zoom/lg-zoom.min.js',
      'js/dz.carousel.js',
      'js/dz.ajax.js',
      'js/custom.min.js',
      'js/dashbord-account.js'
    ];
  
    getScripts(): string[] {
      return this.scripts;
    }
  }
