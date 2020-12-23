import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-geoportal',
  templateUrl: './geoportal.component.html',
  styleUrls: ['./geoportal.component.scss']
})
export class GeoportalComponent  implements AfterViewInit {
  private map;

  constructor() { }

  ngAfterViewInit() {
    this.initMap();
    this.addBaseLayer();
  }

  initMap() {
    this.map = L.map('mapId', {
      center: [ 24.8282, 72.5795 ],
      zoom: 4,
      scrollWheelZoom: false

    });
  }

  addBaseLayer(){

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }
}

