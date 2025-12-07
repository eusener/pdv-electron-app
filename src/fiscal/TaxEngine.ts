export interface TaxResult {
    icms: number;
    pis: number;
    cofins: number;
    ibs: number;
    cbs: number;
    total: number;
}

export interface TaxableItem {
    price: number;
    icmsRate: number;
    pisRate: number;
    cofinsRate: number;
    ibsRate: number;
    cbsRate: number;
}

export class TaxEngine {
    constructor(private currentDate: Date = new Date()) { }

    calculate(item: TaxableItem): TaxResult {
        const year = this.currentDate.getFullYear();

        const result: TaxResult = {
            icms: 0, pis: 0, cofins: 0, ibs: 0, cbs: 0, total: 0
        };

        // Regra Legado (Sempre aplica por enquanto)
        result.icms = item.price * (item.icmsRate / 100);
        result.pis = item.price * (item.pisRate / 100);
        result.cofins = item.price * (item.cofinsRate / 100);

        // Regra de Transição (Reforma Tributária)
        // Em 2026 começa a fase de teste
        if (year >= 2026) {
            // Se as alíquotas estiverem zeradas no cadastro, usamos a alíquota de teste padrão
            // Exemplo: IBS 0.1% e CBS 0.9% (Valores hipotéticos de teste)
            const effectiveIbsRate = item.ibsRate > 0 ? item.ibsRate : 0.1;
            const effectiveCbsRate = item.cbsRate > 0 ? item.cbsRate : 0.9;

            result.ibs = item.price * (effectiveIbsRate / 100);
            result.cbs = item.price * (effectiveCbsRate / 100);
        }

        result.total = result.icms + result.pis + result.cofins + result.ibs + result.cbs;

        return result;
    }
}
