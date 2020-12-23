import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GeoportalModule } from './geoportal/geoportal.module';

@NgModule({
  declarations: [
    AppComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GeoportalModule
  ],
  exports:[GeoportalModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
