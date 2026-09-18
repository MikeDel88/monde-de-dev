import {Component, DestroyRef, inject, Signal} from "@angular/core";
import {httpResource, HttpResourceRef} from "@angular/common/http";
import {TopicService} from "../services/topic-service";
import {Topic as TopicModel} from "../models/topic";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TopicCard} from "../../../shared/components/topic-card/topic-card";
import {Error} from "../../../shared/components/error/error";
import {Loader} from "../../../shared/components/loader/loader";
import {createErrorState} from "../../../shared/utils/error-state";

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
  topics: HttpResourceRef<TopicModel[] | undefined> = httpResource<TopicModel[]>(() => this.topicService.path);
  private readonly errorState = createErrorState();
  error: Signal<string | undefined> = this.errorState.error;

  onSubscribe(topicId: number) {
    this.topicService.subscribe$(topicId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.errorState.clear();
          this.topics.reload();
        },
        error: (err) => this.errorState.setFromError(err),
      });
  }
}
