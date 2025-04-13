// Interface para dados de saúde
export interface HealthData {
  steps: number;
  calories: number;
  distance: number; // em km
  activeMinutes: number;
}

// Interface para dados históricos
export interface HistoricalHealthData {
  date: string; // formato 'YYYY-MM-DD'
  steps: number;
  calories: number;
}

// Classe para simular dados de saúde em ambiente de desenvolvimento
// e preparar para integração com sensores reais
export class HealthService {
  private isNative: boolean;
  private mockSteps: number = 0;
  private mockHistoricalData: HistoricalHealthData[] = [];
  private lastMockUpdate: number = Date.now();
  private trackingInterval: number | null = null;

  constructor() {
    // Verifica se estamos em ambiente nativo ou web
    this.isNative = typeof window !== 'undefined' && 
                   (window as any).Capacitor && 
                   (window as any).Capacitor.isNative;
    
    // Inicializa dados históricos simulados para os últimos 7 dias
    this.initializeMockHistoricalData();
  }

  // Inicializa dados simulados para os últimos 7 dias
  private initializeMockHistoricalData() {
    const today = new Date();
    
    for(let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Dias anteriores têm valores aleatórios entre 3000 e 12000
      const steps = i > 0 ? Math.floor(Math.random() * 9000) + 3000 : 0;
      const calories = Math.floor(steps * 0.04);
      
      this.mockHistoricalData.push({
        date: dateString,
        steps,
        calories
      });
    }
    
    // Hoje começa com 0 passos
    const todayIndex = this.mockHistoricalData.length - 1;
    this.mockSteps = this.mockHistoricalData[todayIndex].steps;
  }

  // Solicita permissão para acessar dados de saúde
  async requestPermissions(): Promise<boolean> {
    if (this.isNative) {
      // Código para solicitar permissões quando exportado para dispositivo real
      // Este código será executado apenas quando o aplicativo estiver rodando em um dispositivo real
      try {
        console.log("Solicitando permissões para acessar dados de saúde");
        // O código comentado abaixo seria usado em um ambiente real
        /*
        const { Health } = Capacitor.Plugins;
        const result = await Health.requestAuthorization({
          permissions: ['steps', 'distance', 'calories', 'activity']
        });
        return result.authorized;
        */
        return true;
      } catch (error) {
        console.error("Erro ao solicitar permissões:", error);
        return false;
      }
    } else {
      // Em ambiente de desenvolvimento, sempre retorna true
      console.log("Modo simulação: permissões concedidas automaticamente");
      return true;
    }
  }

  // Inicia o rastreamento de passos
  async startTracking(): Promise<boolean> {
    if (this.isNative) {
      // Código para iniciar rastreamento em dispositivo real
      try {
        console.log("Iniciando rastreamento em dispositivo real");
        // Implementação para dispositivo real seria aqui
        return true;
      } catch (error) {
        console.error("Erro ao iniciar rastreamento:", error);
        return false;
      }
    } else {
      // Modo simulação - incrementa passos aleatoriamente a cada 3 segundos
      if (this.trackingInterval === null) {
        console.log("Iniciando simulação de passos");
        
        this.trackingInterval = window.setInterval(() => {
          // Adiciona entre 5-20 passos a cada 3 segundos
          const increment = Math.floor(Math.random() * 16) + 5;
          this.mockSteps += increment;
          
          // Atualiza os dados do dia atual
          const todayIndex = this.mockHistoricalData.length - 1;
          this.mockHistoricalData[todayIndex].steps = this.mockSteps;
          this.mockHistoricalData[todayIndex].calories = Math.floor(this.mockSteps * 0.04);
          
          this.lastMockUpdate = Date.now();
        }, 3000);
      }
      return true;
    }
  }

