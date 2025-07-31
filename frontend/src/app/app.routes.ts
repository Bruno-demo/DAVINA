import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { HautanalysePageComponent } from './hautanalyse-page/hautanalyse-page.component';
import { HauttypPageComponent } from './hauttyp-page/hauttyp-page.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { WarenkorbComponent } from './warenkorb/warenkorb.component';
import { LiferungformComponent } from './lieferungform/liferungform.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { UserGuard } from './guard/user.guard';
import { ProfilePageComponent } from './profilepage/profilepage.component';
import { AdminPage } from './admin-page/admin-page';
import { AdminGuard } from './guard/admin.guard';

export const routes: Routes = [
  { path: '', component: HomePageComponent, data: { title: 'home' } },
  { path: 'register', component: RegisterComponent, data: { title: 'register' } },
  { path: 'login', component: LoginComponent, data: { title: 'login' } },
  { path: 'profile', component: ProfilePageComponent},
  { path: 'hautanalyse', component: HautanalysePageComponent, data: { title: 'Hautanalyse' } },
  { path: 'hauttype', component: HauttypPageComponent, data: { title: 'hauttype' } },
  { path: 'produkte', component: ProductPageComponent, data: { title: 'Produkte' } },
  { path: 'warenkorb', component: WarenkorbComponent, outlet: 'modal'},
  { path: 'lieferungform', component: LiferungformComponent, data: { title: 'Lieferung', canActivate: [UserGuard] } },
  { path: 'adminpage', component: AdminPage , data: { title: 'admin' }, canActivate: [AdminGuard] },
  { path: 'profilepage', component: ProfilePageComponent , data: { title: 'profile' }},


];
