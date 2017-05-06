import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'about',
  styles: [`
  `],
  template: `
    <h1>Sobre a ONG</h1>
    <div>
      .... ..... ....
    </div>
  `
})
export class AboutComponent {

  public localState: any;
  constructor(
    public route: ActivatedRoute
  ) {}
}
