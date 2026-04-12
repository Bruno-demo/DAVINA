import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { SkinAnalysisPageComponent } from './skin-analysis-page/skin-analysis-page.component';
import { SkinTypePageComponent } from './skin-type-page/skin-type-page.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { UserGuard } from './guard/user.guard';
import { ProfilePageComponent } from './profilepage/profilepage.component';
import { AdminPage } from './admin-page/admin-page';
import { AdminGuard } from './guard/admin.guard';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { SavedAddressesComponent } from './saved-addresses/saved-addresses.component';
import { ComparisonComponent } from './comparison/comparison.component';
import { GiftCardsComponent } from './gift-cards/gift-cards.component';
import { SupportComponent } from './support/support.component';
import { ShippingComponent } from './info-pages/shipping/shipping.component';
import { ReturnsComponent } from './info-pages/returns/returns.component';
import { ContactComponent } from './info-pages/contact/contact.component';
import { TermsComponent } from './info-pages/terms/terms.component';
import { PrivacyComponent } from './info-pages/privacy/privacy.component';
import { PaystackCallbackComponent } from './checkout/paystack-callback.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { GuestGuard } from './guard/guest.guard';

export const routes: Routes = [
  { path: '', component: HomePageComponent, data: { title: 'Home' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Sign up' }, canActivate: [GuestGuard] },
  { path: 'login', component: LoginComponent, data: { title: 'Log in' }, canActivate: [GuestGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, data: { title: 'Forgot Password' }, canActivate: [GuestGuard] },
  { path: 'reset-password', component: ResetPasswordComponent, data: { title: 'Reset Password' }, canActivate: [GuestGuard] },
  { path: 'verify-email', component: VerifyEmailComponent, data: { title: 'Verify Email' } },
  { path: 'profile', component: ProfilePageComponent, data: { title: 'Profile' } },
  {
    path: 'skin-analysis',
    component: SkinAnalysisPageComponent,
    data: { title: 'Skin Analysis' }
  },
  {
    path: 'skin-type',
    component: SkinTypePageComponent,
    data: { title: 'Skin Type Quiz' }
  },
  { path: 'products', component: ProductPageComponent, data: { title: 'Products' } },
  { path: 'products/:id', component: ProductDetailComponent, data: { title: 'Product Detail' } },
  { path: 'cart', component: CartComponent, outlet: 'modal'},
  {
    path: 'checkout',
    component: CheckoutComponent,
    data: { title: 'Checkout' },
    canActivate: [UserGuard]
  },
  {
    path: 'checkout/callback',
    component: PaystackCallbackComponent,
    data: { title: 'Payment Verification' }
  },
  { path: 'wishlist', component: WishlistComponent, data: { title: 'Wishlist' }, canActivate: [UserGuard] },
  { path: 'orders', component: OrderHistoryComponent, data: { title: 'Order History' }, canActivate: [UserGuard] },
  { path: 'addresses', component: SavedAddressesComponent, data: { title: 'Saved Addresses' }, canActivate: [UserGuard] },
  { path: 'compare', component: ComparisonComponent, data: { title: 'Compare Products' } },
  { path: 'gift-cards', component: GiftCardsComponent, data: { title: 'Gift Cards' } },
  { path: 'support', component: SupportComponent, data: { title: 'Support' } },
  { path: 'shipping', component: ShippingComponent, data: { title: 'Shipping' } },
  { path: 'returns', component: ReturnsComponent, data: { title: 'Returns' } },
  { path: 'contact', component: ContactComponent, data: { title: 'Contact' } },
  { path: 'terms', component: TermsComponent, data: { title: 'Terms & Conditions' } },
  { path: 'privacy', component: PrivacyComponent, data: { title: 'Privacy Policy' } },
  { path: 'adminpage', component: AdminPage , data: { title: 'Admin' }, canActivate: [AdminGuard] },
  { path: 'profilepage', component: ProfilePageComponent , data: { title: 'Profile' }},

  { path: '**', component: NotFoundComponent, data: { title: 'Page Not Found' } },
];
