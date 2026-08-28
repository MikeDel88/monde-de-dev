import {Component, DestroyRef, inject} from "@angular/core";
import {HttpResourceRef} from "@angular/common/http";
import {TopicService} from "../services/topic-service";
import {Topic} from "../models/topic";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TopicCard} from "../../feed/components/topic-card/topic-card";

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.css'],
  imports: [
    TopicCard
  ]
})
export class TopicComponent {

  private topicService = inject(TopicService);
  private destroyRef = inject(DestroyRef);
  topics!: HttpResourceRef<Topic[] | undefined>;

  constructor() {
    this.topics = this.topicService.topics;
    this.topics.reload();
  }

  onSubscribe(topicId: number) {
    this.topicService.subscribe(topicId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => this.topics.reload(),
      });
  }
}
