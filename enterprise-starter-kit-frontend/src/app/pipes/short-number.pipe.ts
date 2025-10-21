import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../services/settings.service';

/**
 * ShortNumberPipe - Formats large numbers into compact notation
 *
 * Usage:
 * {{ 1500 | shortNumber }} → 1.5K (uses saved currency)
 * {{ 1500000 | shortNumber }} → $1.5M (uses saved currency)
 * {{ 3333333333 | shortNumber }} → $3.33B
 * {{ 3333333333 | shortNumber:'€' }} → €3.33B (custom prefix)
 * {{ 3333333333 | shortNumber:'' }} → 3.33B (no prefix)
 *
 * Supports: K (thousands), M (millions), B (billions), T (trillions)
 */
@Pipe({
  name: 'shortNumber',
  standalone: true,
  pure: false // Required to react to language changes
})
export class ShortNumberPipe implements PipeTransform {
  private settingsService = inject(SettingsService);
  private translateService = inject(TranslateService);

  transform(value: number | null | undefined, prefix?: string): string {
    if (value === null || value === undefined || isNaN(value)) {
      return this.formatOutput(0, prefix);
    }

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    let formattedValue: string;
    let suffix = '';

    if (absValue >= 1_000_000_000) {
      formattedValue = (absValue / 1_000_000_000).toFixed(2);
      suffix = 'B';
    } else if (absValue >= 1_000_000) {
      formattedValue = (absValue / 1_000_000).toFixed(2);
      suffix = 'M';
    } else if (absValue >= 1_000) {
      formattedValue = (absValue / 1_000).toFixed(2);
      suffix = 'K';
    } else {
      formattedValue = absValue.toFixed(2);
    }

    // Remove .00 if present
    if (formattedValue.endsWith('.00')) {
      formattedValue = formattedValue.slice(0, -3);
    }

    return this.formatOutput(value, prefix, formattedValue, suffix, sign);
  }

  private formatOutput(originalValue: number, prefix?: string, formattedNum?: string, suffix?: string, sign: string = ''): string {
    const lang = this.translateService.currentLang;
    const currency = this.getPrefix(prefix);

    // Default values if not processed (e.g. 0)
    let numStr = formattedNum || Math.abs(originalValue).toFixed(2);
    if (numStr.endsWith('.00')) numStr = numStr.slice(0, -3);

    if (lang === 'ar') {
      // formatting
      const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      const arabicNum = numStr.replace(/\d/g, d => arabicDigits[parseInt(d)]);

      let arabicSuffix = '';
      switch (suffix) {
        case 'K': arabicSuffix = '\u00A0ألف'; break;
        case 'M': arabicSuffix = '\u00A0مليون'; break;
        case 'B': arabicSuffix = '\u00A0مليار'; break;
        case 'T': arabicSuffix = '\u00A0تريليون'; break;
      }

      // We use direction override to ensure it flows correctly
      return `${sign}${arabicNum}${arabicSuffix}\u00A0${currency}`;
    }

    // English/Default formatting
    return `${sign}${currency}${numStr}${suffix || ''}`;
  }

  private getPrefix(customPrefix?: string): string {
    // If explicit prefix is provided (even empty string), use it
    if (customPrefix !== undefined) {
      return customPrefix;
    }
    // Otherwise use the currency symbol from settings
    return this.settingsService.getCurrencySymbol();
  }
}