  // Para o rastreamento de passos
  stopTracking(): void {
    if (this.trackingInterval !== null) {
      window.clearInterval(this.trackingInterval);
      this.trackingInterval = null;
      console.log("Simulação de passos interrompida");
    }
    
    if (this.isNative) {
      // Código para parar rastreamento em dispositivo real
      console.log("Parando rastreamento em dispositivo real");
    }
  }

  // Obtém dados de saúde atuais
  async getHealthData(): Promise<HealthData> {
    if (this.isNative) {
      // Código para obter dados de saúde de dispositivo real
      try {
        console.log("Obtendo dados de saúde do dispositivo");
        // Implementação para dispositivo real seria aqui
        // Retornando dados simulados enquanto isso
        return {
          steps: this.mockSteps,
          calories: Math.floor(this.mockSteps * 0.04),
          distance: this.mockSteps * 0.0008,
          activeMinutes: Math.floor(this.mockSteps / 100)
        };
      } catch (error) {
        console.error("Erro ao obter dados de saúde:", error);
        return this.getMockHealthData();
      }
    } else {
      return this.getMockHealthData();
    }
  }

  // Dados simulados para ambiente de desenvolvimento
  private getMockHealthData(): HealthData {
    return {
      steps: this.mockSteps,
      calories: Math.floor(this.mockSteps * 0.04),
      distance: parseFloat((this.mockSteps * 0.0008).toFixed(2)),
      activeMinutes: Math.floor(this.mockSteps / 100)
    };
  }

  // Obtém dados históricos dos últimos 7 dias
  async getHistoricalData(): Promise<HistoricalHealthData[]> {
    if (this.isNative) {
      // Código para obter dados históricos de dispositivo real
      try {
        console.log("Obtendo dados históricos do dispositivo");
        // Implementação para dispositivo real seria aqui
        return [...this.mockHistoricalData];
      } catch (error) {
        console.error("Erro ao obter dados históricos:", error);
        return [...this.mockHistoricalData];
      }
    } else {
      return [...this.mockHistoricalData];
    }
  }

  // Verifica se o rastreamento está ativo
  isTracking(): boolean {
    return this.trackingInterval !== null;
  }

  // Novo método para formatar dados de saúde para o consultor de IA
  formatHealthDataForChat(): string {
    const currentData = this.getMockHealthData();
    const historicalData = this.mockHistoricalData;

    const chatMessage = `
Dados de Atividade Física da Última Semana:

📊 Resumo Semanal:
- Passos Totais: ${currentData.steps.toLocaleString('pt-BR')}
- Calorias Queimadas: ${currentData.calories.toLocaleString('pt-BR')}
- Distância Percorrida: ${currentData.distance.toFixed(2)} km
- Tempo Ativo: ${currentData.activeMinutes} minutos

📅 Histórico Diário de Passos:
${historicalData.map((day, index) => `
${index === historicalData.length - 1 ? '📍 Hoje' : `Dia ${index + 1}`}: 
  - Passos: ${day.steps.toLocaleString('pt-BR')}
  - Calorias: ${day.calories.toLocaleString('pt-BR')}
`).join('\n')}

💡 Avaliação Rápida:
${this.generateHealthInsights(currentData, historicalData)}
`;

    return chatMessage;
  }

  // Método para gerar insights básicos de saúde
  private generateHealthInsights(currentData: HealthData, historicalData: HistoricalHealthData[]): string {
    const averageSteps = historicalData.reduce((sum, day) => sum + day.steps, 0) / historicalData.length;
    const goalSteps = 10000;

    if (currentData.steps < goalSteps * 0.5) {
      return "Você está com um nível de atividade baixo. Tente aumentar seus passos diários, começando com caminhadas curtas.";
    } else if (currentData.steps < goalSteps) {
      return "Você está no caminho certo! Continue aumentando gradualmente sua atividade física.";
    } else {
      return "Excelente trabalho! Você está atingindo metas de atividade física recomendadas.";
    }
  }
}

// Exporta uma instância única do serviço
export const healthService = new HealthService();
