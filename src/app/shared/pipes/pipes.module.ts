import { NgModule } from '@angular/core';
import { TimeAgoPipe } from './time-ago.pipe';

@NgModule({
  declarations: [],
  imports: [TimeAgoPipe],
  exports: [TimeAgoPipe],
  providers: [TimeAgoPipe] // Important: fournir le pipe comme service
})
export class PipesModule {}
