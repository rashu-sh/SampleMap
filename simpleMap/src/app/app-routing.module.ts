import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeoportalComponent } from './geoportal/geoportal.component';


const routes: Routes = [
  { path: '', component: GeoportalComponent},
  
  {path: '**',redirectTo: ''}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
