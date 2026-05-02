import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Adjective, Noun, WordItem } from '../../services/word.types';
import { Verb } from '../../services/verb.service';
import { Category } from '../../services/word.types';

@Component({
  selector: 'app-word-details',
  templateUrl: './word-details.component.html',
  imports: [CommonModule],
})
export class WordDetailsComponent {
  item = input.required<WordItem>();
  category = input.required<Category>();

  asVerb(item: WordItem): Verb { return item as Verb; }
  asAdjective(item: WordItem): Adjective { return item as Adjective; }
  asNoun(item: WordItem): Noun { return item as Noun; }
}
