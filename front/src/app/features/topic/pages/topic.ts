import {Component, DestroyRef, inject} from "@angular/core";
import {HttpResourceRef} from "@angular/common/http";
import {TopicService} from "../services/topic-service";
import {Topic as TopicModel} from "../models/topic";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TopicCard} from "../../../shared/components/topic-card/topic-card";
import {Error} from "../../../shared/components/error/error";
import {Loader} from "../../../shared/components/loader/loader";

@Component({
  selector: 'app-topic',
  templateUrl: './topic.html',
  imports: [
    TopicCard,
    Error,
    Loader
  ]
})
export class Topic {

  private topicService = inject(TopicService);
  private destroyRef = inject(DestroyRef);
  topics: HttpResourceRef<TopicModel[] | undefined> = this.topicService.topics;

  constructor() {
    this.topics.reload();
  }

  onSubscribe(topicId: number) {
    console.log("onSubscribe", topicId);
    this.topicService.subscribe$(topicId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => this.topics.reload(),
      });
  }
}
