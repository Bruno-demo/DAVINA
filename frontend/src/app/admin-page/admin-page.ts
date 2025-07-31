import { Component } from '@angular/core';
import { Userlistadmin } from '../userlistadmin/userlistadmin';
import { OrderlistAdmin } from '../orderlist-admin/orderlist-admin';
import { ProductlistAdmin } from '../productlist-admin/productlist-admin';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [Userlistadmin, OrderlistAdmin, ProductlistAdmin],
  templateUrl: './admin-page.html',
  styleUrls: ['./admin-page.css']
})
export class AdminPage {

}
