import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { HautanalysePageComponent } from './hautanalyse-page/hautanalyse-page.component';
import { HauttypPageComponent } from './hauttyp-page/hauttyp-page.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { WarenkorbComponent } from './warenkorb/warenkorb.component';
import { ProductwarencorbComponent } from './productwarencorb/productwarencorb.component';
import { LiferungformComponent } from './lieferungform/liferungform.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AdminPage } from './admin-page/admin-page';
import { OrderlistAdmin } from './orderlist-admin/orderlist-admin';
import { ProductlistAdmin } from './productlist-admin/productlist-admin';
import { Userlistadmin } from './userlistadmin/userlistadmin';

import { UserGuard } from './guard/user.guard';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    HautanalysePageComponent,
    HauttypPageComponent,
    ProductPageComponent,
    WarenkorbComponent,
    ProductwarencorbComponent,
    LiferungformComponent,
    RegisterComponent,
    LoginComponent,
    AdminPage,
    OrderlistAdmin,
    ProductlistAdmin,
    Userlistadmin
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    FontAwesomeModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    UserGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
