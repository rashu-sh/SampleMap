import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'src/assets/L.Control.ZoomBar.js';
import { HttpClient } from '@angular/common/http';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-geoportal',
  templateUrl: './geoportal.component.html',
  styleUrls: ['./geoportal.component.scss']
})
export class GeoportalComponent  implements AfterViewInit {
  private map;
  coordinates: string='24 , 78';
  timer: any;
  elevation: string;
  address:string='';
  constructor(
    private http: HttpClient,

  ) { }

  ngAfterViewInit() {
    this.initMap();
    this.addBaseLayer();
  }

  initMap() {
    this.map = L.map('mapId', {
      center: [ 22, 78 ],
      zoom: 5,
      minZoom:4,
      scrollWheelZoom: false,
      attribution:false,
      zoomControl: false                // set to false to disable native zoomControl
    });
    new L.Control.ZoomBar({position: 'topright'}).addTo(this.map);
    this.coordinateReadout();
  }

  coordinateReadout(){
    let that = this;
    this.map.on('mousemove', function (e: L.LeafletMouseEvent) {
      that.coordinates = e.latlng.lat.toFixed(4) + ',' + e.latlng.lng.toFixed(4);
      clearTimeout(that.timer);
      that.timer = setTimeout(() => { that.elevationReadout(e) }, 300);
    });

    this.map.on('click', function (e: L.LeafletMouseEvent) {
      let lat=e.latlng.lat, lng =e.latlng.lng;
      let url = "https://api.opencagedata.com/geocode/v1/json?q="+lat+","+lng+"&key=76ddb97bf5594c4784af3fc0e6506911&pretty=1"   
      that.getHTTPData(url).subscribe((res: any) => {      
        if(res&& res['status']['code']==200){
        console.log('RES:::::::::',res['results'][0]['formatted']);

          that.address = res['results'][0]['formatted'];
          console.log('\n\n ',that.address);
          
        }
      });   
    });
  }

  elevationReadout(e) {
    let lat=e.latlng.lat, lng =e.latlng.lng;
    let url= "https://elevation-api.io/api/elevation?points=("+lat+","+lng+")";
    this.getHTTPData(url).subscribe((res: any) => {      
      if (res && res['elevations'].length > 0) {
        this.elevation = res['elevations'][0]['elevation'] + 'm';
      }
    });
  }

  getHTTPData(url){
  return this.http.get(url).pipe(
    catchError((err) => {
      return EMPTY;
    })
  );
  }
  addBaseLayer(){

    const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
      //https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png
      // https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
      maxZoom: 19,
      // attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }
}

