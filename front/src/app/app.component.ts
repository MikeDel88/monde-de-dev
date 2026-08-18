import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TopicComponent } from './topic/topic.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [TopicComponent]
})
export class AppComponent {
  title = 'mdd-client';
}
