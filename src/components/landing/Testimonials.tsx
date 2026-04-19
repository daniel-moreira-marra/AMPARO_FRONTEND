import { StarRating } from "@/components/ui/StarRating";

const testimonials = [
  {
    name: "Ana Souza",
    age: 38,
    text: "O Amparo mudou a minha vida e a do meu pai. Agora sei que ele está bem cuidado mesmo quando não posso estar lá.",
    image: "/images/testimonial1.jpeg",
  },
  {
    name: "Pedro Fernandes",
    age: 72,
    text: "Graças ao Amparo, sinto-me mais seguro e bem assistido. A equipe é atenciosa e os profissionais são de confiança.",
    image: "/images/testimonial2.jpeg",
  },
  {
    name: "Camila Oliveira",
    age: 45,
    text: "Como enfermeira, é maravilhoso fazer parte de uma rede que valoriza o cuidado com os idosos.",
    image: "/images/testimonial3.jpeg",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-text mb-20">
          O que nossos usuários dizem
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-primary-light/10 p-8 rounded-[2rem] relative flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg -mt-20 mb-6">
                <img
                  src={t.image}
                  alt={`Foto de ${t.name}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <StarRating />

              <h4 className="font-bold text-text text-lg mt-4">
                {t.name}{" "}
                <span className="font-normal text-text/50 text-sm">- {t.age}</span>
              </h4>

              <p className="mt-4 text-text/70 text-center italic leading-relaxed">
                "{t.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
