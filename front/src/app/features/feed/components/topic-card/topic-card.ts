import {Component, input, output} from '@angular/core';
import {Topic} from "../../../topic/models/topic";
import {NgClass} from "@angular/common";

type BtnUnsubscribed = {
  disabled: boolean;
  text: string;
}

@Component({
  selector: 'app-topic-card',
  imports: [
    NgClass
  ],
  templateUrl: './topic-card.html',
  styleUrl: './topic-card.css',
})
export class TopicCard {

  readonly topic = input.required<Topic>();
  readonly btnUnsubscribed = input<BtnUnsubscribed>({
    disabled: true,
    text: "Déjà abonné"
  });
  readonly btnSubscribeText = "S'abonner";

  onClickSubscribe = output<number>();
  onClickUnsubscribe = output<number>();

  onSubscribe(topidId: number) {
    this.onClickSubscribe.emit(topidId);
  }

  onUnsubscribe(topidId: number) {
    this.onClickUnsubscribe.emit(topidId);
  }
}
