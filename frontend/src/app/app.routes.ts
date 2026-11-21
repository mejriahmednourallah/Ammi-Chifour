import { Routes } from '@angular/router';
import { TabsPage } from './pages/tabs/tabs.page';
import { SearchPage } from './pages/search/search.page';
import { BoardPage } from './pages/board/board.page';
import { FavoritesPage } from './pages/favorites/favorites.page';
import { StaffPage } from './pages/staff/staff.page';

export const routes: Routes = [
  { path: '', redirectTo: 'tabs/search', pathMatch: 'full' },
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      { path: 'search', component: SearchPage },
      { path: 'board', component: BoardPage },
      { path: 'favorites', component: FavoritesPage },
      { path: 'staff', component: StaffPage },
      { path: '', redirectTo: 'search', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'tabs/search' }
];
