import { Component, OnInit } from '@angular/core';

const NAVIGATION = [
  {
    label: 'HOME',
    url: 'home'
  },
  {
    label: 'WORKSHOPS',
    url: 'workshops',
    children: [
      {
        label: 'Angular Intro',
        url: 'workshops/angular-intro'
      },
      {
        label: 'Angular Mastery',
        url: 'workshops/angular-mastery'
      }
    ]
  }
];

@Component({
  selector: 'tt-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  navigation = NAVIGATION;

  constructor() {}

  ngOnInit() {}
}
