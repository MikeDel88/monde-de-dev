import {Component, input, output} from '@angular/core';
import {Topic} from "../../../features/topic/models/topic";
import {Button} from "../button/button";
import {Title} from "../title/title";

interface BtnUnsubscribed {
  disabled: boolean;
  text: string;
}

@Component({
  selector: 'app-topic-card',
  imports: [Button, Title],
  templateUrl: './topic-card.html',
})
export class TopicCard {

  readonly topic = input.required<Topic>();
  readonly btnUnsubscribed = input<BtnUnsubscribed>({
    disabled: true,
    text: "Déjà abonné"
  });
  readonly btnSubscribeText = "S'abonner";

  readonly clickTopic = output<number>();

  onClick(topidId: number) {
    this.clickTopic.emit(topidId);
  }

}
