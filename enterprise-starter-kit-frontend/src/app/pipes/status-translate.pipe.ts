import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * StatusTranslatePipe - Translates backend enum values to localized strings
 *
 * Usage:
 * {{ 'PAID' | statusTranslate }}
 * {{ invoice.status | statusTranslate }}
 *
 * This pipe automatically prepends 'STATUS.' to the enum value and translates it.
 * For example: 'PAID' becomes 'STATUS.PAID' which is looked up in translation files.
 */
@Pipe({
  name: 'statusTranslate',
  standalone: true,
  pure: false // Makes it reactive to language changes
})
export class StatusTranslatePipe implements PipeTransform {

  constructor(private translate: TranslateService) {}

  transform(value: string | null | undefined, prefix: string = 'STATUS'): string {
    if (!value) {
      return '';
    }

    // Construct the translation key (e.g., STATUS.PAID)
    const key = `${prefix}.${value.toUpperCase()}`;

    // Get the translated value
    const translated = this.translate.instant(key);

    // If translation not found, return the original value
    return translated !== key ? translated : value;
  }
}
