import {Component, OnInit} from '@angular/core';
import {faCopyright} from '@fortawesome/free-regular-svg-icons';
import {faGithub} from '@fortawesome/free-brands-svg-icons';
import {LanguageService} from '../../services/language.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  language = this.languageService.translate.currentLang;
  copyrightIcon = faCopyright;
  githubIcon = faGithub;

  constructor(
    private languageService: LanguageService,
  ) {
  }

  ngOnInit(): void {
  }

}
