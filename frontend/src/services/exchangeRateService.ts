    export interface ExchangeRates {
    blue: number;
    oficial: number;
    lastUpdate: Date;
    }

    class ExchangeRateService {
    private static currentRates: ExchangeRates = {
        blue: 1450, // Valor más realista por defecto
        oficial: 917,
        lastUpdate: new Date()
    };

    private static readonly STORAGE_KEY = 'exchangeRates';
    private static readonly UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutos

    static async updateRates(): Promise<ExchangeRates> {
        try {
        console.log('🔄 Actualizando tipo de cambio...');
        
        // Intentar múltiples fuentes de API
        let blueRate = 0;
        let oficialRate = 0;

        // Fuente 1: Bluelytics (más confiable)
        try {
            const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
            if (response.ok) {
            const data = await response.json();
            blueRate = Math.round(data.blue.value_sell);
            oficialRate = Math.round(data.oficial.value_sell);
            console.log('✅ Datos de Bluelytics:', { blueRate, oficialRate });
            }
        } catch (error) {
            console.warn('Bluelytics falló, intentando DolarAPI...');
        }

        if (!blueRate || !oficialRate) {
            const [blueResponse, oficialResponse] = await Promise.all([
            fetch('https://dolarapi.com/v1/dolares/blue'),
            fetch('https://dolarapi.com/v1/dolares/oficial')
            ]);

            if (blueResponse.ok && oficialResponse.ok) {
            const blueData = await blueResponse.json();
            const oficialData = await oficialResponse.json();
            blueRate = blueData.venta;
            oficialRate = oficialData.venta;
            console.log('✅ Datos de DolarAPI:', { blueRate, oficialRate });
            }
        }


        if (!blueRate || !oficialRate) {
            blueRate = 1460;
            oficialRate = 917;
            console.warn('Usando valores por defecto');
        }

        this.currentRates = {
            blue: blueRate,
            oficial: oficialRate,
            lastUpdate: new Date()
        };

        this.saveToStorage();
        console.log('Tipo de cambio actualizado:', this.currentRates);
        
        return this.currentRates;
        } catch (error) {
        console.warn('Error actualizando tipo de cambio, usando valores cacheados:', error);
        this.loadFromStorage();
        return this.currentRates;
        }
    }

    static async getRates(_type: 'blue' | 'oficial' = 'blue'): Promise<ExchangeRates> {
        const shouldUpdate = this.shouldUpdate();
        
        if (shouldUpdate) {
        try {
            await this.updateRates();
        } catch (error) {
            console.warn('No se pudo actualizar, usando cache');
        }
        } else {
        this.loadFromStorage();
        }

        return this.currentRates;
    }

    static async getRate(type: 'blue' | 'oficial' = 'blue'): Promise<number> {
        const rates = await this.getRates(type);
        return rates[type];
        }

    static convertUSDToARS(amountUSD: number, type: 'blue' | 'oficial' = 'blue', includeTax: boolean = true): number {
        const rate = this.currentRates[type];
        let totalUSD = amountUSD;
        
        if (includeTax && type === 'blue') {
        const taxMultiplier = 1.75;
        totalUSD = amountUSD * taxMultiplier;
        }
        
        return Math.round(totalUSD * rate);
    }

    private static shouldUpdate(): boolean {
        const lastUpdate = this.currentRates.lastUpdate;
        const timeSinceUpdate = new Date().getTime() - lastUpdate.getTime();
        return timeSinceUpdate > this.UPDATE_INTERVAL;
    }

    private static saveToStorage(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentRates));
    }

    private static loadFromStorage(): void {
        try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            this.currentRates = {
            ...parsed,
            lastUpdate: new Date(parsed.lastUpdate)
            };
            console.log('📁 Datos cargados desde cache:', this.currentRates);
        }
        } catch (error) {
        console.warn('Error cargando tasas de cambio del localStorage:', error);
        }
    }

    static async forceUpdate(): Promise<ExchangeRates> {
        return await this.updateRates();
    }

    static initialize() {
        this.loadFromStorage();
        
    // Verificar si los datos son muy viejos (> 24 horas)
    const isDataOld = this.shouldUpdate();
        if (isDataOld) {
        console.log('🔄 Datos muy viejos, actualizando...');
        this.updateRates().catch(console.error);
        }
        
        setInterval(() => {
        this.updateRates().catch(console.error);
        }, this.UPDATE_INTERVAL);
    }
}

ExchangeRateService.initialize();

export default ExchangeRateService;