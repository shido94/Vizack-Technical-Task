import {Routes} from '@angular/router';
import {HomepageComponent} from './homepage/homepage.component';
import {BranchComponent} from './branch/branch.component';
import {DisplayDataComponent} from './display-data/display-data.component';
import {SemesterComponent} from './semester/semester.component';
import {SubjectComponent} from './subject/subject.component';
import {DetailsComponent} from './details/details.component';
import {ViewPdfComponent} from './view-pdf/view-pdf.component';
import {RegisterComponent} from './register/register.component';
import {AuthGuard} from './gaurds/auth.guard';
import {AdminComponent} from './admin/admin.component';
import {DashboardComponent} from './users/dashboard/dashboard.component';
import {UploadComponent} from './upload/upload.component';
import {ProfileComponent} from './users/profile/profile.component';
import {UploadInfoComponent} from './users/upload-info/upload-info.component';


export const myRoutes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomepageComponent
  },
  {
    path: 'branch',
    component: BranchComponent
    // children: [
    //   {
    //     path: 'branch/:id',
    //     component: SemesterComponent
    //   }
    // ],
  },
  {
    path: 'branch/:name',
    component: SemesterComponent
  },
  // {
  //   path: 'it',
  //   component: SemesterComponent
  // },
  {
    path: 'branch/:name/:semester',
    component: SubjectComponent
  },
  {
    path: 'branch/:name/:semester/:id',
    component: DisplayDataComponent
  },
  {
    path: 'id',
    component: DetailsComponent
  },
  {
    path: 'view',
    component: ViewPdfComponent
  },
  {
    path: 'signup',
    canActivate: [AuthGuard],
    component: RegisterComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'uploads',
    component: UploadComponent
  },
  {
    path: 'dashboard/profile',
    component: ProfileComponent
  },
  {
    path: 'uploads/information',
    component: UploadInfoComponent
  }
];
