import {Component, DestroyRef, inject, signal, WritableSignal} from "@angular/core";
import {httpResource, HttpResourceRef} from "@angular/common/http";
import {TopicService} from "../services/topic-service";
import {Topic as TopicModel} from "../models/topic";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TopicCard} from "../../../shared/components/topic-card/topic-card";
import {Error} from "../../../shared/components/error/error";
import {Loader} from "../../../shared/components/loader/loader";
import {AppError} from "../../../core/models/app-error";

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
  error: WritableSignal<string | undefined> = signal<string | undefined>(undefined);

  onSubscribe(topicId: number) {
    this.topicService.subscribe$(topicId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.error.set(undefined);
          this.topics.reload();
        },
        error: (err: AppError) => this.error.set(err.message),
      });
  }
}
