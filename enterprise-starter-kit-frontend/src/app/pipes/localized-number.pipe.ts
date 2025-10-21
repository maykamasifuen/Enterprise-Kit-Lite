import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'localizedNumber',
    standalone: true,
    pure: false
})
export class LocalizedNumberPipe implements PipeTransform {
    private translateService = inject(TranslateService);

    transform(value: number | string | null | undefined): string {
        if (value === null || value === undefined) return '';

        const strValue = value.toString();
        if (this.translateService.currentLang !== 'ar') {
            return strValue;
        }

        const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return strValue.replace(/\d/g, d => arabicDigits[parseInt(d)]);
    }
}
