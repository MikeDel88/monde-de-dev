import {Component, DestroyRef, inject} from "@angular/core";
import {httpResource, HttpResourceRef} from "@angular/common/http";
import {TopicService} from "../services/topic-service";
import {Topic as TopicModel} from "../models/topic";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TopicCard} from "../../../shared/components/topic-card/topic-card";
import {ErrorMessage} from "../../../shared/components/error-message/error-message";
import {Loader} from "../../../shared/components/loader/loader";
import {ToastService} from "../../../core/services/toast-service";

@Component({
  selector: 'app-topic',
  templateUrl: './topic.html',
  imports: [
    TopicCard,
    ErrorMessage,
    Loader
  ]
})
export class Topic {

  private readonly topicService = inject(TopicService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  topics: HttpResourceRef<TopicModel[] | undefined> = httpResource<TopicModel[]>(() => this.topicService.path);

  onSubscribe(topicId: number) {
    this.topicService.subscribe$(topicId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.toastService.clear();
          this.topics.reload();
        },
        error: (err) => this.toastService.showError(err),
      });
  }
}
