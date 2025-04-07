
import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import NavBar from "@/components/NavBar";
import { Separator } from "@/components/ui/separator";
import { 
  BookText, 
  Utensils, 
  Dumbbell, 
  BarChart3, 
  MessageCircle, 
  HeartHandshake
} from "lucide-react";

const Dashboard = () => {
  const { firstName } = useContext(UserContext);

  // Feature cards data
  const featureCards = [
    {
      title: "Quiz de Bem-estar",
      description: "Responda perguntas sobre seu estilo de vida e receba recomendações personalizadas.",
      icon: BookText,
      link: "/quiz"
    },
    {
      title: "Planos Alimentares",
      description: "Acesse planos alimentares personalizados com base na culinária brasileira.",
      icon: Utensils,
      link: "/meal-plan"
    },
    {
      title: "Plano de Treino",
      description: "Obtenha um plano de exercícios personalizado baseado nos seus objetivos e preferências.",
      icon: Dumbbell,
      link: "/workout-plan"
    },
    {
      title: "Análises Detalhadas",
      description: "Visualize relatórios completos sobre sua saúde e bem-estar.",
      icon: BarChart3,
      link: "/reports"
    },
    {
      title: "Consultor IA",
      description: "Converse com nosso assistente inteligente para tirar dúvidas sobre saúde.",
      icon: MessageCircle,
      link: "/chat"
    },
    {
      title: "Suporte Contínuo",
      description: "Acompanhamento constante da sua evolução com ajustes de recomendações quando necessário.",
      icon: HeartHandshake,
      link: "/support"
    }
  ];

  // Benefits data
  const benefits = [
    {
      number: "1",
      title: "Personalização Completa",
      description: "Recomendações baseadas nas suas necessidades específicas e na cultura brasileira."
    },
    {
      number: "2",
      title: "Fundamentado em Ciência",
      description: "Todas as nossas recomendações são baseadas em pesquisas científicas atualizadas."
    },
    {
      number: "3",
      title: "Suporte Contínuo",
      description: "Acompanhamento constante da sua evolução com ajustes de recomendações quando necessário."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-1">
        {/* Section 1: Header & Hero */}
        <section className="bg-gradient-to-br from-green-400 to-yellow-300 text-white py-12 px-6 md:px-12">
          <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold">
              Bem-vindo ao Wellura App
              {firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-xl max-w-2xl">
              Sua jornada personalizada para uma vida mais saudável, adaptada à cultura brasileira.
            </p>
            
            <Button asChild size="lg" className="bg-white text-green-600 hover:bg-white/90 mt-6">
              <Link to="/quiz">
                Iniciar Quiz de Bem-estar
              </Link>
            </Button>
            
            {/* Highlight Box */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mt-8 border border-white/30 max-w-3xl">
              <p className="text-xl font-medium">
                Vitalidade, cultura e saúde — tudo do seu jeito, tudo do Brasil.
              </p>
            </div>
          </div>
        </section>
        
        {/* Section 2: Features Cards */}
        <section className="py-12 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureCards.map((card, index) => (
                <Card key={index} className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-center w-12 h-12 mb-4 bg-green-100 text-green-600 rounded-full">
                      <card.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground">{card.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={card.link}>Acessar</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Section 3: Why Choose */}
        <section className="py-12 px-6 md:px-12 bg-muted">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Por Que Escolher o Wellura App?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-full mb-4 text-2xl font-bold">
                    {benefit.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
