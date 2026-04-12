import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { SkinAnalysisPageComponent } from './skin-analysis-page/skin-analysis-page.component';
import { SkinTypePageComponent } from './skin-type-page/skin-type-page.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { CartComponent } from './cart/cart.component';
import { CartProductComponent } from './cart-product/cart-product.component';
import { CheckoutComponent } from './checkout/checkout.component';
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
    SkinAnalysisPageComponent,
    SkinTypePageComponent,
    ProductPageComponent,
    CartComponent,
    CartProductComponent,
    CheckoutComponent,
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
