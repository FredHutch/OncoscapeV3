import { Subscription } from 'rxjs';
import { DatasetService } from './../../../service/dataset.service';
import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

@Component({
  selector: 'app-workspace-loader',
  styleUrls: ['./loader.component.scss'],
  templateUrl: './loader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class LoaderComponent implements AfterViewInit, OnDestroy {
  public quote: any;
  public quotes: any;
  public showEllipsis = true;
  private loaderStatusUpdateSubscription: Subscription;
  @Input()
  set visbibility(value: boolean) {}
  onLoaderStatusUpdate(msg: string): void {
    this.showEllipsis = false;
    this.quote = {
      q: 'Hang tight... Loading this dataset for the first time',
      a: msg
    };
    this.cd.detectChanges();
  }
  ngOnDestroy(): void {
    this.loaderStatusUpdateSubscription.unsubscribe();
  }
  ngAfterViewInit(): void {}
  constructor(
    public datasetService: DatasetService,
    private cd: ChangeDetectorRef
  ) {
    this.loaderStatusUpdateSubscription = this.datasetService.loaderStatusUpdate.subscribe(
      this.onLoaderStatusUpdate.bind(this)
    );
    this.quotes = [
      // {
      //   q: 'Anyone who struggles hard with a problem never forgets it',
      //   a: 'Elon Musk'
      // },
      // {
      //   q: "Don't quote me on this... but",
      //   a: 'Michael Zager'
      // },
      // {
      //   q:
      //     'You can sniff out when people are fudging their accomplishments by digging for the details',
      //   a: 'Elon Musk'
      // },
      // {
      //   q: 'Only two things are infinite, the universe and human stupidity',
      //   a: 'Albert Einstein'
      // },
      // {
      //   q: 'Biology is the least of what makes someone a mother',
      //   a: 'Oprah Winfrey'
      // },
      { q: 'All models are wrong, but some are useful', a: 'George Box' },
      {
        q: 'The best model of a cat is another cat, preferably the same cat',
        a: 'Norbert Wiener'
      },
      {
        q:
          'You cannot teach a man anything; you can only help him discover it in himself',
        a: 'Galileo'
      },
      {
        q:
          'A man with a watch knows what time it is. A man with two watches is never sure',
        a: 'Arthur Block'
      },
      // {
      //   // tslint:disable-next-line:quotemark
      //   q: "Never be limited by other people's limited imaginations",
      //   a: 'Mae Jemison'
      // },
      // {
      //   q:
      //     'As always in life, people want a simple answer... and it???s always wrong',
      //   a: 'Susan Greenfield'
      // },
      {
        q:
          'All sorts of things can happen when you???re open to new ideas and playing around with things',
        a: 'Stephanie Kwolek'
      },
      {
        q: 'Science and everyday life cannot and should not be separated',
        a: 'Rosalind Franklin'
      },
      // {
      //   q:
      //     'If your experiment needs statistics, you ought to have done a better experiment',
      //   a: 'Ernest Rutherford'
      // },
      // { q: 'Statistics are no substitute for judgement', a: 'Henry Clay' },
      // { q: 'Facts are stubborn, but statistics are pliable', a: 'Mark Twain' },
      {
        q:
          'The minimum we should hope for with any display technology is that it should do no harm',
        a: 'Edward Tufte'
      },
      {
        q:
          'The commonality between science and art is in trying to see profoundly',
        a: 'Edward Tufte'
      },
      {
        q: 'Science is beautiful when it makes simple explanations',
        a: 'Stephen Hawking'
      },
      // {
      //   q: 'I think computer viruses should count as life',
      //   a: 'Stephen Hawking'
      // },
      // {
      //   q:
      //     'There could be shadow galaxies, shadow stars, and even shadow people',
      //   a: 'Stephen Hawking'
      // },
      // {
      //   q: 'I was not a good student - I was too busy enjoying myself',
      //   a: 'Stephen Hawking'
      // },
      // {
      //   q: 'If you torture the data long enough, it will confess to anything',
      //   a: 'Ronald Coase'
      // },
      // { q: 'Nothing cannot exist forever', a: 'Stephen Hawking' },
      // {
      //   q:
      //     'Statistics are used much like a drunk uses a lamppost: for support, not illumination',
      //   a: 'Vin Scully'
      // },
      {
        q: 'Imagination is more important than knowledge',
        a: 'Albert Einstein'
      },
      { q: 'Not everything that can be counted counts', a: 'Albert Einstein' },
      { q: 'Curiosity has its own reason for existing', a: 'Albert Einstein' },
      { q: 'Once you stop learning, you start dying', a: 'Albert Einstein' },
      { q: 'Our technology has exceeded our humanity', a: 'Albert Einstein' },
      {
        q: 'I have no special talent - I am only passionately curious',
        a: 'Albert Einstein'
      },
      {
        q:
          'Science is a way of thinking much more than it is a body of knowledge',
        a: 'Carl Sagan'
      },
      { q: 'Absence of evidence is not evidence of absence', a: 'Carl Sagan' },
      {
        q:
          'The universe is not required to be in perfect harmony with human ambition',
        a: 'Carl Sagan'
      },
      {
        q:
          'The dangers of not thinking clearly are much greater now than ever before',
        a: 'Carl Sagan'
      },
      {
        q:
          'Errors using inadequate data are much less than those using no data at all',
        a: 'Charles Babbage'
      },
      {
        q:
          'Perhaps it would be better for science, that all criticism should be avowed',
        a: 'Charles Babbage'
      },
      {
        q:
          // tslint:disable-next-line:quotemark
          "We're entering a new world in which data may be more important than software",
        // tslint:disable-next-line:quotemark
        a: "Tim O'Reilly"
      },
      {
        q:
          'An invention has to make sense in the world it finishes in, not in the world it started',
        // tslint:disable-next-line:quotemark
        a: "Tim O'Reilly"
      },
      {
        q:
          'Data is a precious thing and will last longer than the systems themselves',
        a: 'Tim Berners-Lee'
      },
      {
        q: 'The science of today is the technology of tomorrow',
        a: 'Edward Teller'
      },
      {
        q:
          'Evolution is the fundamental idea in all of life science - in all of biology',
        a: 'Bill Nye'
      },
      // {
      //   q: 'Biology has at least 50 more interesting years',
      //   a: 'James D. Watson'
      // },
      {
        q:
          'DNA - is technology. It is coding. It is physical coding, but still code.',
        a: 'Ryan Bethencourt'
      },
      // { q: 'Lies damn lies and statistics', a: 'Mark Twain' },
      {
        // tslint:disable-next-line:quotemark
        q: "Biology is now accelerating at a pace faster than Moore's Law",
        a: 'Arvind Gupta'
      },
      {
        q: 'Science is organized knowledge. Wisdom is organized life',
        a: 'Immanuel Kant'
      },
      {
        q:
          'The art and science of asking questions is the source of all knowledge',
        a: 'Thomas Berger'
      },
      // tslint:disable-next-line:max-line-length
      // {
      //   q:
      //     'Our scientific power has outrun our spiritual power. We have guided missiles and misguided men.',
      //   a: 'Martin Luther King'
      // },
      // {
      //   // tslint:disable-next-line:quotemark
      //   q: "Research is what I'm doing when I don't know what I'm doing",
      //   a: 'Wernher von Braun'
      // },
      {
        q: 'Medicine is a science of uncertainty and an art of probability',
        a: 'William Osler'
      },
      {
        q:
          'Science is the great antidote to the poison of enthusiasm and superstition',
        a: 'Adam Smith'
      },
      {
        q: 'Everything is theoretically impossible, until it is done',
        a: 'Robert A. Heinlein'
      },
      {
        // tslint:disable-next-line:quotemark
        q: "Science is what you know, philosophy is what you don't know",
        a: 'Bertrand Russell'
      },
      // {
      //   q: 'Science never solves a problem without creating ten more',
      //   a: 'George Bernard Shaw'
      // },
      // {
      //   q: 'The fewer the facts, the stronger the opinion',
      //   a: 'Arnold H. Glasow'
      // },
      {
        q: 'Science is the captain, and practice the soldiers',
        a: 'Leonardo da Vinci'
      },
      {
        q:
          'It is through science that we prove, but through intuition that we discover',
        a: 'Henri Poincare'
      },
      {
        q: 'By denying scientific principles, one may maintain any paradox',
        a: 'Galileo Galilei'
      },
      {
        q: 'Science is the father of knowledge, but opinion breeds ignorance',
        a: 'Hippocrates'
      },
      // {
      //   q: 'In science, we must be interested in things, not in persons',
      //   a: 'Marie Curie'
      // },
      // {
      //   q: 'It should be mandatory that you understand computer science',
      //   a: 'will.i.am'
      // },
      // {
      //   q:
      //     'Science is a differential equation. Religion is a boundary condition.',
      //   a: 'Alan Turing'
      // },
      // {
      //   q: 'Some say they see poetry in my paintings; I see only science',
      //   a: 'Georges Seurat'
      // },
      {
        q:
          'Imagination is the key to my lyrics. The rest is painted with a little science fiction.',
        a: 'Jimi Hendrix'
      },
      // {
      //   q: 'All science is either physics or stamp collecting.',
      //   a: 'Ernest Rutherford'
      // },
      // {
      //   q: 'Music is science. Everything is science. Because science is truth.',
      //   a: 'Chuck Berry'
      // },
      {
        q:
          'Human Nature is the only science of man; and yet has been hitherto the most neglected.',
        a: 'David Hume'
      },
      {
        q:
          'Science may be described as the art of systematic over-simplification.',
        a: 'Karl Popper'
      },
      {
        q:
          'There are no such things as applied sciences, only applications of science.',
        a: 'Louis Pasteur'
      }
    ];
    const i = Math.floor(Math.random() * this.quotes.length);
    this.quote = this.quotes[i];
  }
}
